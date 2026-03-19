import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('Security Audit', () => {
  let runSecurityAudit;

  beforeEach(async () => {
    vi.resetModules();

    // Silence console output during tests
    console.log = vi.fn();
    console.error = vi.fn();
    console.warn = vi.fn();

    const mod = await import('../security-audit.js');
    runSecurityAudit = mod.default?.runSecurityAudit ?? mod.runSecurityAudit;
  });

  it('should export runSecurityAudit as a function', () => {
    expect(typeof runSecurityAudit).toBe('function');
  });

  it('should run without throwing', { timeout: 30000 }, () => {
    // Integration test: runs the actual audit against the repo
    expect(() => runSecurityAudit()).not.toThrow();
  });

  it('should log the audit start message', () => {
    runSecurityAudit();
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Starting Security Audit')
    );
  });

  it('should log the audit completion message', () => {
    runSecurityAudit();
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Security Audit Complete')
    );
  });

  it('should check dependencies', () => {
    runSecurityAudit();
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Checking Dependencies')
    );
  });

  it('should check for sensitive data', () => {
    runSecurityAudit();
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Checking for Sensitive Data')
    );
  });

  it('should check for dangerous patterns', () => {
    runSecurityAudit();
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Checking for Dangerous Patterns')
    );
  });

  it('should check Web3 security', () => {
    runSecurityAudit();
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Checking Web3 Security')
    );
  });
});
