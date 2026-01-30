import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';

type JwtHeader = { alg: 'HS256'; typ: 'JWT' };
type JwtPayload = { sub: string; email: string; iat: number };

function base64UrlEncode(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecodeToBuffer(value: string): Buffer {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + '='.repeat(padLength);
  return Buffer.from(padded, 'base64');
}

function jsonToB64Url(value: unknown): string {
  return base64UrlEncode(Buffer.from(JSON.stringify(value), 'utf8'));
}

function b64UrlToJson<T>(value: string): T {
  const raw = base64UrlDecodeToBuffer(value).toString('utf8');
  return JSON.parse(raw) as T;
}

@Injectable()
export class TokenService {
  private readonly secret = process.env.TOKEN_SECRET ?? 'dev-secret';

  sign(payload: Omit<JwtPayload, 'iat'>): string {
    const header: JwtHeader = { alg: 'HS256', typ: 'JWT' };
    const fullPayload: JwtPayload = { ...payload, iat: Date.now() };

    const encodedHeader = jsonToB64Url(header);
    const encodedPayload = jsonToB64Url(fullPayload);
    const data = `${encodedHeader}.${encodedPayload}`;
    const signature = this.signData(data);
    return `${data}.${signature}`;
  }

  verify(token: string): JwtPayload {
    const parts = token.split('.');
    if (parts.length !== 3) throw new UnauthorizedException('Invalid token');

    const [encodedHeader, encodedPayload, signature] = parts;
    let header: JwtHeader;
    let payload: JwtPayload;
    try {
      header = b64UrlToJson<JwtHeader>(encodedHeader);
      payload = b64UrlToJson<JwtPayload>(encodedPayload);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
    if (header.alg !== 'HS256') throw new UnauthorizedException('Invalid token');

    const data = `${encodedHeader}.${encodedPayload}`;
    const expected = this.signData(data);

    const signatureBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expected);
    if (
      signatureBuf.length !== expectedBuf.length ||
      !timingSafeEqual(signatureBuf, expectedBuf)
    ) {
      throw new UnauthorizedException('Invalid token');
    }

    return payload;
  }

  private signData(data: string): string {
    const digest = createHmac('sha256', this.secret).update(data).digest();
    return base64UrlEncode(digest);
  }
}
