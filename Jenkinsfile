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

    stage('Install / Build / Newman') {
      steps {
        script {
          docker.image('node:20-bullseye').inside('-u root:root') {
            sh 'corepack enable'
            sh 'pnpm --version'
            sh 'pnpm install --frozen-lockfile'
            sh 'pnpm run build'
            sh 'bash scripts/run-newman-ci.sh'
          }
        }
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
