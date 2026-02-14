pipeline {
    agent any

    tools {
        nodejs "Node 18"
    }

    environment {
       REACT_APP_API_URL = "${env.REACT_APP_API_URL}"
        CI = "true"
        NODE_ENV = 'development'
        NPM_CONFIG_PRODUCTION = 'false'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Environment Check') {
            steps {
                echo 'Checking environment...'
                bat '''
                    echo "=== Environment Information ==="
                    node --version
                    npm --version
                    echo "Workspace: %WORKSPACE%"
                    echo "NODE_ENV: %NODE_ENV%"
                    echo "CI: %CI%"
                    
                    echo "=== Checking package files ==="
                    if exist "package.json" (
                        echo "package.json exists"
                    ) else (
                        echo "ERROR: package.json not found"
                        exit 1
                    )
                    
                    if exist "package-lock.json" (
                        echo "package-lock.json exists"
                    ) else (
                        echo "WARNING: package-lock.json not found"
                    )
                '''
            }
        }

        stage('Clean Cache') {
            steps {
                echo 'Cleaning npm cache...'
                bat '''
                    if exist "node_modules" rmdir /s /q node_modules
                    if exist "package-lock.json" del package-lock.json
                    npm cache clean --force
                '''
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo 'Installing dependencies...'
                bat '''
                    npm install
                    echo "=== Verifying Installation ==="
                    npm list --depth=0
                    if exist "node_modules" (
                        echo "node_modules directory created successfully"
                    ) else (
                        echo "ERROR: node_modules directory not created"
                        exit 1
                    )
                    
                    echo "=== Checking key dependencies ==="
                    if exist "node_modules\\.bin\\eslint.cmd" (
                        echo "ESLint installed successfully"
                    ) else (
                        echo "WARNING: ESLint not found in node_modules"
                    )
                    
                    if exist "node_modules\\.bin\\tsc.cmd" (
                        echo "TypeScript installed successfully"
                    ) else (
                        echo "WARNING: TypeScript not found in node_modules"
                    )
                    
                    if exist "node_modules\\.bin\\vite.cmd" (
                        echo "Vite installed successfully"
                    ) else (
                        echo "WARNING: Vite not found in node_modules"
                    )
                '''
            }
        }

        stage('Run Lint') {
            steps {
                echo 'Running ESLint...'
                script {
                    try {
                        bat 'npm run lint'
                    } catch (Exception e) {
                        echo "Lint failed: ${e.getMessage()}"
                        echo 'Continuing build despite lint errors...'
                        currentBuild.result = 'UNSTABLE'
                    }
                }
            }
        }

        stage('TypeScript Check') {
            steps {
                echo 'Running TypeScript type check...'
                script {
                    try {
                        bat '''
                            echo "=== TypeScript Type Check ==="
                            npx tsc --noEmit
                        '''
                    } catch (Exception e) {
                        echo "TypeScript check failed: ${e.getMessage()}"
                        echo 'Continuing build despite TypeScript errors...'
                        currentBuild.result = 'UNSTABLE'
                    }
                }
            }
        }

        stage('Build') {
            steps {
                echo 'Building React/Vite project...'
                bat 'npm run build'
                bat '''
                    if exist "dist" (
                        echo Build successful - dist directory created
                        dir dist
                    ) else (
                        echo Build failed - dist directory not found
                        exit 1
                    )
                '''
            }
        }

        stage('Archive Build') {
            steps {
                echo 'Archiving build artifacts...'
                archiveArtifacts artifacts: 'dist/**', fingerprint: true
                script {
                    bat '''
                        for /f %%i in ('powershell -command "(Get-ChildItem -Recurse dist | Measure-Object -Property Length -Sum).Sum / 1MB"') do echo Build size: %%i MB
                    '''
                }
            }
        }
    }
    post {
        always {
            echo 'Pipeline completed'
            // 워크스페이스 정리
            script {
                bat '''
                    if exist "node_modules" rmdir /s /q node_modules
                    if exist ".npm" rmdir /s /q .npm
                '''
            }
        }
        success {
            echo 'Build succeeded!'
            script {
                try {
                    githubNotify(
                        context: 'continuous-integration/jenkins/pr-merge',
                        description: 'Build succeeded',
                        status: 'SUCCESS',
                        targetUrl: "${env.BUILD_URL}"
                    )
                    githubNotify(
                        context: 'jenkins/pr-check', 
                        status: 'SUCCESS', 
                        description: 'PR 검증이 성공적으로 완료되었습니다.',
                        targetUrl: "${env.BUILD_URL}"
                    )
                    githubNotify(
                        context: 'CI/Jenkins', 
                        status: 'SUCCESS', 
                        description: 'Jenkins CI 빌드가 성공했습니다.',
                        targetUrl: "${env.BUILD_URL}"
                    )
                } catch (Exception e) {
                    echo "GitHub notification failed: ${e.message}"
                }
            }
        }
        failure {
            echo 'Build failed!'
            script {
                try {
                    githubNotify(
                        context: 'continuous-integration/jenkins/pr-merge',
                        description: 'Build failed',
                        status: 'FAILURE',
                        targetUrl: "${env.BUILD_URL}"
                    )
                } catch (Exception e) {
                    echo "GitHub notification failed: ${e.message}"
                }
            }
        }
        unstable {
            echo 'Build is unstable (tests or lint failed)'
        }
    }
}
