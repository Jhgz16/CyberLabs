const netsecQuestions = [
  { text: 'You’re setting up a home router. Port 80 is open. What should you do?', options: ['Leave it', 'Close it if unused', 'Change it'], correctAnswer: 'Close it if unused', difficulty: 'Medium', explanation: 'Port 80 (HTTP) can be exploited. Close it if not needed to reduce risks.' },
  { text: 'Your Wi-Fi password is "123456". What should you change?', options: ['Nothing', 'Stronger password', 'Disable Wi-Fi'], correctAnswer: 'Stronger password', difficulty: 'Medium', explanation: 'Weak passwords are easily cracked. Use a strong, unique password.' },
  { text: 'You join a public Wi-Fi with no encryption. What’s safest?', options: ['Browse normally', 'Use VPN', 'Disconnect'], correctAnswer: 'Use VPN', difficulty: 'Medium', explanation: 'Unencrypted Wi-Fi exposes data. A VPN secures your connection.' },
  { text: 'A server log shows 100 login attempts in 5 minutes. What’s likely?', options: ['Normal use', 'Brute force', 'Server error'], correctAnswer: 'Brute force', difficulty: 'Highly Technical', explanation: 'High failed attempts suggest a brute force attack. Enable lockout policies.' },
  { text: 'You share your Wi-Fi with a neighbor. Is this safe?', options: ['Yes', 'No', 'Only if trusted'], correctAnswer: 'Only if trusted', difficulty: 'Medium', explanation: 'Sharing risks network access. Limit to trusted individuals.' },
  { text: 'Your firewall is off. Should you turn it on?', options: ['No', 'Yes', 'Maybe'], correctAnswer: 'Yes', difficulty: 'Medium', explanation: 'Firewalls block unauthorized access. Enable it for security.' },
  { text: 'A network scan shows port 445 open. What to do?', options: ['Leave it', 'Close it', 'Monitor it'], correctAnswer: 'Close it', difficulty: 'Highly Technical', explanation: 'Port 445 (SMB) is vulnerable to attacks. Close it if unused.' },
  { text: 'You’re on public Wi-Fi and need to bank. What’s best?', options: ['Bank online', 'Use VPN', 'Wait'], correctAnswer: 'Use VPN', difficulty: 'Highly Technical', explanation: 'Public Wi-Fi risks data theft. A VPN encrypts your traffic.' },
  { text: 'Your router firmware is outdated. What next?', options: ['Ignore', 'Update', 'Replace'], correctAnswer: 'Update', difficulty: 'Medium', explanation: 'Outdated firmware has vulnerabilities. Update it regularly.' },
  { text: 'A device sends data to an unknown IP. What to check?', options: ['Nothing', 'Network logs', 'Device settings'], correctAnswer: 'Network logs', difficulty: 'Highly Technical', explanation: 'Unknown IPs may indicate exfiltration. Review logs for patterns.' }
];

// Export the questions for use in other scripts
window.netsecQuestions = netsecQuestions;