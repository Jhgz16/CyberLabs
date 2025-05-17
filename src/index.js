console.log('index.js loaded');
try {
  const React = window.React;
  const ReactDOM = window.ReactDOM;
  const useState = React.useState;
  const useEffect = React.useEffect;
  console.log('React and ReactDOM loaded:', React, ReactDOM);

  // Function to load JSON data
  function loadJson(src) {
    return fetch(src)
      .then(response => {
        if (!response.ok) throw new Error(`Failed to fetch ${src}: ${response.status}`);
        return response.json();
      })
      .then(data => {
        console.log(`${src} loaded successfully`);
        return data;
      })
      .catch(err => {
        console.error(`Failed to load JSON: ${src}`, err);
        throw err;
      });
  }

  // Component Definitions
  const App = function() {
    const [lang, setLang] = useState('en');
    const [i18n, setI18n] = useState(window.en || {});
    const [currentView, setCurrentView] = useState('dashboard');
    const [currentChallenge, setCurrentChallenge] = useState(null);
    const [scores, setScores] = useState({});
    const [showFeedback, setShowFeedback] = useState(false);
    const [userAnswer, setUserAnswer] = useState('');
    const [challengeIndex, setChallengeIndex] = useState(0);

    useEffect(function() {
      setI18n(lang === 'en' ? window.en : window.es);
    }, [lang]);

    const categories = [
      { id: 'sql', name: 'SQL Injection', questions: window.exercisesData.sql },
      { id: 'xss', name: 'Cross-Site Scripting (XSS)', questions: window.exercisesData.xss },
      { id: 'phish', name: 'Phishing/Smishing', questions: window.exercisesData.phish },
      { id: 'netsec', name: 'Network Security', questions: window.exercisesData.netsec },
      { id: 'forensics', name: 'Digital Forensics', questions: window.exercisesData.forensics },
      { id: 'crypto', name: 'Cryptography', questions: window.exercisesData.crypto }
    ];

    function handleChallengeSelect(categoryId, index) {
      const category = categories.find(c => c.id === categoryId);
      setCurrentChallenge({ category, index });
      setCurrentView('challenge');
    }

    function handleSubmit(categoryId, index, answer) {
      const category = categories.find(c => c.id === categoryId);
      const question = category.questions[index];
      let score = 0;
      if (answer.toLowerCase() === question.correctAnswer.toLowerCase()) score = 100;
      setScores(prev => ({ ...prev, [`${categoryId}-${index}`]: score }));
      setUserAnswer(answer);
      setShowFeedback(true);
    }

    function handleNext() {
      const category = currentChallenge.category;
      const nextIndex = challengeIndex + 1 < category.questions.length ? challengeIndex + 1 : 0;
      setChallengeIndex(nextIndex);
      setCurrentChallenge({ category, index: nextIndex });
      setShowFeedback(false);
      setUserAnswer('');
    }

    function ErrorBoundary(props) {
      const [hasError, setHasError] = useState(false);
      const [error, setError] = useState(null);

      useEffect(function() {
        window.addEventListener('error', function(e) {
          if (e.message.includes('App rendering')) {
            setHasError(true);
            setError(e);
          }
        });
      }, []);

      if (hasError) {
        return (
          React.createElement('div', { className: 'p-8' },
            React.createElement('h1', { className: 'text-2xl font-bold text-red-500' }, 'Error Loading App'),
            React.createElement('p', null, error?.message || 'Unknown error')
          )
        );
      }
      return props.children;
    }

    return (
      React.createElement(ErrorBoundary, null,
        React.createElement('div', { className: 'min-h-screen flex bg-gray-900 text-white' },
          React.createElement('aside', { className: 'w-64 bg-gray-800 p-4' },
            React.createElement('h1', { className: 'text-2xl font-bold mb-4' }, i18n.title || 'Cybersecurity Lab'),
            React.createElement('select', {
              className: 'mb-4 p-2 bg-gray-700 rounded',
              value: lang,
              onChange: function(e) { setLang(e.target.value); }
            },
              React.createElement('option', { value: 'en' }, 'English'),
              React.createElement('option', { value: 'es' }, 'Español')
            ),
            categories.map(cat =>
              React.createElement('div', { key: cat.id, className: 'mb-2' },
                React.createElement('h3', { className: 'text-lg font-semibold mb-2' }, cat.name),
                Array.from({ length: 10 }, (_, i) =>
                  React.createElement('button', {
                    key: i,
                    className: 'w-full p-2 bg-gray-600 rounded hover:bg-gray-700 mb-1',
                    onClick: () => handleChallengeSelect(cat.id, i)
                  }, `Challenge ${i + 1}`)
                )
              )
            )
          ),
          React.createElement('main', { className: 'flex-1 p-8' },
            currentView === 'dashboard' && React.createElement(Dashboard, { categories, scores, i18n }),
            currentView === 'challenge' && currentChallenge && React.createElement(Challenge, {
              challenge: currentChallenge,
              onSubmit: handleSubmit,
              i18n
            }),
            showFeedback && currentChallenge && React.createElement(Feedback, {
              challenge: currentChallenge,
              userAnswer,
              score: scores[`${currentChallenge.category.id}-${currentChallenge.index}`],
              onNext: handleNext,
              i18n
            })
          )
        )
      )
    );
  };

  const Dashboard = function(props) {
    const { categories, scores, i18n } = props;
    return React.createElement('div', null,
      React.createElement('h2', { className: 'text-3xl font-bold mb-6' }, i18n.dashboard || 'Dashboard'),
      React.createElement('div', { className: 'grid grid-cols-1 gap-6' },
        categories.map(cat =>
          React.createElement('div', { key: cat.id, className: 'bg-gray-800 p-6 rounded-lg shadow-lg' },
            React.createElement('h3', { className: 'text-xl font-semibold mb-2' }, cat.name),
            Array.from({ length: 10 }, (_, i) =>
              React.createElement('p', { key: i, className: 'ml-4' },
                `Challenge ${i + 1}: `,
                scores[`${cat.id}-${i}`] !== undefined ? `${scores[`${cat.id}-${i}`]}%` : 'Not attempted'
              )
            )
          )
        )
      )
    );
  };

  const Challenge = function(props) {
    const { challenge, onSubmit, i18n } = props;
    const [answer, setAnswer] = useState('');
    const question = challenge.category.questions[challenge.index];

    return React.createElement('div', { className: 'bg-gray-800 p-8 rounded-lg shadow-lg' },
      React.createElement('h2', { className: 'text-2xl font-bold mb-4' }, `${challenge.category.name} - Challenge ${challenge.index + 1}`),
      React.createElement('p', { className: 'text-gray-400 mb-6' }, question.text),
      question.emailContent && React.createElement('div', { className: 'border rounded-lg p-4 bg-white text-black mb-6' },
        React.createElement('div', { className: 'flex items-center mb-2' },
          React.createElement('img', { src: 'https://www.google.com/favicon.ico', alt: 'Gmail', className: 'w-6 h-6 mr-2' }),
          React.createElement('span', { className: 'text-lg font-semibold' }, 'Gmail')
        ),
        React.createElement('div', { className: 'border-t pt-2' },
          React.createElement('p', { className: 'text-sm text-gray-500' }, `From: ${question.emailContent.from}`),
          React.createElement('p', { className: 'text-sm text-gray-500 mb-2' }, `Subject: ${question.emailContent.subject}`),
          React.createElement('p', null, question.emailContent.body)
        )
      ),
      question.smsContent && React.createElement('div', { className: 'border rounded-lg p-4 bg-gray-100 text-black mb-6' },
        React.createElement('div', { className: 'flex items-center mb-2' },
          React.createElement('span', { className: 'text-lg font-semibold' }, 'Messages')
        ),
        React.createElement('div', { className: 'border-t pt-2' },
          React.createElement('p', { className: 'text-sm text-gray-500' }, `From: ${question.smsContent.from}`),
          React.createElement('p', null, question.smsContent.body)
        )
      ),
      question.options.map((option, idx) =>
        React.createElement('label', { key: idx, className: 'block mb-2' },
          React.createElement('input', {
            type: 'radio',
            name: `question-${challenge.index}`,
            value: option,
            checked: answer === option,
            onChange: () => setAnswer(option),
            className: 'mr-2'
          }),
          option
        )
      ),
      React.createElement('button', {
        className: 'p-2 bg-green-600 rounded hover:bg-green-700 mt-4',
        onClick: () => onSubmit(challenge.category.id, challenge.index, answer),
        disabled: !answer
      }, i18n.submit || 'Submit')
    );
  };

  const Feedback = function(props) {
    const { challenge, userAnswer, score, onNext, i18n } = props;
    const question = challenge.category.questions[challenge.index];

    return React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center' },
      React.createElement('div', { className: 'bg-gray-800 p-8 rounded-lg shadow-lg max-w-2xl' },
        React.createElement('h2', { className: 'text-2xl font-bold mb-4' }, i18n.feedback || 'Feedback'),
        React.createElement('p', { className: 'text-xl mb-4' },
          i18n.scoreFor || 'Score for', ' ',
          `${challenge.category.name} Challenge ${challenge.index + 1}: `,
          React.createElement('span', { className: 'text-green-400' }, score, '%')
        ),
        React.createElement('p', { className: 'mb-4' },
          i18n.yourAnswer || 'Your answer:', ' ', userAnswer,
          React.createElement('br'), i18n.correctAnswer || 'Correct answer:', ' ', question.correctAnswer
        ),
        React.createElement('p', { className: 'text-gray-300 mb-4' }, `Explanation: ${question.explanation}`),
        React.createElement('button', {
          className: 'p-2 bg-green-600 rounded hover:bg-green-700',
          onClick: onNext
        }, i18n.next || 'Next')
      )
    );
  };

  // Load JSON files
  const jsonFiles = [
    './src/assets/data/exercises.json',
    './src/assets/data/i18n/en.json',
    './src/assets/data/i18n/es.json'
  ];

  Promise.all(jsonFiles.map(src => loadJson(src)))
    .then(results => {
      console.log('All JSON loaded');
      window.exercisesData = {
        sql: [
          { text: 'You’re reviewing a login form on a website. The backend query is "SELECT * FROM users WHERE username = \'" + input + "\' AND password = \'" + input + "\'". A user enters "admin\' --" as the username. What happens?', options: ['Login fails', 'Login succeeds for admin', 'Error occurs'], correctAnswer: 'Login succeeds for admin', explanation: 'The input "admin\' --" comments out the rest of the query, making it "SELECT * FROM users WHERE username = \'admin\'". This logs in as admin without a password. Use prepared statements to prevent this.' },
          { text: 'A website query is "SELECT * FROM products WHERE id = " + input. An attacker enters "1 OR 1=1". What will this query return?', options: ['One product', 'All products', 'No products'], correctAnswer: 'All products', explanation: '"OR 1=1" always evaluates to true, so the query returns all products. Use parameterized queries to stop this.' },
          { text: 'You see a query log: "SELECT * FROM users WHERE id = 1; DROP TABLE users". What does this do?', options: ['Selects user with id 1', 'Drops users table', 'Both'], correctAnswer: 'Both', explanation: 'The semicolon separates queries, executing both. The "DROP TABLE" deletes the users table. Limit query permissions to prevent destructive actions.' },
          { text: 'An attacker enters "1\' OR \'1\'=\'1" into a search field. What is the goal?', options: ['Break the website', 'Bypass authentication', 'Delete data'], correctAnswer: 'Bypass authentication', explanation: 'This input makes the query always true, potentially bypassing login checks. Use input validation to block this.' },
          { text: 'A query shows "SELECT * FROM users WHERE email = \'" + input + "\'". The input is "user@domain.com\' AND 1=2 --". What happens?', options: ['Returns user', 'Returns nothing', 'Deletes data'], correctAnswer: 'Returns nothing', explanation: '"AND 1=2" makes the query false, and "--" comments out the rest. Use prepared statements to avoid such tampering.' },
          { text: 'A form executes "SELECT * FROM orders WHERE order_id = " + input. The input is "1 UNION SELECT username, password FROM users". What happens?', options: ['Shows order', 'Shows user data', 'Crashes'], correctAnswer: 'Shows user data', explanation: 'UNION combines results, exposing usernames and passwords. Restrict database permissions and sanitize inputs.' },
          { text: 'You notice a query "UPDATE users SET role = \'admin\' WHERE id = " + input with input "1 OR 1=1". What happens?', options: ['Updates one user', 'Updates all users', 'Fails'], correctAnswer: 'Updates all users', explanation: '"OR 1=1" affects all rows, making everyone an admin. Use specific conditions and validate inputs.' },
          { text: 'A login form uses "SELECT * FROM users WHERE username = \'" + input + "\'". The input is "\' OR \'\'=\'". What happens?', options: ['Logs in as any user', 'Fails login', 'Crashes'], correctAnswer: 'Logs in as any user', explanation: '"\' OR \'\'=\'" always returns true, logging in without credentials. Use parameterized queries.' },
          { text: 'A query log shows "SELECT * FROM users WHERE id = 1 AND SLEEP(5)". What is the attacker testing?', options: ['Data theft', 'Time-based injection', 'Error handling'], correctAnswer: 'Time-based injection', explanation: 'SLEEP(5) delays the response, testing for blind SQL injection. Monitor query delays and block such functions.' },
          { text: 'A query "SELECT * FROM users WHERE id = " + input uses "1; INSERT INTO users (username, password) VALUES (\'hacker\', \'pass\')". What happens?', options: ['Selects user', 'Adds new user', 'Both'], correctAnswer: 'Both', explanation: 'The semicolon allows a second query to add a user. Use single-query execution to prevent this.' }
        ],
        xss: [
          { text: 'You’re auditing a blog site. A user submits a comment "<script>alert(\'Hacked\')</script>". How does this affect the site?', options: ['Shows an alert', 'Nothing happens', 'Crashes'], correctAnswer: 'Shows an alert', explanation: 'This is a reflected XSS attack. The script runs when the comment is displayed. Use output encoding to prevent this.' },
          { text: 'A website displays a user profile with input "<img src=x onerror=alert(\'XSS\')>". What happens when viewed?', options: ['Image loads', 'Alert pops up', 'Profile hides'], correctAnswer: 'Alert pops up', explanation: 'The onerror event triggers the script. Sanitize inputs to remove event handlers.' },
          { text: 'A search page shows results as "You searched for: " + input. The input is "<script>document.location=\'evil.com\'</script>". What happens?', options: ['Redirects to evil.com', 'Shows search', 'Errors'], correctAnswer: 'Redirects to evil.com', explanation: 'The script redirects users to a malicious site. Escape user input before displaying.' },
          { text: 'A form accepts a URL as "<a href=\'javascript:alert(1)\'>Click</a>". What happens when clicked?', options: ['Opens link', 'Shows alert', 'Nothing'], correctAnswer: 'Shows alert', explanation: 'The "javascript:" URI runs the script. Validate URLs to block this.' },
          { text: 'A site renders a comment "<svg onload=alert(\'XSS\')>". What happens?', options: ['SVG displays', 'Alert triggers', 'Comment hides'], correctAnswer: 'Alert triggers', explanation: 'The onload event in SVG runs the script. Filter SVG content to prevent XSS.' },
          { text: 'A forum allows HTML comments. A user posts "<b onmouseover=alert(1)>Hover</b>". What happens?', options: ['Text is bold', 'Alert on hover', 'Nothing'], correctAnswer: 'Alert on hover', explanation: 'The onmouseover event triggers the script. Remove event attributes from user input.' },
          { text: 'A site shows a profile field as "Name: " + input. The input is "<style>body{display:none}</style>". What happens?', options: ['Hides page', 'Shows name', 'Crashes'], correctAnswer: 'Hides page', explanation: 'The style tag hides the page. Block CSS injections with a content security policy.' },
          { text: 'A chat app displays messages with "<iframe src=javascript:alert(1)>". What happens?', options: ['Iframe loads', 'Alert runs', 'Message hides'], correctAnswer: 'Alert runs', explanation: 'The iframe’s src runs the script. Disallow iframes in user input.' },
          { text: 'A site renders input "<input value=1 onfocus=alert(1)>". What happens when the field is focused?', options: ['Alert triggers', 'Field focuses', 'Nothing'], correctAnswer: 'Alert triggers', explanation: 'The onfocus event runs the script. Strip event handlers from inputs.' },
          { text: 'A user submits "<object data=javascript:alert(1)>". What happens?', options: ['Object loads', 'Alert runs', 'Nothing'], correctAnswer: 'Alert runs', explanation: 'The object tag runs the script. Block object tags in user input.' }
        ],
        phish: [
          { text: 'You receive an email in your Gmail inbox. What is this email?', emailContent: { from: 'support@paypal-security.com', subject: 'Account Suspension Alert', body: 'Your PayPal account has been suspended due to unusual activity. Click here to verify: paypal-security.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', explanation: 'The domain "paypal-security.com" is not PayPal’s official site (paypal.com). Always verify the sender’s domain and avoid clicking links in unsolicited emails.' },
          { text: 'You get an SMS on your phone. What is this message?', smsContent: { from: '+639123456789', body: 'Your BDO card is blocked. Reply YES to unblock now.' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', explanation: 'Banks don’t ask for SMS replies to unblock cards. This is smishing. Contact the bank using official channels.' },
          { text: 'An email appears in your Gmail. Is it safe?', emailContent: { from: 'no-reply@amazon-deals2025.com', subject: 'Urgent: Confirm Your Amazon Order', body: 'Your order #12345 is on hold. Click here to confirm: amazon-deals2025.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', explanation: 'The domain "amazon-deals2025.com" isn’t Amazon’s (amazon.com). Verify orders directly on Amazon’s official site.' },
          { text: 'You receive an SMS. What is it?', smsContent: { from: 'GCash Support', body: 'Your GCash balance is low. Top up now at gcash-support.net' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', explanation: 'GCash uses gcash.com, not gcash-support.net. This is smishing. Use the official app to check your balance.' },
          { text: 'An email arrives in your Gmail. Is it legitimate?', emailContent: { from: 'promo@shopee-promo.com', subject: 'Win P1000 Voucher!', body: 'Claim your voucher now: bit.ly/shopee-promo' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', explanation: 'Shortened URLs like "bit.ly" can hide phishing sites. Shopee uses shopee.ph. Verify promotions directly.' },
          { text: 'You get an email in Gmail. What is it?', emailContent: { from: 'tracking@dhl-tracking.org', subject: 'DHL Package Delayed', body: 'Your package is delayed. Track here: dhl-tracking.org' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', explanation: 'DHL uses dhl.com, not dhl-tracking.org. Track packages on the official site.' },
          { text: 'An SMS appears on your phone. Is it safe?', smsContent: { from: 'IRS', body: 'You owe $500 in taxes. Pay now at irs-payment.gov' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', explanation: 'The IRS doesn’t send payment links via SMS. Use irs.gov to verify tax issues.' },
          { text: 'You receive an email in Gmail. Is it trustworthy?', emailContent: { from: 'billing@netflix-login2025.com', subject: 'Update Your Netflix Payment', body: 'Payment failed. Update here: netflix-login2025.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', explanation: 'Netflix uses netflix.com. This is phishing. Check payments in the official app.' },
          { text: 'An SMS arrives. What is it?', smsContent: { from: 'Globe', body: 'Your load expires soon. Recharge at globe-promos.ph' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', explanation: 'Globe uses globe.com.ph. This is smishing. Recharge via official channels.' },
          { text: 'You get an email in Gmail. Is it safe?', emailContent: { from: 'hr@company-login.org', subject: 'Password Reset Required', body: 'Reset your employee password at company-login.org' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', explanation: 'Verify with your IT team. Phishing often mimics internal emails. Use official domains.' }
        ],
        netsec: [
          { text: 'You’re setting up a home network. A scan shows port 22 (SSH) is open on your router. What should you do?', options: ['Leave it open', 'Close it if unused', 'Change the port'], correctAnswer: 'Close it if unused', explanation: 'Port 22 can be exploited if SSH isn’t needed. Close unused ports to reduce risks.' },
          { text: 'Your company’s server uses "admin" as the password. What should you change?', options: ['Nothing', 'Use a stronger password', 'Disable the account'], correctAnswer: 'Use a stronger password', explanation: 'Weak passwords like "admin" are easily guessed. Use a strong, unique password.' },
          { text: 'You connect to a café’s Wi-Fi. The network is unencrypted. What should you do?', options: ['Browse normally', 'Use a VPN', 'Disconnect'], correctAnswer: 'Use a VPN', explanation: 'Unencrypted Wi-Fi exposes your data. A VPN encrypts your traffic.' },
          { text: 'A server log shows 50 failed login attempts in 1 minute. What is likely happening?', options: ['Normal activity', 'Brute force attack', 'User error'], correctAnswer: 'Brute force attack', explanation: 'Many failed logins suggest a brute force attack. Enable account lockout policies.' },
          { text: 'You share your Wi-Fi password with a friend. Is this safe?', options: ['Yes', 'No', 'Only if trusted'], correctAnswer: 'Only if trusted', explanation: 'Sharing Wi-Fi passwords can risk network access. Only share with trusted people.' },
          { text: 'Your router hasn’t been updated in a year. What should you do?', options: ['Leave it', 'Update firmware', 'Replace it'], correctAnswer: 'Update firmware', explanation: 'Outdated firmware has vulnerabilities. Regular updates improve security.' },
          { text: 'Your company doesn’t use a firewall. Is this a problem?', options: ['No', 'Yes', 'Only for servers'], correctAnswer: 'Yes', explanation: 'Firewalls block unauthorized access. They’re essential for all networks.' },
          { text: 'You’re on public Wi-Fi and need to check email. What’s the safest way?', options: ['Check normally', 'Use a VPN', 'Wait until home'], correctAnswer: 'Use a VPN', explanation: 'Public Wi-Fi can be intercepted. A VPN secures your connection.' },
          { text: 'A scan shows port 445 (SMB) open on your PC. What should you do?', options: ['Leave it', 'Close it', 'Monitor it'], correctAnswer: 'Close it', explanation: 'Port 445 can be exploited (e.g., by ransomware). Close it if not needed.' },
          { text: 'Your antivirus hasn’t updated in months. What should you do?', options: ['Ignore it', 'Update it', 'Uninstall it'], correctAnswer: 'Update it', explanation: 'Antivirus needs updates to detect new threats. Keep it current.' }
        ],
        forensics: [
          { text: 'You’re investigating a breach. A log shows "GET /login.php?user=admin\' --". What attack is this?', options: ['SQL Injection', 'XSS', 'Phishing'], correctAnswer: 'SQL Injection', explanation: 'The "--" comments out the query, a sign of SQL injection. Check logs for similar patterns.' },
          { text: 'A user reports a pop-up on their browser. You find "<script>alert(1)</script>" in the page source. What happened?', options: ['SQL Injection', 'XSS', 'Brute Force'], correctAnswer: 'XSS', explanation: 'This script indicates an XSS attack. Review input sanitization on the site.' },
          { text: 'You find a deleted file "invoice.pdf.exe" in a user’s trash. What is this likely?', options: ['Normal file', 'Malware', 'Backup'], correctAnswer: 'Malware', explanation: 'The ".exe" extension suggests malware disguised as a PDF. Scan the system.' },
          { text: 'A server log shows outbound traffic to 192.168.1.100 on port 4444. What might this be?', options: ['Normal traffic', 'C2 communication', 'File transfer'], correctAnswer: 'C2 communication', explanation: 'Port 4444 is often used for command-and-control (C2). Investigate the IP.' },
          { text: 'You’re analyzing a PC. The timestamp of a file "keylogger.exe" matches the time of a breach. What should you do?', options: ['Ignore it', 'Analyze the file', 'Delete it'], correctAnswer: 'Analyze the file', explanation: 'The timestamp suggests involvement in the breach. Analyze it forensically.' },
          { text: 'A user clicked a link, and you find "cmd.exe" ran afterward. What happened?', options: ['Normal operation', 'Malware execution', 'System update'], correctAnswer: 'Malware execution', explanation: 'cmd.exe running after a link click suggests malware. Check the link and system.' },
          { text: 'You find a registry entry "HKLM\\Software\\Run\\suspicious.exe". What is this?', options: ['Startup program', 'System file', 'Malware persistence'], correctAnswer: 'Malware persistence', explanation: 'Registry Run keys can launch malware on boot. Investigate the file.' },
          { text: 'A log shows a file "data.zip" was accessed, then deleted. What should you do?', options: ['Ignore it', 'Recover the file', 'Check backups'], correctAnswer: 'Recover the file', explanation: 'Deleted files may contain evidence. Use forensic tools to recover it.' },
          { text: 'You’re analyzing network traffic. You see "POST /upload.php HTTP/1.1" with a large data transfer. What might this be?', options: ['Normal upload', 'Data exfiltration', 'Website update'], correctAnswer: 'Data exfiltration', explanation: 'Large POST requests can indicate data theft. Investigate the destination.' },
          { text: 'A user’s browser history shows "evil.com/login". What should you check next?', options: ['Browser settings', 'Network logs', 'System files'], correctAnswer: 'Network logs', explanation: 'Check network logs for connections to "evil.com" to trace the attack.' }
        ],
        crypto: [
          { text: 'You receive a message encoded as "SVV". What cipher might this be?', options: ['Caesar', 'Base64', 'AES'], correctAnswer: 'Base64', explanation: 'SVV decodes to "HI" in Base64. It’s a common encoding for data.' },
          { text: 'A file is encrypted with a key "k3y". What type of encryption is likely used?', options: ['Symmetric', 'Asymmetric', 'Hashing'], correctAnswer: 'Symmetric', explanation: 'A single key suggests symmetric encryption (e.g., AES). Use the same key to decrypt.' },
          { text: 'You see a hash "5f4dcc3b5aa765d61d8327deb882cf99". What type is it?', options: ['MD5', 'SHA-256', 'Base64'], correctAnswer: 'MD5', explanation: 'This 32-character hash is MD5. It’s insecure; use SHA-256 instead.' },
          { text: 'A message says "Shift by 3: FDH". What is the plaintext?', options: ['ABC', 'DEF', 'GHI'], correctAnswer: 'ABC', explanation: 'A Caesar cipher with shift 3 (F->C, D->A, H->E) decodes FDH to ABC.' },
          { text: 'You’re auditing a site using RSA. The private key is exposed. What should you do?', options: ['Nothing', 'Generate new keys', 'Change passwords'], correctAnswer: 'Generate new keys', explanation: 'An exposed private key compromises RSA. Generate new keys immediately.' },
          { text: 'A password is hashed as "password". Is this secure?', options: ['Yes', 'No', 'Maybe'], correctAnswer: 'No', explanation: 'Plaintext hashing is insecure. Use a strong algorithm like bcrypt with a salt.' },
          { text: 'You see "U2FsdGVkX1". What is this likely?', options: ['Base64', 'AES', 'RSA'], correctAnswer: 'AES', explanation: 'This prefix indicates AES encryption (OpenSSL format). Decrypt with the correct key.' },
          { text: 'A message uses a substitution cipher: "ZHOFRPH". What is the plaintext?', options: ['WELCOME', 'GOODBYE', 'HELLO'], correctAnswer: 'WELCOME', explanation: 'A substitution cipher maps letters (e.g., Z->W). ZHOFRPH decodes to WELCOME.' },
          { text: 'You’re reviewing a site using TLS 1.0. Is this secure?', options: ['Yes', 'No', 'Maybe'], correctAnswer: 'No', explanation: 'TLS 1.0 is outdated and vulnerable. Upgrade to TLS 1.3.' },
          { text: 'A file uses a 56-bit key for encryption. Is this secure?', options: ['Yes', 'No', 'Maybe'], correctAnswer: 'No', explanation: '56-bit keys (e.g., DES) are weak and easily cracked. Use 256-bit keys (e.g., AES-256).' }
        ]
      };
      window.en = results[1];
      window.es = results[2];

      if (!window.exercisesData || !window.en || !window.es) {
        throw new Error('Required data (exercisesData, en, es) not loaded');
      }

      console.log('Rendering App...');
      ReactDOM.render(React.createElement(App), document.getElementById('root'));
      console.log('App rendered');
    })
    .catch(err => {
      console.error('JSON loading failed:', err);
      document.getElementById('error').innerText = 'Failed to load app data: ' + err.message;
      document.getElementById('error').classList.remove('hidden');
    });
} catch (e) {
  console.error('Failed to render React app:', e);
  document.getElementById('error').innerText = 'Failed to load app: ' + e.message;
  document.getElementById('error').classList.remove('hidden');
}
