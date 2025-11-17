# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.2.x   | :white_check_mark: |
| < 0.2   | :x:                |

## Reporting a Vulnerability

The Founder's Dilemma team takes security seriously. We appreciate your efforts to responsibly disclose your findings.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities by:

1. **GitHub Security Advisories** (Preferred)
   - Go to https://github.com/acailic/founders-dilemma/security/advisories
   - Click "Report a vulnerability"
   - Fill out the form with details

2. **Private Contact**
   - Create a private security advisory in the repository
   - Contact the repository maintainers directly through GitHub

### What to Include

Please include the following information in your report:

- **Type of vulnerability** (e.g., XSS, command injection, etc.)
- **Full paths** of affected source files
- **Location** of the affected code (tag/branch/commit or direct URL)
- **Step-by-step instructions** to reproduce the issue
- **Proof-of-concept or exploit code** (if possible)
- **Impact** of the vulnerability (what an attacker could do)
- **Suggested fix** (if you have one)

### What to Expect

After you submit a report:

1. **Acknowledgment** - We'll acknowledge receipt within 48 hours
2. **Assessment** - We'll assess the vulnerability and determine severity
3. **Timeline** - We'll provide an estimated timeline for a fix
4. **Updates** - We'll keep you informed of our progress
5. **Credit** - We'll credit you in the security advisory (unless you prefer to remain anonymous)

### Disclosure Policy

- **Please give us reasonable time** to fix the vulnerability before public disclosure
- **Typical timeline**: 90 days from initial report
- **We'll coordinate with you** on the disclosure timeline
- **We'll credit your discovery** in our release notes

## Security Update Process

When a security vulnerability is fixed:

1. **Patch Development** - We develop and test a fix
2. **Security Advisory** - We publish a GitHub Security Advisory
3. **Release** - We release a patched version
4. **Notification** - We notify users through:
   - GitHub Security Advisories
   - Release notes
   - Repository README

## Security Best Practices

### For Users

- **Keep updated** - Always use the latest version
- **Review dependencies** - Check for dependency vulnerabilities with `npm audit`
- **Verify downloads** - Ensure you're downloading from official sources
- **Report issues** - If you find something suspicious, report it

### For Contributors

- **Never commit secrets** - No API keys, tokens, or passwords
- **Validate input** - Always validate and sanitize user input
- **Use dependencies wisely** - Keep dependencies updated and minimal
- **Follow secure coding** - Use Rust's safety features, avoid `unsafe` blocks
- **Review dependencies** - Check for known vulnerabilities before adding new dependencies

## Known Security Considerations

### Desktop Application Security

As a Tauri desktop application:

- **File system access** - The app has access to local file system
- **IPC communication** - Rust backend communicates with frontend via IPC
- **Updates** - Keep Tauri and dependencies updated for security patches

### Dependency Security

We use automated dependency scanning:

- **Dependabot** - Automated dependency updates for known vulnerabilities
- **npm audit** - Regular npm dependency audits
- **cargo audit** - Regular Rust dependency audits

### Current Security Measures

- ✅ TypeScript strict mode enabled
- ✅ Tauri security best practices followed
- ✅ Regular dependency updates
- ✅ Automated security scanning (via GitHub)
- ✅ Code review process for all changes

## Security-Related Configuration

### Tauri Security

Our `tauri.conf.json` follows security best practices:

- CSP (Content Security Policy) configured
- Limited allowlist for system APIs
- IPC communication restricted
- File system access controlled

### Dependencies

We minimize dependencies and regularly audit them:

```bash
# Check for npm vulnerabilities
npm audit

# Check for Rust vulnerabilities
cargo audit
```

## Vulnerability Disclosure Timeline

Examples of our disclosure process:

- **Day 0**: Vulnerability reported
- **Day 2**: Acknowledged and assigned severity
- **Day 7**: Initial assessment complete
- **Day 14-30**: Patch developed and tested
- **Day 30-90**: Coordinated disclosure with reporter
- **Day 90**: Public disclosure if not fixed earlier

## Security Hall of Fame

We recognize security researchers who responsibly disclose vulnerabilities:

<!-- List will be added as researchers report issues -->

_No security vulnerabilities have been publicly disclosed yet._

## Questions?

If you have questions about this security policy, please:

- Open a [GitHub Discussion](https://github.com/acailic/founders-dilemma/discussions)
- Contact the maintainers through GitHub

---

**Thank you for helping keep Founder's Dilemma and its users safe!**
