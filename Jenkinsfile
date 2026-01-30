pipeline {
  agent any

  environment {
    PORT = '4444'
    TOKEN_SECRET = 'dev-secret'
  }

  stages {
    stage('Install / Build / Newman') {
      agent {
        docker {
          image 'node:20-bullseye'
          args '-u root:root'
        }
      }
      steps {
        sh 'corepack enable'
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
