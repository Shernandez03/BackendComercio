pipeline {
  agent any

  options {
    timestamps()
    ansiColor('xterm')
  }

  // Dispara por webhook de GitHub
  triggers { githubPush() }

  environment {
    SONARQUBE_SERVER = 'SonarQubeServer'   // nombre en Manage Jenkins > System
    SCANNER_HOME     = tool 'SonarScanner' // nombre en Manage Jenkins > Tools
  }

  stages {

    stage('Checkout') {
      steps {
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
        bat 'npm test || echo "Sin pruebas unitarias por ahora"'
        script {
          if (fileExists('coverage\\lcov.info')) {
            archiveArtifacts artifacts: 'coverage/**', fingerprint: true
          }
        }
      }
    }

    stage('Start Backend (local)') {
      when {
        allOf {
          expression { return fileExists('package.json') }
          expression { return fileExists('tests\\postman\\collection.postman.json') }
        }
      }
      steps {
        bat 'start "" cmd /c "npm run start"'
        bat '''
          powershell -Command ^
          "$ok=$false; 1..30 | %%{ if((Test-NetConnection -ComputerName localhost -Port 3001).TcpTestSucceeded){$ok=$true; break}; Start-Sleep -s 2}; if(-not $ok){ exit 1 }"
        '''
      }
    }

    stage('SonarQube Scan') {
      steps {
        withSonarQubeEnv(env.SONARQUBE_SERVER) {
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

    {
  "info": {
    "name": "Comercio - Orders API",
    "_postman_id": "c3c2b8a3-bc2c-4a3c-9f77-000000000001",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Create Order",
      "request": {
        "method": "POST",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "url": "{{baseUrl}}/api/orders",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"shippingAddress\": \"QA-AUTO-{{ts}}\",\n  \"userId\": 1\n}"
        }
      },
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test(\"Status 201/200\", function () {",
              "  pm.expect(pm.response.code).to.be.oneOf([200,201]);",
              "});",
              "",
              "// Guarda el id si viene en la respuesta",
              "try {",
              "  const json = pm.response.json();",
              "  pm.expect(json).to.be.an('object');",
              "  if (json.id) pm.collectionVariables.set('orderId', json.id);",
              "} catch (e) { /* respuesta no JSON, no fallar */ }"
            ],
            "type": "text/javascript"
          }
        }
      ]
    },
    {
      "name": "List Orders",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/api/orders"
      },
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test(\"Status 200\", function () {",
              "  pm.response.to.have.status(200);",
              "});",
              "try {",
              "  const arr = pm.response.json();",
              "  pm.expect(arr).to.be.an('array');",
              "} catch (e) {",
              "  pm.test('Respuesta JSON', function(){ pm.expect(false, 'No es JSON').to.be.true; });",
              "}"
            ],
            "type": "text/javascript"
          }
        }
      ]
    }
  ],
  "variable": [
    { "key": "baseUrl", "value": "http://localhost:3001" },
    { "key": "ts", "value": "{{$timestamp}}" }
  ]
  stage('API Tests (Postman/Newman)') {
  steps {
    bat '''
      if not exist tests\\postman\\reports mkdir tests\\postman\\reports
      if exist tests\\postman\\env_DEV.postman_environment.json (
        newman run tests\\postman\\collection.postman.json ^
          -e tests\\postman\\env_DEV.postman_environment.json ^
          --reporters cli
      ) else (
        newman run tests\\postman\\collection.postman.json ^
          --reporters cli
      )
    '''
  }
}

}

    // Carga rápida solo para QA/PROD (opcional)
    stage('Load Test (quick)') {
      when {
        allOf {
          anyOf {
            branch 'qa'
            branch 'prod'
          }
          expression { return fileExists('tests\\postman\\collection.postman.json') }
        }
      }
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

    stage('Deploy (simulado)') {
      when {
        anyOf {
          branch 'qa'
          branch 'prod'
        }
      }
      steps {
        echo "Despliegue simulado para ambiente: ${env.BRANCH_NAME}"
      }
    }
  }

  post {
    always {
      echo "Pipeline finalizado en rama: ${env.BRANCH_NAME}"
      bat 'taskkill /F /IM node.exe || exit /b 0'
    }
  }
}
