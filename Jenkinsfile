pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/Shernandez03/BackendComercio.git'
            }
        }

        stage('Build') {
            steps {
                echo 'Compilando el proyecto...'
            }
        }

        stage('Test') {
            steps {
                echo 'Ejecutando pruebas...'
            }
        }
    }
}
