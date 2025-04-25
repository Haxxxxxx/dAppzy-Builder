const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { runSecurityAudit } = require('../security-audit');

// Mock file system and child process
jest.mock('fs');
jest.mock('child_process');

describe('Security Audit', () => {
  const mockConfig = {
    directories: ['src/components', 'src/utils'],
    securityChecks: {
      sensitiveData: ['privateKey', 'secret', 'password'],
      dangerousPatterns: ['eval(', 'innerHTML'],
      web3Security: ['sendTransaction', 'signMessage']
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console methods
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
  });

  describe('Dependency Check', () => {
    it('should check dependencies for vulnerabilities', () => {
      const mockAudit = {
        metadata: {
          vulnerabilities: {
            total: 0
          }
        }
      };
      execSync.mockReturnValue(JSON.stringify(mockAudit));

      runSecurityAudit();
      expect(execSync).toHaveBeenCalledWith('npm audit --json');
      expect(console.log).toHaveBeenCalledWith('Dependency vulnerabilities found:', 0);
    });

    it('should handle audit errors', () => {
      execSync.mockImplementation(() => {
        throw new Error('Audit failed');
      });

      runSecurityAudit();
      expect(console.error).toHaveBeenCalledWith('Error checking dependencies:', expect.any(Error));
    });
  });

  describe('Sensitive Data Check', () => {
    it('should detect sensitive data in files', () => {
      const mockFileContent = `
        const privateKey = 'secret-key';
        const password = '123456';
      `;
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(mockFileContent);

      runSecurityAudit();
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Potential sensitive data found'),
        expect.stringContaining('privateKey')
      );
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Potential sensitive data found'),
        expect.stringContaining('password')
      );
    });

    it('should handle non-existent directories', () => {
      fs.existsSync.mockReturnValue(false);
      runSecurityAudit();
      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe('Dangerous Patterns Check', () => {
    it('should detect dangerous patterns', () => {
      const mockFileContent = `
        eval('some code');
        element.innerHTML = '<script>alert("xss")</script>';
      `;
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(mockFileContent);

      runSecurityAudit();
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Dangerous pattern found'),
        expect.stringContaining('eval(')
      );
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Dangerous pattern found'),
        expect.stringContaining('innerHTML')
      );
    });
  });

  describe('Web3 Security Check', () => {
    it('should detect Web3 security issues', () => {
      const mockFileContent = `
        await contract.sendTransaction({});
        await wallet.signMessage('message');
      `;
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(mockFileContent);

      runSecurityAudit();
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Web3 security issue found'),
        expect.stringContaining('sendTransaction')
      );
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Web3 security issue found'),
        expect.stringContaining('signMessage')
      );
    });
  });

  describe('File System Operations', () => {
    it('should handle file read errors', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation(() => {
        throw new Error('File read error');
      });

      runSecurityAudit();
      expect(console.error).toHaveBeenCalledWith('Error reading file:', expect.any(Error));
    });

    it('should handle directory traversal errors', () => {
      fs.existsSync.mockImplementation((dir) => {
        if (dir.includes('..')) {
          throw new Error('Directory traversal attempt');
        }
        return true;
      });

      runSecurityAudit();
      expect(console.error).toHaveBeenCalledWith('Error checking directory:', expect.any(Error));
    });
  });
}); 