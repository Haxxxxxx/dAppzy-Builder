const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Security audit configuration
const config = {
  directories: [
    'src/components',
    'src/Elements',
    'src/context',
    'src/utils',
    'src/services',
    'src/configs'
  ],
  securityChecks: {
    sensitiveData: [
      'privateKey',
      'secret',
      'password',
      'apiKey',
      'mnemonic'
    ],
    dangerousPatterns: [
      'eval(',
      'new Function(',
      'innerHTML',
      'outerHTML',
      'document.write'
    ],
    web3Security: [
      'sendTransaction',
      'signTransaction',
      'signMessage',
      'personalSign'
    ]
  }
};

// Run security audit
function runSecurityAudit() {
  console.log('🚀 Starting Security Audit...\n');

  // Check dependencies
  console.log('📦 Checking Dependencies...');
  try {
    const audit = execSync('npm audit --json').toString();
    const auditResults = JSON.parse(audit);
    console.log('Dependency vulnerabilities found:', auditResults.metadata.vulnerabilities.total);
  } catch (error) {
    console.error('Error checking dependencies:', error.message);
  }

  // Check for sensitive data
  console.log('\n🔍 Checking for Sensitive Data...');
  config.directories.forEach(dir => {
    if (fs.existsSync(dir)) {
      checkDirectory(dir);
    }
  });

  // Check for dangerous patterns
  console.log('\n⚠️ Checking for Dangerous Patterns...');
  config.directories.forEach(dir => {
    if (fs.existsSync(dir)) {
      checkPatterns(dir);
    }
  });

  // Check Web3 security
  console.log('\n🔗 Checking Web3 Security...');
  config.directories.forEach(dir => {
    if (fs.existsSync(dir)) {
      checkWeb3Security(dir);
    }
  });

  console.log('\n✅ Security Audit Complete');
}

// Check directory for sensitive data
function checkDirectory(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      checkDirectory(filePath);
    } else if (stats.isFile() && file.endsWith('.js')) {
      checkFileForSensitiveData(filePath);
    }
  });
}

// Check file for sensitive data
function checkFileForSensitiveData(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  config.securityChecks.sensitiveData.forEach(pattern => {
    if (content.includes(pattern)) {
      console.warn(`⚠️ Potential sensitive data found in ${filePath}: ${pattern}`);
    }
  });
}

// Check for dangerous patterns
function checkPatterns(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      checkPatterns(filePath);
    } else if (stats.isFile() && file.endsWith('.js')) {
      checkFileForPatterns(filePath);
    }
  });
}

// Check file for dangerous patterns
function checkFileForPatterns(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  config.securityChecks.dangerousPatterns.forEach(pattern => {
    if (content.includes(pattern)) {
      console.warn(`⚠️ Dangerous pattern found in ${filePath}: ${pattern}`);
    }
  });
}

// Check Web3 security
function checkWeb3Security(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      checkWeb3Security(filePath);
    } else if (stats.isFile() && file.endsWith('.js')) {
      checkFileForWeb3Security(filePath);
    }
  });
}

// Check file for Web3 security
function checkFileForWeb3Security(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  config.securityChecks.web3Security.forEach(pattern => {
    if (content.includes(pattern)) {
      console.warn(`⚠️ Web3 security check needed in ${filePath}: ${pattern}`);
    }
  });
}

// Run the audit
runSecurityAudit(); 