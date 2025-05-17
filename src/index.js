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
      { id: 'netsec', name: 'Network Security', questions: window.exercisesData.netsec }
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
      if (answer === question.correctAnswer) score = 100;
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
                  }, `Challenge ${i + 1} (${cat.questions[i].difficulty})`)
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
      React.createElement('input', {
        type: 'text',
        value: answer,
        onChange: e => setAnswer(e.target.value),
        className: 'p-2 bg-gray-700 rounded w-full mb-4',
        placeholder: i18n.enterAnswer || 'Enter your answer'
      }),
      React.createElement('button', {
        className: 'p-2 bg-green-600 rounded hover:bg-green-700',
        onClick: () => onSubmit(challenge.category.id, challenge.index, answer)
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
          { text: 'Identify a basic SQL injection attempt: "SELECT * FROM users WHERE id = 1 OR 1=1"', correctAnswer: 'Yes', difficulty: 'Medium', explanation: 'This is a basic SQL injection where "OR 1=1" always evaluates to true, potentially exposing all records. Mitigation: Use parameterized queries to prevent injection.' },
          { text: 'Detect a blind SQL injection: "1 AND SUBSTRING((SELECT database()), 1, 1) = \'a\'"', correctAnswer: 'Yes', difficulty: 'Medium', explanation: 'Blind SQL injection infers data via true/false responses. Here, it checks the first character of the database name. Mitigation: Implement Web Application Firewalls (WAFs) and input validation.' },
          { text: 'Spot a time-based SQL injection: "1 WAITFOR DELAY \'0:0:5\'"', correctAnswer: 'Yes', difficulty: 'Highly Technical', explanation: 'Time-based injection delays responses to infer data, e.g., using WAITFOR DELAY. Mitigation: Use strict timeout settings and database auditing.' },
          { text: 'Identify a UNION-based SQL injection: "1 UNION SELECT username, password FROM users"', correctAnswer: 'Yes', difficulty: 'Highly Technical', explanation: 'UNION-based injection combines results from malicious queries with legitimate ones. Mitigation: Sanitize inputs and restrict database permissions.' },
          { text: 'Detect a double query injection: "1; DROP TABLE users; --"', correctAnswer: 'Yes', difficulty: 'Extremely Difficult', explanation: 'This executes a second query to drop a table, exploiting poor input handling. Mitigation: Use prepared statements and least privilege principles.' },
          { text: 'Spot an error-based SQL injection: "1 AND 1=(SELECT COUNT(*) FROM information_schema.tables)"', correctAnswer: 'Yes', difficulty: 'Extremely Difficult', explanation: 'Error-based injection relies on database errors to leak data. Mitigation: Disable error reporting and use exception handling.' },
          { text: 'Identify a stacked query injection: "1; INSERT INTO users VALUES (\'admin\', \'pass\')"', correctAnswer: 'Yes', difficulty: 'Extremely Difficult', explanation: 'Stacked queries execute multiple statements, adding unauthorized data. Mitigation: Enforce single-query execution policies.' },
          { text: 'Detect a SQL injection with comment bypass: "1\'; -- comment"', correctAnswer: 'Yes', difficulty: 'Highly Technical', explanation: 'Comments bypass input filters, enabling injection. Mitigation: Strip comments and validate input strictly.' },
          { text: 'Spot a case-sensitive SQL injection: "1 Or 1=1"', correctAnswer: 'Yes', difficulty: 'Medium', explanation: 'Case variation can bypass filters. Mitigation: Normalize input case and use ORM layers.' },
          { text: 'Identify a multi-statement injection: "1; UPDATE users SET role=\'admin\' WHERE 1=1"', correctAnswer: 'Yes', difficulty: 'Extremely Difficult', explanation: 'Multiple statements modify data maliciously. Mitigation: Limit query types and use transaction controls.' }
        ],
        xss: [
          { text: 'Identify a reflected XSS: "<script>alert(\'XSS\')</script>"', correctAnswer: 'Yes', difficulty: 'Medium', explanation: 'Reflected XSS injects scripts via user input reflected in responses. Mitigation: Escape output and use Content Security Policy (CSP).' },
          { text: 'Detect a stored XSS: "<img src=x onerror=alert(\'XSS\')>"', correctAnswer: 'Yes', difficulty: 'Medium', explanation: 'Stored XSS persists in the database, affecting all users. Mitigation: Sanitize and encode all inputs.' },
          { text: 'Spot a DOM-based XSS: "javascript:alert(\'XSS\')"', correctAnswer: 'Yes', difficulty: 'Highly Technical', explanation: 'DOM-based XSS manipulates the DOM client-side. Mitigation: Validate client-side input and use safe APIs.' },
          { text: 'Identify a self-XSS: "prompt(\'Enter code\'); eval(code)"', correctAnswer: 'Yes', difficulty: 'Highly Technical', explanation: 'Self-XSS requires user action but can be exploited socially. Mitigation: Disable eval and educate users.' },
          { text: 'Detect a blind XSS: "<svg onload=alert(\'XSS\')>"', correctAnswer: 'Yes', difficulty: 'Extremely Difficult', explanation: 'Blind XSS triggers in logs or admin panels. Mitigation: Monitor and filter logs with strict rules.' },
          { text: 'Spot a polyglot XSS: "\'--><script>alert(1)</script>"', correctAnswer: 'Yes', difficulty: 'Extremely Difficult', explanation: 'Polyglot XSS works across contexts (HTML, SQL). Mitigation: Use multi-layer input validation.' },
          { text: 'Identify an event handler XSS: "<button onclick=alert(\'XSS\')>Click</button>"', correctAnswer: 'Yes', difficulty: 'Highly Technical', explanation: 'Event handlers can execute malicious code. Mitigation: Strip event attributes and use safe event listeners.' },
          { text: 'Detect a filter evasion XSS: "<ScRiPt>alert(\'XSS\')</ScRiPt>"', correctAnswer: 'Yes', difficulty: 'Extremely Difficult', explanation: 'Case mixing evades filters. Mitigation: Normalize and blacklist scripts.' },
          { text: 'Spot a JSON-based XSS: "{x: \'<script>alert(1)</script>\'}"', correctAnswer: 'Yes', difficulty: 'Highly Technical', explanation: 'JSON can carry XSS if not parsed safely. Mitigation: Parse JSON securely on the server.' },
          { text: 'Identify a CSS-based XSS: "<style>*{background:url(\'javascript:alert(1)\')}"', correctAnswer: 'Yes', difficulty: 'Extremely Difficult', explanation: 'CSS can trigger XSS via URLs. Mitigation: Restrict CSS properties and use CSP.' }
        ],
        phish: [
          { text: 'Identify a phishing email: "Your GCash account is locked, click here to unlock"', correctAnswer: 'Yes', difficulty: 'Medium', explanation: 'Phishing uses urgency and fake links. Mitigation: Verify sender domains and avoid clicking unknown links.' },
          { text: 'Detect a smishing SMS: "Your BDO card is blocked, reply YES to unblock"', correctAnswer: 'Yes', difficulty: 'Medium', explanation: 'Smishing exploits SMS with fake prompts. Mitigation: Never reply to unsolicited texts.' },
          { text: 'Spot a spear phishing email: "Hi John, urgent invoice from [company] attached"', correctAnswer: 'Yes', difficulty: 'Highly Technical', explanation: 'Spear phishing targets individuals with personal data. Mitigation: Use email authentication (DMARC, SPF).' },
          { text: 'Identify a fake Facebook login page: "facebook-login.ph/login"', correctAnswer: 'Yes', difficulty: 'Highly Technical', explanation: 'Fake pages mimic legit sites. Mitigation: Check URL authenticity and use HTTPS.' },
          { text: 'Detect a GCash smishing with URL shortening: "bit.ly/gcash-unlock"', correctAnswer: 'Yes', difficulty: 'Extremely Difficult', explanation: 'Shortened URLs hide phishing destinations. Mitigation: Expand URLs and use security tools.' },
          { text: 'Spot a BDO phishing with logo mimicry: "bdo-online.ph (with BDO logo)"', correctAnswer: 'Yes', difficulty: 'Extremely Difficult', explanation: 'Logo mimicry deceives users. Mitigation: Verify official branding channels.' },
          { text: 'Identify a Shopee smishing: "Your order is delayed, track here"', correctAnswer: 'Yes', difficulty: 'Highly Technical', explanation: 'Smishing targets e-commerce trust. Mitigation: Contact official support directly.' },
          { text: 'Detect a Lazada phishing with attachment: "Invoice.pdf (malicious)"', correctAnswer: 'Yes', difficulty: 'Extremely Difficult', explanation: 'Attachments spread malware. Mitigation: Scan attachments with antivirus.' },
          { text: 'Spot a casino phishing: "Win $1000, claim now at casino-bonus.com"', correctAnswer: 'Yes', difficulty: 'Medium', explanation: 'Greed-based phishing is common. Mitigation: Avoid unsolicited offers.' },
          { text: 'Identify a multi-stage phishing: "Verify email, then call this number"', correctAnswer: 'Yes', difficulty: 'Extremely Difficult', explanation: 'Multi-stage attacks escalate deception. Mitigation: Block and report suspicious contacts.' }
        ],
        netsec: [
          { text: 'Identify an open port vulnerability: "Port 23 (Telnet) is open"', correctAnswer: 'Yes', difficulty: 'Medium', explanation: 'Open ports like Telnet are exploitable. Mitigation: Use firewalls and disable unused services.' },
          { text: 'Detect a weak SSL configuration: "TLS 1.0 detected"', correctAnswer: 'Yes', difficulty: 'Medium', explanation: 'Old TLS versions are vulnerable. Mitigation: Enforce TLS 1.3.' },
          { text: 'Spot a DDoS attack signature: "1000 requests/sec from single IP"', correctAnswer: 'Yes', difficulty: 'Highly Technical', explanation: 'High request rates indicate DDoS. Mitigation: Use rate limiting and CDN.' },
          { text: 'Identify a man-in-the-middle (MITM) risk: "Unencrypted Wi-Fi network"', correctAnswer: 'Yes', difficulty: 'Highly Technical', explanation: 'Unencrypted networks allow interception. Mitigation: Use VPNs.' },
          { text: 'Detect a zero-day exploit: "Unknown traffic pattern on port 443"', correctAnswer: 'Yes', difficulty: 'Extremely Difficult', explanation: 'Zero-days exploit unpatched vulnerabilities. Mitigation: Monitor and patch promptly.' },
          { text: 'Spot a ransomware C2 channel: "Outbound traffic to .onion"', correctAnswer: 'Yes', difficulty: 'Extremely Difficult', explanation: 'Darknet traffic signals ransomware. Mitigation: Block Tor and use IDS.' },
          { text: 'Identify a ARP spoofing attempt: "Duplicate IP on network"', correctAnswer: 'Yes', difficulty: 'Highly Technical', explanation: 'ARP spoofing redirects traffic. Mitigation: Use static ARP or ARP inspection.' },
          { text: 'Detect a DNS poisoning: "Resolved to wrong IP for google.com"', correctAnswer: 'Yes', difficulty: 'Extremely Difficult', explanation: 'Poisoned DNS misdirects users. Mitigation: Use DNSSEC.' },
          { text: 'Spot a brute force attack: "100 login attempts in 1 minute"', correctAnswer: 'Yes', difficulty: 'Medium', explanation: 'Excessive attempts signal brute force. Mitigation: Implement account lockout.' },
          { text: 'Identify a VLAN hopping attack: "Traffic between VLANs without routing"', correctAnswer: 'Yes', difficulty: 'Extremely Difficult', explanation: 'VLAN hopping breaches segmentation. Mitigation: Disable trunking on user ports.' }
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
