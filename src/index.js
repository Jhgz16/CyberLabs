console.log('index.js loaded');
try {
  const React = window.React;
  const ReactDOM = window.ReactDOM;
  const useState = React.useState;
  const useEffect = React.useEffect;
  console.log('React and ReactDOM loaded:', React, ReactDOM);

  // Function to load JSON data (simulated here as inline data)
  function loadJson(src) {
    return Promise.resolve({
      exercisesData: {
        phish: [
          { text: 'You received an email from what appears to be PayPal regarding an urgent account verification...', emailContent: { from: 'support@paypa1.com', subject: 'Urgent: Action Required - Verify Your PayPal Account', body: 'Dear Valued PayPal User,<br>We have detected unusual activity...', maskedUrl: 'https://secure.paypal-login.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: ['The sender’s email domain is "paypa1.com", not "paypal.com".', 'It uses a homoglyph: the character "1" mimics the letter "l".', 'The link’s display URL doesn’t match the masked URL, indicating URL spoofing.', 'PayPal never asks for credentials via email links; verify directly on paypal.com.', 'Check email headers for discrepancies in the sender’s domain.'] },
          { text: 'An official-looking email from Amazon confirms an order...', emailContent: { from: 'no-reply@amazon-dea1s2025.com', subject: 'Order Confirmation #XYZ123', body: 'Hello [Your Name],<br>Thank you for your recent purchase...', maskedUrl: 'https://amazon.order-tracking.org' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: ['The sender’s domain "amazon-dea1s2025.com" is suspicious.', 'It uses a homoglyph: "1" replaces "l" in "deals".', 'The tracking link’s displayed URL differs from the masked URL.', 'Amazon’s official domain is "amazon.com"; log in directly to verify.', 'Inspect email headers for sender authenticity.'] }
        ],
        netsec: [
          { text: 'A network administrator notices unusual traffic on port 445. What might this indicate?', options: ['Legitimate file sharing', 'SMB exploit attempt', 'DNS resolution issue', 'HTTP traffic overflow'], correctAnswer: 'SMB exploit attempt', difficulty: 'Medium', explanation: ['Port 445 is associated with SMB (Server Message Block).', 'Unusual traffic on this port often indicates an exploit attempt, such as WannaCry.', 'Monitor for abnormal connection patterns or data exfiltration.', 'Implement firewall rules to restrict unauthorized access to port 445.', 'Conduct a security audit to identify vulnerable systems.'] },
          { text: 'Which protocol is best for securing remote access to a server?', options: ['Telnet', 'SSH', 'FTP', 'HTTP'], correctAnswer: 'SSH', difficulty: 'Easy', explanation: ['SSH (Secure Shell) encrypts data during remote access.', 'Telnet transmits data in plaintext, making it insecure.', 'FTP is for file transfer, not secure remote access.', 'HTTP is for web traffic, not secure shell access.', 'Always use SSH with strong authentication methods like key-based login.'] }
        ],
        forensics: [
          { text: 'What is the first step in analyzing a compromised system?', options: ['Reboot the system', 'Isolate the system', 'Delete suspicious files', 'Update the antivirus'], correctAnswer: 'Isolate the system', difficulty: 'Medium', explanation: ['Isolating the system prevents further damage or data exfiltration.', 'Rebooting can destroy volatile evidence like RAM data.', 'Deleting files removes potential evidence needed for analysis.', 'Updating antivirus should occur after evidence collection.', 'Use a write-blocker to preserve the system’s state for forensic imaging.'] },
          { text: 'Which file system metadata can help identify a file’s creation time?', options: ['File extension', 'MAC times', 'File size', 'Permissions'], correctAnswer: 'MAC times', difficulty: 'Hard', explanation: ['MAC times include Modified, Accessed, and Created timestamps.', 'File extension indicates type, not creation time.', 'File size is unrelated to creation metadata.', 'Permissions control access, not timestamps.', 'Analyze MAC times using tools like Autopsy or The Sleuth Kit.'] }
        ],
        crypto: [
          { text: 'Which algorithm is widely used for secure hashing?', options: ['MD5', 'SHA-256', 'DES', 'RSA'], correctAnswer: 'SHA-256', difficulty: 'Easy', explanation: ['SHA-256 is a secure hash function resistant to collisions.', 'MD5 is deprecated due to known vulnerabilities.', 'DES is a symmetric encryption algorithm, not a hash.', 'RSA is for asymmetric encryption, not hashing.', 'Use SHA-256 for integrity checks in secure applications.'] },
          { text: 'What is a key characteristic of a strong encryption key?', options: ['Short length', 'Randomness', 'Predictable pattern', 'Reuse across systems'], correctAnswer: 'Randomness', difficulty: 'Medium', explanation: ['Randomness ensures the key is hard to guess or brute-force.', 'Short length weakens encryption against modern attacks.', 'Predictable patterns make keys vulnerable to analysis.', 'Reusing keys across systems increases risk if one is compromised.', 'Generate keys with a cryptographically secure random number generator.'] }
        ]
      },
      en: { title: 'Cybersecurity Lab', dashboard: 'Dashboard', scoreFor: 'Score for', yourAnswer: 'Your answer', correctAnswer: 'Correct answer', feedback: 'Feedback', next: 'Next' },
      es: { title: 'Laboratorio de Ciberseguridad', dashboard: 'Tablero', scoreFor: 'Puntuación para', yourAnswer: 'Tu respuesta', correctAnswer: 'Respuesta correcta', feedback: 'Comentarios', next: 'Siguiente' }
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
              className: 'mb-4 p-2 bg-gray-700 rounded-lg',
              value: lang,
              onChange: function(e) { setLang(e.target.value); }
            },
              React.createElement('option', { value: 'en' }, 'English'),
              React.createElement('option', { value: 'es' }, 'Español')
            ),
            categories.map(cat =>
              React.createElement('div', { key: cat.id, className: 'mb-2' },
                React.createElement('h3', { className: 'text-lg font-semibold mb-2' }, cat.name),
                Array.from({ length: cat.questions.length }, (_, i) =>
                  React.createElement('button', {
                    key: i,
                    className: 'w-full p-2 bg-gray-600 rounded-lg hover:bg-gray-700 mb-1 transition duration-200 ease-in-out shadow-md',
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
              showFeedback,
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
            Array.from({ length: cat.questions.length }, (_, i) =>
              React.createElement('p', { key: i, className: 'ml-4' },
                `Challenge ${i + 1} (${cat.questions[i].difficulty}): `,
                scores[`${cat.id}-${i}`] !== undefined ? `${scores[`${cat.id}-${i}`]}%` : 'Not attempted'
              )
            )
          )
        )
      )
    );
  };

  const Challenge = function(props) {
    const { challenge, onSubmit, showFeedback, i18n } = props;
    const [answer, setAnswer] = useState('');
    const question = challenge.category.questions[challenge.index];

    return React.createElement('div', { className: 'bg-gray-800 p-8 rounded-lg shadow-lg' },
      React.createElement('h2', { className: 'text-2xl font-bold mb-4' }, `${challenge.category.name} - Challenge ${challenge.index + 1} (${question.difficulty})`),
      React.createElement('p', { className: 'text-gray-400 mb-6' }, question.text),
      question.emailContent && React.createElement('div', { className: 'border rounded-lg p-4 bg-white text-black mb-6' },
        React.createElement('div', { className: 'flex items-center mb-2' },
          React.createElement('img', { src: 'https://www.google.com/favicon.ico', alt: 'Gmail', className: 'w-6 h-6 mr-2' }),
          React.createElement('span', { className: 'text-lg font-semibold' }, 'Gmail')
        ),
        React.createElement('div', { className: 'border-t pt-2' },
          React.createElement('p', { className: 'text-sm text-gray-500 mb-2' }, `From: `, React.createElement('span', { title: question.emailContent.from }, `${question.emailContent.from}`)),
          React.createElement('p', { className: 'text-sm text-gray-500 mb-2' }, `Subject: ${question.emailContent.subject}`),
          React.createElement('p', {
            dangerouslySetInnerHTML: {
              __html: question.emailContent.body.replace(
                /https?:\/\/[^\s]+/g,
                url => `<a href="#" title="${question.emailContent.maskedUrl || url}" style="color: blue; text-decoration: underline;">${url}</a>`
              )
            }
          })
        )
      ),
      question.options.map((option, idx) =>
        React.createElement('button', {
          key: idx,
          className: `w-full p-3 mb-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition duration-300 ease-in-out shadow-md hover:shadow-lg ${answer === option ? 'bg-gray-500' : ''} ${showFeedback ? 'cursor-not-allowed opacity-50' : ''}`,
          onClick: () => {
            if (!showFeedback) {
              setAnswer(option);
              onSubmit(challenge.category.id, challenge.index, option);
            }
          },
          disabled: showFeedback
        }, option)
      )
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
        React.createElement('div', { className: 'text-gray-300 mb-4' },
          React.createElement('p', { className: 'font-semibold mb-2' }, 'Explanation:'),
          React.createElement('ul', { className: 'list-disc pl-5 space-y-2' },
            question.explanation.map((point, idx) =>
              React.createElement('li', { key: idx }, point)
            )
          )
        ),
        React.createElement('button', {
          className: 'p-2 bg-green-600 rounded-lg hover:bg-green-700 transition duration-200 ease-in-out shadow-md',
          onClick: onNext
        }, i18n.next || 'Next')
      )
    );
  };

  // Load JSON files and render app
  const jsonFiles = [
    './src/assets/data/exercises.json',
    './src/assets/data/i18n/en.json',
    './src/assets/data/i18n/es.json'
  ];

  Promise.all(jsonFiles.map(src => loadJson(src)))
    .then(results => {
      console.log('All JSON loaded');
      window.exercisesData = results[0].exercisesData;
      window.en = results[1].en;
      window.es = results[2].es;
      ReactDOM.render(React.createElement(App), document.getElementById('root'));
    })
    .catch(err => console.error('Failed to load app:', err));
} catch (e) {
  console.error('Initialization error:', e);
}
