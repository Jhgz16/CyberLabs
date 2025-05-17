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
          { text: 'Is this a safe way to write a database query: "SELECT * FROM users WHERE id = 1"?', correctAnswer: 'No', explanation: 'This query is unsafe because it uses direct input without validation, making it vulnerable to SQL injection. Use prepared statements like "SELECT * FROM users WHERE id = ?" with parameters to protect against attacks.' },
          { text: 'Does adding "OR 1=1" to a query like "id = 1 OR 1=1" cause a problem?', correctAnswer: 'Yes', explanation: 'Yes, "OR 1=1" always returns true, potentially showing all user data. This is a basic SQL injection attack. Always validate and sanitize inputs.' },
          { text: 'Is "SELECT * FROM users WHERE name = \'admin\' --" a risky query?', correctAnswer: 'Yes', explanation: 'The "--" comment can bypass filters, allowing injection. Use parameterized queries to ensure safety and block such attempts.' },
          { text: 'Can "1; DROP TABLE users" harm a database?', correctAnswer: 'Yes', explanation: 'Yes, this could delete the users table if executed, a severe injection attack. Use database permissions to limit destructive commands.' },
          { text: 'Is checking user input length enough to prevent SQL injection?', correctAnswer: 'No', explanation: 'No, length checks don’t stop injection; attackers can use short malicious code. Use input validation and prepared statements instead.' },
          { text: 'Does "SELECT * FROM users WHERE id = 1 AND 1=2" hide data?', correctAnswer: 'Yes', explanation: 'Yes, "AND 1=2" makes the query return no results, which can be part of an injection test. Monitor for unusual query patterns.' },
          { text: 'Is using a blacklist of words enough to stop SQL injection?', correctAnswer: 'No', explanation: 'No, blacklists can be bypassed (e.g., with encodings). Prefer whitelists and parameterized queries for better security.' },
          { text: 'Can "UPDATE users SET role = \'admin\' WHERE 1=1" be dangerous?', correctAnswer: 'Yes', explanation: 'Yes, "WHERE 1=1" affects all rows, potentially making all users admins. Always specify safe conditions.' },
          { text: 'Is escaping single quotes enough to secure a query?', correctAnswer: 'No', explanation: 'No, escaping helps but isn’t foolproof against all injections. Use prepared statements for full protection.' },
          { text: 'Does "SELECT * FROM users WHERE password = \'pass\'" need improvement?', correctAnswer: 'Yes', explanation: 'Yes, hardcoding passwords is insecure and vulnerable. Use hashed passwords and proper authentication systems.' }
        ],
        xss: [
          { text: 'Is "<script>alert(\'Hello\')</script>" a safe input?', correctAnswer: 'No', explanation: 'No, this is a basic XSS attack that runs a script. Always encode or escape user input before displaying it.' },
          { text: 'Can "<img src=x onerror=alert(\'XSS\')>" cause a problem?', correctAnswer: 'Yes', explanation: 'Yes, this triggers a script if the image fails to load, a common XSS vector. Use HTML sanitization tools.' },
          { text: 'Is it safe to show user input directly on a webpage?', correctAnswer: 'No', explanation: 'No, unfiltered input can inject scripts. Apply output encoding to prevent XSS.' },
          { text: 'Does "<a href=\'javascript:alert(1)\'>Click</a>" pose a risk?', correctAnswer: 'Yes', explanation: 'Yes, this link runs JavaScript when clicked. Validate and sanitize URLs.' },
          { text: 'Is checking for "<script>" enough to block XSS?', correctAnswer: 'No', explanation: 'No, attackers can use other tags (e.g., <img>) or encodings. Use a content security policy (CSP).' },
          { text: 'Can "onload=alert(\'XSS\')" in an image tag be harmful?', correctAnswer: 'Yes', explanation: 'Yes, it executes when the image loads. Remove event handlers from user input.' },
          { text: 'Is escaping quotes enough to prevent XSS?', correctAnswer: 'No', explanation: 'No, it helps but doesn’t cover all cases like event handlers. Use comprehensive sanitization.' },
          { text: 'Does "<svg onload=alert(1)>" need attention?', correctAnswer: 'Yes', explanation: 'Yes, this SVG tag can run scripts. Filter SVG content and enforce CSP.' },
          { text: 'Is it safe to use eval() with user data?', correctAnswer: 'No', explanation: 'No, eval() can execute malicious scripts. Avoid it and use safer alternatives.' },
          { text: 'Can "<style>*{color:expression(alert(1))}</style>" cause issues?', correctAnswer: 'Yes', explanation: 'Yes, this uses CSS to run JavaScript. Restrict CSS properties in user input.' }
        ],
        phish: [
          { text: 'Is this email safe: "Your PayPal account is suspended, log in at paypal-security.com"?', correctAnswer: 'No', explanation: 'No, "paypal-security.com" is a fake domain (PayPal uses paypal.com). Check the sender and URL before clicking.' },
          { text: 'Does this SMS look suspicious: "Your BDO card is blocked, reply YES to fix"?', correctAnswer: 'Yes', explanation: 'Yes, banks don’t ask for replies via SMS. Contact the bank directly using official numbers.' },
          { text: 'Is this email legit: "Urgent: Your Amazon order, click here (amazon-deals2025.com)"?', correctAnswer: 'No', explanation: 'No, "amazon-deals2025.com" is not Amazon’s official site. Verify emails from known contacts only.' },
          { text: "Does 'Dear [Name], Your GCash is low, top up at gcash-support.net' seem real?", correctAnswer: 'No', explanation: 'No, GCash uses gcash.com. This is a phishing attempt. Avoid links in unsolicited emails.' },
          { text: 'Is this SMS safe: "Win P1000 from Shopee, claim at bit.ly/shopee-promo"?', correctAnswer: 'No', explanation: 'No, shortened URLs can hide phishing sites. Contact Shopee officially to verify promotions.' },
          { text: 'Does "Hello, your DHL package is delayed, track at dhl-tracking.org" look okay?', correctAnswer: 'No', explanation: 'No, DHL uses dhl.com. This is a common phishing tactic. Use the official site to track.' },
          { text: 'Is "IRS: Pay $500 tax debt, click here (irs-payment.gov)" trustworthy?', correctAnswer: 'No', explanation: 'No, the IRS doesn’t email payment links. Verify through official IRS channels (irs.gov).' },
          { text: 'Does "Netflix: Update payment, login at netflix-login2025.com" seem right?', correctAnswer: 'No', explanation: 'No, Netflix uses netflix.com. This is a phishing email. Check account status via the app.' },
          { text: 'Is this SMS okay: "Your Globe load is expiring, recharge at globe-promos.ph"?', correctAnswer: 'No', explanation: 'No, Globe uses globe.com.ph. Avoid clicking links in unsolicited texts.' },
          { text: 'Does "Dear Employee, reset password at company-login.org" need caution?', correctAnswer: 'Yes', explanation: 'Yes, verify with IT if the domain is official. Phishing often mimics internal emails.' }
        ],
        netsec: [
          { text: 'Is an open port 80 a security risk?', correctAnswer: 'Yes', explanation: 'Yes, port 80 (HTTP) can be exploited if unmonitored. Use firewalls to restrict access.' },
          { text: 'Does using "password123" weaken network security?', correctAnswer: 'Yes', explanation: 'Yes, weak passwords are easy to guess. Use strong, unique passwords with a password manager.' },
          { text: 'Is an unencrypted Wi-Fi network safe?', correctAnswer: 'No', explanation: 'No, data can be intercepted. Use WPA3 or a VPN for security.' },
          { text: 'Can too many login attempts signal an attack?', correctAnswer: 'Yes', explanation: 'Yes, this may indicate a brute force attack. Enable account lockout after failed attempts.' },
          { text: 'Is it safe to share your Wi-Fi password with anyone?', correctAnswer: 'No', explanation: 'No, it gives access to your network. Share only with trusted individuals.' },
          { text: 'Does updating software improve network security?', correctAnswer: 'Yes', explanation: 'Yes, updates patch vulnerabilities. Regularly update all devices and software.' },
          { text: 'Is a firewall necessary for home networks?', correctAnswer: 'Yes', explanation: 'Yes, it blocks unauthorized access. Enable a firewall on your router.' },
          { text: 'Can public Wi-Fi expose your data?', correctAnswer: 'Yes', explanation: 'Yes, without encryption, data can be stolen. Use a VPN on public networks.' },
          { text: 'Is disabling unused ports a good practice?', correctAnswer: 'Yes', explanation: 'Yes, it reduces attack surfaces. Close ports not in use on your devices.' },
          { text: 'Does a strong antivirus protect against network attacks?', correctAnswer: 'Yes', explanation: 'Yes, it helps detect malware that could compromise your network. Keep it updated.' }
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
