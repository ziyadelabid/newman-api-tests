pipeline {
  agent any

  environment {
    PORT = '4444'
    TOKEN_SECRET = 'dev-secret'
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Install') {
      steps {
        sh 'corepack enable'
        sh 'pnpm --version'
        sh 'pnpm install --frozen-lockfile'
      }
    }

    stage('Build') {
      steps { sh 'pnpm run build' }
    }

    stage('Newman (flaky on purpose)') {
      steps { sh 'bash scripts/run-newman-ci.sh' }
      post {
        always {
          junit allowEmptyResults: true, testResults: 'reports/newman.xml'
          archiveArtifacts allowEmptyArchive: true, artifacts: 'reports/**'
        }
      }
    }
  }
}

