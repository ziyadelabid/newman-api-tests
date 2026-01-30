import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';

export type UserRecord = {
  id: string;
  email: string;
  password: string;
  createdAt: number;
};

export type PublicUser = Omit<UserRecord, 'password'>;

function toPublicUser(user: UserRecord): PublicUser {
  // intentionally "boring" projection; keep demo easy
  const { password: _password, ...rest } = user;
  return rest;
}

@Injectable()
export class InMemoryStore {
  private readonly usersById = new Map<string, UserRecord>();
  private readonly userIdByEmail = new Map<string, string>();

  constructor() {
    this.seed();
  }

  private seed() {
    // Seed a predictable user so the demo can always "log in" first.
    this.createUser('demo@example.com', 'password');
  }

  createUser(email: string, password: string): PublicUser {
    const existingId = this.userIdByEmail.get(email.toLowerCase());
    if (existingId) throw new ConflictException('Email must be unique');

    const user: UserRecord = {
      id: randomUUID(),
      email,
      password,
      createdAt: Date.now(), // intentionally time-based (flaky test bait)
    };

    this.usersById.set(user.id, user);
    this.userIdByEmail.set(email.toLowerCase(), user.id);
    return toPublicUser(user);
  }

  getUserById(id: string): PublicUser {
    const user = this.usersById.get(id);
    if (!user) throw new NotFoundException('User not found');
    return toPublicUser(user);
  }

  getUserRecordByEmail(email: string): UserRecord | null {
    const id = this.userIdByEmail.get(email.toLowerCase());
    if (!id) return null;
    return this.usersById.get(id) ?? null;
  }

  getUserRecordById(id: string): UserRecord | null {
    return this.usersById.get(id) ?? null;
  }

  deleteUser(id: string) {
    const user = this.usersById.get(id);
    if (!user) throw new NotFoundException('User not found');

    this.usersById.delete(id);
    this.userIdByEmail.delete(user.email.toLowerCase());
  }
}

