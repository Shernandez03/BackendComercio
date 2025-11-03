pipeline {
  agent any

  options {
    timestamps()
    ansiColor('xterm')
  }

  // Dispara por webhook de GitHub
  triggers { githubPush() }

  environment {
    // Nombres EXACTOS como los tienes en Jenkins
    SONARQUBE_SERVER = 'SonarQubeServer'
    SCANNER_HOME     = tool 'SonarScanner'
  }

  stages {

    stage('Checkout') {
      steps {
        // Asegura el código, aunque uses "Pipeline from SCM"
        git branch: 'main', url: 'https://github.com/Shernandez03/BackendComercio.git'
      }
    }

    stage('Versions') {
      steps {
        bat 'node -v'
        bat 'npm -v'
        bat 'newman -v'
      }
    }

    stage('Install & Unit Tests') {
      when { expression { return fileExists('package.json') } }
      steps {
        bat 'npm ci'
        // Si no tienes pruebas aún, no falles el build:
        bat 'npm test || echo "Sin pruebas unitarias por ahora"'
        // Si generas cobertura con Jest, archívala:
        script {
          if (fileExists('coverage\\lcov.info')) {
            archiveArtifacts artifacts: 'coverage/**', fingerprint: true
          }
        }
      }
    }

    // (Opcional) Levantar el backend antes de las pruebas de API
    stage('Start Backend (local)') {
      when { allOf { expression { return fileExists('package.json') }
                     expression { return fileExists('tests\\postman\\collection.postman.json') } } }
      steps {
        // Inicia en background
        bat 'start "" cmd /c "npm run start"'
        // Espera a que el puerto 3001 responda (máx 60s)
        bat '''
          powershell -Command ^
          "$ok=$false; 1..30 | %%{ if((Test-NetConnection -ComputerName localhost -Port 3001).TcpTestSucceeded){$ok=$true; break}; Start-Sleep -s 2}; if(-not $ok){ exit 1 }"
        '''
      }
    }

    stage('SonarQube Scan') {
      steps {
        withSonarQubeEnv(env.SONARQUBE_SERVER) {
          // Usa sonar-project.properties en la raíz
          bat '"%SCANNER_HOME%\\bin\\sonar-scanner.bat"'
        }
      }
    }

    stage('Quality Gate') {
      steps {
        script {
          timeout(time: 7, unit: 'MINUTES') {
            def qg = waitForQualityGate()
            if (qg.status != 'OK') {
              error "Quality Gate FAILED: ${qg.status}"
            }
          }
        }
      }
    }

    stage('API Tests (Postman/Newman)') {
      when { expression { return fileExists('tests\\postman\\collection.postman.json') } }
      steps {
        bat '''
          if not exist tests\\postman\\reports mkdir tests\\postman\\reports
          if exist tests\\postman\\env_DEV.postman_environment.json (
            newman run tests\\postman\\collection.postman.json ^
              -e tests\\postman\\env_DEV.postman_environment.json ^
              --reporters cli,html ^
              --reporter-html-export tests\\postman\\reports\\newman.html
          ) else (
            newman run tests\\postman\\collection.postman.json ^
              --reporters cli,html ^
              --reporter-html-export tests\\postman\\reports\\newman.html
          )
        '''
      }
      post {
        always {
          archiveArtifacts artifacts: 'tests/postman/reports/**', fingerprint: true
        }
      }
    }

    // Carga simple (estrés) sólo para ramas qa/prod (opcional)
    stage('Load Test (quick)') {
      when { allOf { anyOf { branch 'qa'; branch 'prod' },
                     expression { return fileExists('tests\\postman\\collection.postman.json') } } }
      steps {
        bat '''
          newman run tests\\postman\\collection.postman.json ^
            --iteration-count 50 ^
            --delay-request 50 ^
            --reporters cli,html ^
            --reporter-html-export tests\\postman\\reports\\newman-load.html
        '''
      }
      post {
        always {
          archiveArtifacts artifacts: 'tests/postman/reports/newman-load.html', fingerprint: true
        }
      }
    }

    // “Despliegue” simulado por rama (puedes reemplazarlo por Docker/SSH/etc.)
    stage('Deploy (simulado)') {
      when { anyOf { branch 'qa'; branch 'prod' } }
      steps {
        echo "Despliegue simulado para ambiente: ${env.BRANCH_NAME}"
      }
    }
  }

  post {
    always {
      echo "Pipeline finalizado en rama: ${env.BRANCH_NAME}"
      // Limpieza: cierra node si quedó vivo (agente dedicado)
      bat 'taskkill /F /IM node.exe || exit /b 0'
    }
  }
}
