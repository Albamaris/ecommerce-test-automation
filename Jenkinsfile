pipeline {
    agent {
        docker {
            image 'mcr.microsoft.com/playwright:v1.40.0-jammy'
            args '-u root:root'
        }
    }

    parameters {
        booleanParam(
            name: 'RUN_CHROMIUM',
            defaultValue: true,
            description: 'Run tests on Chromium browser'
        )
        booleanParam(
            name: 'RUN_FIREFOX',
            defaultValue: false,
            description: 'Run tests on Firefox browser'
        )
        booleanParam(
            name: 'RUN_WEBKIT',
            defaultValue: false,
            description: 'Run tests on WebKit browser'
        )
        string(
            name: 'WORKERS',
            defaultValue: '4',
            description: 'Number of parallel workers (1-10)'
        )
        booleanParam(
            name: 'GENERATE_ALLURE_REPORT',
            defaultValue: false,
            description: 'Generate Allure report after test execution'
        )
        string(
            name: 'BRANCH_NAME',
            defaultValue: 'developing',
            description: 'Git branch to test (e.g., developing, main, master)'
        )
    }

    options {
        timeout(time: 1, unit: 'HOURS')
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }
    
    environment {
        CI = 'true'
        HOME = "${WORKSPACE}"
        npm_config_cache = "${WORKSPACE}/.npm"
        PLAYWRIGHT_WORKERS = "${params.WORKERS}"
        GENERATE_ALLURE = "${params.GENERATE_ALLURE_REPORT}"
    }
    
    stages {
        stage('Initialize') {
            steps {
                script {
                    // Set build display name to show branch being tested
                    currentBuild.displayName = "#${BUILD_NUMBER} - ${params.BRANCH_NAME}"
                    echo "Testing branch: ${params.BRANCH_NAME}"
                }
            }
        }

        stage('Checkout') {
            steps {
                script {
                    echo "Checking out branch: ${params.BRANCH_NAME}"
                    checkout([
                        $class: 'GitSCM',
                        branches: [[name: "*/${params.BRANCH_NAME}"]],
                        userRemoteConfigs: scm.userRemoteConfigs
                    ])
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
                script {
                    // Install only selected browsers
                    def browsers = []
                    if (params.RUN_CHROMIUM) { browsers.add('chromium') }
                    if (params.RUN_FIREFOX) { browsers.add('firefox') }
                    if (params.RUN_WEBKIT) { browsers.add('webkit') }

                    if (browsers.size() > 0) {
                        def browsersArg = browsers.join(' ')
                        echo "Installing browsers: ${browsers.join(', ')}"
                        sh "npx playwright install --with-deps ${browsersArg}"
                    } else {
                        echo 'No browsers to install'
                    }
                }
            }
        }
        
        stage('Run Tests') {
            steps {
                script {
                    // Build project list based on selected browsers
                    def projects = []
                    if (params.RUN_CHROMIUM) { projects.add('chromium') }
                    if (params.RUN_FIREFOX) { projects.add('firefox') }
                    if (params.RUN_WEBKIT) { projects.add('webkit') }

                    if (projects.size() > 0) {
                        // Build command with all selected browsers
                        def projectsArg = projects.collect { "--project=$it" }.join(' ')
                        echo "Running tests for browsers: ${projects.join(', ')}"
                        sh "npx playwright test ${projectsArg} --workers=${params.WORKERS}"
                    } else {
                        error 'No browser selected to run tests. Please enable at least one browser.'
                    }
                }
            }
        }
        
        stage('Generate Reports') {
            steps {
                echo 'Test results will be published in post-build actions'
            }
        }
    }
    
    post {
        always {
            // Publish JUnit test results for trends
            junit testResults: 'test-results/junit.xml', allowEmptyResults: true

            // Publish HTML Report
            publishHTML([
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Test Report',
                reportTitles: 'Test Results'
            ])

            // Publish Allure Report - only if parameter is enabled
            script {
                if (params.GENERATE_ALLURE_REPORT && fileExists('allure-results')) {
                    allure([
                        includeProperties: false,
                        jdk: '',
                        results: [[path: 'allure-results']]
                    ])
                } else if (!params.GENERATE_ALLURE_REPORT) {
                    echo 'Allure report generation skipped (GENERATE_ALLURE_REPORT=false)'
                }
            }

            // Archive test results
            archiveArtifacts artifacts: 'playwright-report/**/*', allowEmptyArchive: true
            archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
        }
        
        success {
            echo 'All tests passed successfully!'
        }
        
        failure {
            echo 'Some tests failed!'
            // Hier kann ich jemanden auf den Laufenden halten (Email, etc.)
        }
        
        unstable {
            echo 'Tests are unstable'
        }
    }
}
