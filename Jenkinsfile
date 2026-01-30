pipeline {
  agent any

  tools {
    // Requires the Jenkins "NodeJS" plugin + a configured Node installation with this name.
    nodejs 'node20'
  }

  environment {
    PORT = '4444'
    TOKEN_SECRET = 'dev-secret'
  }

  stages {
    stage('Install / Build / Newman') {
      steps {
        sh 'node --version'
        sh 'npm --version'
        sh 'npm i -g pnpm@9'
        sh 'pnpm --version'
        sh 'pnpm install --frozen-lockfile'
        sh 'pnpm run build'
        sh 'bash scripts/run-newman-ci.sh'
      }
      post {
        always {
          junit allowEmptyResults: true, testResults: 'reports/newman.xml'
          archiveArtifacts allowEmptyArchive: true, artifacts: 'reports/**'
        }
      }
    }
  }
}
