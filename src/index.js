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
    const [currentChallenge, setCurrentChallenge] = setState(null);
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
                Array.from({ length: cat.questions.length }, (_, i) =>
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
              showFeedback: showFeedback,
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
          React.createElement('span', { className: 'text-lg font-semibold' }, question.emailContent.from)
        ),
        React.createElement('div', { className: 'border-t pt-2' },
          React.createElement('p', { className: 'text-sm text-gray-500 mb-2' }, `Subject: ${question.emailContent.subject}`),
          React.createElement('p', {
            dangerouslySetInnerHTML: {
              __html: question.emailContent.body.replace(
                /https?:\/\/[^\s]+/g,
                url => `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="${url}">${url}</a>`
              )
            }
          })
        )
      ),
      question.smsContent && React.createElement('div', { className: 'border rounded-lg p-4 bg-gray-100 text-black mb-6' },
        React.createElement('div', { className: 'flex items-center mb-2' },
          React.createElement('span', { className: 'text-lg font-semibold' }, 'Messages')
        ),
        React.createElement('div', { className: 'border-t pt-2' },
          React.createElement('p', { className: 'text-sm text-gray-500' }, `From: ${question.smsContent.from}`),
          React.createElement('p', {
            dangerouslySetInnerHTML: {
              __html: question.smsContent.body.replace(
                /https?:\/\/[^\s]+/g,
                url => `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="${url}">${url}</a>`
              )
            }
          })
        )
      ),
      question.options.map((option, idx) =>
        React.createElement('button', {
          key: idx,
          className: `w-full p-2 mb-2 bg-gray-700 rounded-lg hover:bg-gray-600 ${answer === option ? 'bg-gray-500' : ''}`,
          onClick: () => {
            setAnswer(option);
            onSubmit(challenge.category.id, challenge.index, option);
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
        phish: [
          { text: 'You receive an email in Gmail. Is it legitimate?', emailContent: { from: 'support@paypa1.com', subject: 'Urgent: Account Verification Required', body: 'Your PayPaI account needs immediate verification. Click here: https://paypa1-verify.com/login', originalSender: 'support@paypal-fake.net' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Medium', explanation: 'The "1" mimics "l" in "paypa1.com", a homoglyph attack. PayPal uses paypal.com; avoid clicking suspicious links.' },
          { text: 'An SMS arrives on your phone. Is it safe?', smsContent: { from: '+639123456789', body: 'BDO Alert: Your card is locked. Reply YES to unlock or visit https://bd0-online.com', originalSender: '+639123456789' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Medium', explanation: 'The "0" mimics "o" in "bd0-online.com". BDO uses bdo.com.ph; this is a smishing attempt.' },
          { text: 'A Gmail email appears. Is it trustworthy?', emailContent: { from: 'no-reply@amazon-dea1s2025.com', subject: 'Order Confirmation #XYZ123', body: 'Your Amazon order is confirmed. Track here: https://amɑzon-deɑls2025.com/track', originalSender: 'orders@amazon-phish.org' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: 'Homoglyphs "1" and "ɑ" mimic "l" and "a". Amazon uses amazon.com; verify directly.' },
          { text: 'You get an SMS. What is it?', smsContent: { from: 'GCash Support', body: 'Low balance! Top up now at https://gcɑsh-support.net or call +639178901234', originalSender: 'support@gcash-fake.com' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Medium', explanation: 'The "ɑ" mimics "a" in "gcɑsh-support.net". GCash uses gcash.com; this is smishing.' },
          { text: 'A Gmail email arrives. Is it safe?', emailContent: { from: 'promo@sh0pee-pr0m0.com', subject: 'Win ₱10,000 Today!', body: 'Claim your prize now: https://sh0pee-pr0moti0ns.com/claim', originalSender: 'promo@shopee-fake.ph' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: '"0" mimics "o" in domain and subject, a baiting tactic. Shopee uses shopee.ph.' },
          { text: 'An SMS appears. Is it legitimate?', smsContent: { from: 'DHL Delivery', body: 'Your package is delayed. Track at https://dhl-trɑcking.org or call +12025550123', originalSender: 'delivery@dhl-phish.net' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Medium', explanation: 'The "ɑ" mimics "a" in "dhl-trɑcking.org". DHL uses dhl.com; this is smishing.' },
          { text: 'You receive a Gmail email. What is it?', emailContent: { from: 'tax@irs.g0v', subject: 'Tax Payment Overdue - Act by May 20, 2025', body: 'Pay $5,000 now: https://irs-pɑyment.g0v/urgent', originalSender: 'tax@irs-fake.us' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: 'Homoglyphs "0" and "ɑ" mimic "o" and "a"; IRS uses .gov. This is a whaling attack.' },
          { text: 'An SMS arrives. Is it safe?', smsContent: { from: '+12025550123', body: 'Netflix: Billing issue. Update at https://nètflìx.com/bill now', originalSender: 'billing@netflix-phish.com' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Highly Technical', explanation: 'Homoglyphs "è" and "ì" mimic "e" and "i". Netflix uses netflix.com; this is smishing.' },
          { text: 'A Gmail email appears. Is it trustworthy?', emailContent: { from: 'support@gmɑìl.com', subject: 'Security Breach Detected!', body: 'Verify account: https://gmɑìl-securìty.com/login', originalSender: 'security@gmail-fake.org' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Extremely Highly Technical', explanation: 'Homoglyphs "ɑ" and "ì" mimic "a" and "i"; Gmail uses accounts.google.com. Spear phishing attempt.' },
          { text: 'You get an SMS. What is it?', smsContent: { from: 'Globe PH', body: 'Load expiring! Recharge at https://gl0be-ph0ne.com/reload', originalSender: 'support@globe-fake.ph' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Highly Technical', explanation: '"0" mimics "o" in "gl0be-ph0ne.com". Globe uses globe.com.ph; this is smishing.' },
          { text: 'A Gmail email arrives. Is it safe?', emailContent: { from: 'ceo@c0mpɑny.com', subject: 'URGENT: Approve $100,000 Transfer', body: 'Act by 9 AM PST, May 18, 2025: https://c0mpɑny-trɑnsfer.com/approve', originalSender: 'ceo@company-phish.net' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Extremely Highly Technical', explanation: 'Homoglyphs "0" and "ɑ" mimic "o" and "a"; urgency suggests whaling. Verify with CEO.' },
          { text: 'An SMS appears. Is it legitimate?', smsContent: { from: 'BDO Bank', body: 'Account secure. Login at https://bd0-0nline.com/verify', originalSender: 'alert@bdo-fake.ph' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Highly Technical', explanation: '"0" mimics "o" in "bd0-0nline.com". BDO uses bdo.com.ph; this is smishing.' },
          { text: 'You receive a Gmail email. What is it?', emailContent: { from: 'support@amɑzon.com', subject: 'Order #DEF456 Shipped', body: 'Track your package: https://amɑzon-shìpping.com/track', originalSender: 'support@amazon.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Legitimate', difficulty: 'Medium', explanation: 'Domain "amɑzon.com" matches Amazon, and context is valid. This is legitimate.' },
          { text: 'An SMS arrives. Is it safe?', smsContent: { from: '+639178901234', body: 'Globe: Bill due May 20, 2025. Pay at https://globe.com.ph/bill', originalSender: '+639178901234' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Legitimate', difficulty: 'Medium', explanation: 'Domain "globe.com.ph" and official tone are valid. This is legitimate.' },
          { text: 'A Gmail email appears. Is it trustworthy?', emailContent: { from: 'security@gmɑi1.com', subject: 'Login Attempt from Philippines', body: 'Secure now: https://gmɑi1-securìty.com/login', originalSender: 'security@gmail-fake.org' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: 'Homoglyphs "ɑ" and "1" mimic "a" and "l"; Gmail uses accounts.google.com.' },
          { text: 'You get an SMS. What is it?', smsContent: { from: 'PayPal', body: '$50 payment succeeded. Details: https://paypal.com/receipt', originalSender: 'notify@paypal.com' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Legitimate', difficulty: 'Medium', explanation: 'Domain "paypal.com" and payment context are valid. This is legitimate.' },
          { text: 'A Gmail email arrives. Is it safe?', emailContent: { from: 'hr@c0mpаny.com', subject: 'New HR Policy Update', body: 'Review: https://c0mpаny-hrmgmt.com/policy', originalSender: 'hr@company-phish.net' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Extremely Highly Technical', explanation: 'Homoglyphs "0" and "а" mimic "o" and "a"; spear phishing targeting HR. Verify with HR.' },
          { text: 'An SMS appears. Is it legitimate?', smsContent: { from: 'DHL', body: 'Package #GHI789 delivered. Confirm: https://dhl.com/track', originalSender: 'tracking@dhl.com' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Legitimate', difficulty: 'Medium', explanation: 'Domain "dhl.com" and delivery context are valid. This is legitimate.' },
          { text: 'You receive a Gmail email. What is it?', emailContent: { from: 'admin@nètflìx.com', subject: 'Account Update Needed', body: 'Update payment: https://nètflìx-bìlling.com/pay', originalSender: 'admin@netflix-phish.org' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: 'Homoglyphs "è" and "ì" mimic "e" and "i". Netflix uses netflix.com.' },
          { text: 'An SMS arrives. Is it safe?', smsContent: { from: '+12025550123', body: 'Shopee: Order #JKL012 shipped. Track: https://shopee.ph', originalSender: 'orders@shopee.ph' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Legitimate', difficulty: 'Medium', explanation: 'Domain "shopee.ph" and shipping context are valid. This is legitimate.' },
          { text: 'A Gmail email appears. Is it trustworthy?', emailContent: { from: 'support@gmаіl.com', subject: 'New Device Login', body: 'Secure: https://gmаіl-securіty.com/verify', originalSender: 'support@gmail-fake.net' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Extremely Highly Technical', explanation: 'Homoglyphs "а" and "і" mimic "a" and "i". Gmail uses accounts.google.com.' },
          { text: 'You get an SMS. What is it?', smsContent: { from: 'GCash', body: 'P500 transaction confirmed. Check: https://gcash.com', originalSender: 'notify@gcash.com' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Legitimate', difficulty: 'Medium', explanation: 'Domain "gcash.com" and confirmation are valid. This is legitimate.' },
          { text: 'A Gmail email arrives. Is it safe?', emailContent: { from: 'ceo@c0mpɑny.net', subject: 'Confidential Memo - Act Now', body: 'Transfer $50,000 by 2 PM PST: https://c0mpɑny-trɑnsfer.net/approve', originalSender: 'ceo@company-phish.org' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Extremely Highly Technical', explanation: 'Homoglyphs "0" and "ɑ" mimic "o" and "a"; urgency indicates whaling. Verify with CEO.' },
          { text: 'An SMS appears. Is it legitimate?', smsContent: { from: 'BDO', body: 'Statement ready. View: https://bdo.com.ph/statement', originalSender: 'alert@bdo.com.ph' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Legitimate', difficulty: 'Medium', explanation: 'Domain "bdo.com.ph" and statement context are valid. This is legitimate.' },
          { text: 'You receive a Gmail email. What is it?', emailContent: { from: 'support@pɑypɑl.com', subject: 'Account Locked - Urgent', body: 'Unlock: https://pɑypɑl-securіty.com/unlock', originalSender: 'support@paypal-fake.org' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: 'Homoglyphs "ɑ" mimic "a". PayPal uses paypal.com; this is phishing.' },
          { text: 'An SMS arrives. Is it safe?', smsContent: { from: '+639178901234', body: 'Amazon: Order delayed. Track at https://amazon.com', originalSender: 'notify@amazon.com' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Legitimate', difficulty: 'Medium', explanation: 'Domain "amazon.com" and delay notice are valid. This is legitimate.' },
          { text: 'A Gmail email appears. Is it trustworthy?', emailContent: { from: 'admin@rnіcrosoft.com', subject: 'Critical Update Required', body: 'Install now: https://rnіcrosoft-updɑte.com/install', originalSender: 'admin@microsoft-phish.net' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Extremely Highly Technical', explanation: 'Homoglyphs "rn" and "і" mimic "m" and "i". Microsoft uses microsoft.com.' },
          { text: 'You get an SMS. What is it?', smsContent: { from: 'PayPal', body: '$20 payment failed. Fix: https://paypal.com/pay', originalSender: 'notify@paypal.com' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Legitimate', difficulty: 'Medium', explanation: 'Domain "paypal.com" and payment context are valid. This is legitimate.' },
          { text: 'A Gmail email arrives. Is it safe?', emailContent: { from: 'security@gmаіl.com.ph', subject: 'Login Alert - Act Fast', body: 'Verify: https://gmаіl-securіty.com.ph/login', originalSender: 'security@gmail-fake.ph' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: 'Homoglyphs "а" and "і" mimic "a" and "i"; ".com.ph" is suspicious. Gmail uses accounts.google.com.' },
          { text: 'An SMS appears. Is it legitimate?', smsContent: { from: 'DHL', body: 'Shipment #MNO345 delivered. Check: https://dhl.com', originalSender: 'tracking@dhl.com' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Legitimate', difficulty: 'Medium', explanation: 'Domain "dhl.com" and delivery context are valid. This is legitimate.' },
          { text: 'You receive a Gmail email. What is it?', emailContent: { from: 'support@nètflіx.com', subject: 'Billing Issue Detected', body: 'Resolve: https://nètflіx-bіllіng.com/pay', originalSender: 'support@netflix-phish.net' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: 'Homoglyphs "è" and "і" mimic "e" and "i". Netflix uses netflix.com.' },
          { text: 'An SMS arrives. Is it safe?', smsContent: { from: '+12025550123', body: 'Globe: New offer at https://globe.com.ph', originalSender: 'promo@globe.com.ph' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Legitimate', difficulty: 'Medium', explanation: 'Domain "globe.com.ph" and offer context are valid. This is legitimate.' },
          { text: 'A Gmail email appears. Is it trustworthy?', emailContent: { from: 'hr@c0mpаny.org', subject: 'Payroll Update - Confidential', body: 'Details: https://c0mpаny-hrpɑy.com/payroll', originalSender: 'hr@company-phish.org' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Extremely Highly Technical', explanation: 'Homoglyphs "0" and "а" mimic "o" and "a"; spear phishing. Verify with HR.' },
          { text: 'You get an SMS. What is it?', smsContent: { from: 'Shopee', body: 'Order #PQR678 confirmed. Track: https://shopee.ph', originalSender: 'orders@shopee.ph' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Legitimate', difficulty: 'Medium', explanation: 'Domain "shopee.ph" and order context are valid. This is legitimate.' },
          { text: 'A Gmail email arrives. Is it safe?', emailContent: { from: 'admin@gmаіl.org', subject: 'Password Reset Request', body: 'Reset: https://gmаіl-resèt.org/login', originalSender: 'admin@gmail-fake.net' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: 'Homoglyphs "а" and "è" mimic "a" and "e". Gmail uses accounts.google.com.' },
          { text: 'An SMS appears. Is it legitimate?', smsContent: { from: 'BDO', body: 'Loan approved. Login: https://bdo.com.ph', originalSender: 'alert@bdo.com.ph' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Legitimate', difficulty: 'Medium', explanation: 'Domain "bdo.com.ph" and loan context are valid. This is legitimate.' },
          { text: 'You receive a Gmail email. What is it?', emailContent: { from: 'ceo@c0mpаny.net', subject: 'Urgent Action Required', body: 'Transfer $75,000 by 3 PM PST: https://c0mpаny-trɑnsfer.net/act', originalSender: 'ceo@company-phish.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Extremely Highly Technical', explanation: 'Homoglyphs "0" and "а" mimic "o" and "a"; whaling with urgency. Verify with CEO.' },
          { text: 'An SMS arrives. Is it safe?', smsContent: { from: 'PayPal', body: 'Refund of $40 processed. Check: https://paypal.com', originalSender: 'notify@paypal.com' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Legitimate', difficulty: 'Medium', explanation: 'Domain "paypal.com" and refund context are valid. This is legitimate.' },
          { text: 'A Gmail email appears. Is it trustworthy?', emailContent: { from: 'support@amɑz0n.com', subject: 'Account Review Needed', body: 'Review: https://amɑz0n-revіew.com/check', originalSender: 'support@amazon-fake.net' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: 'Homoglyphs "ɑ" and "0" mimic "a" and "o". Amazon uses amazon.com.' },
          { text: 'You get an SMS. What is it?', smsContent: { from: 'GCash', body: 'P2000 added. Details: https://gcash.com', originalSender: 'notify@gcash.com' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Legitimate', difficulty: 'Medium', explanation: 'Domain "gcash.com" and addition context are valid. This is legitimate.' },
          { text: 'A Gmail email arrives. Is it safe?', emailContent: { from: 'security@nètflіx.net', subject: 'Login Blocked - Urgent', body: 'Unblock: https://nètflіx-securіty.net/fix', originalSender: 'security@netflix-phish.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: 'Homoglyphs "è" and "і" mimic "e" and "i". Netflix uses netflix.com.' },
          { text: 'An SMS appears. Is it legitimate?', smsContent: { from: 'DHL', body: 'Tracking #STU901 updated. Check: https://dhl.com', originalSender: 'tracking@dhl.com' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Legitimate', difficulty: 'Medium', explanation: 'Domain "dhl.com" and tracking context are valid. This is legitimate.' },
          { text: 'You receive a Gmail email. What is it?', emailContent: { from: 'admin@gmɑіl.com', subject: 'Security Update Available', body: 'Update: https://gmɑіl-updɑte.com/install', originalSender: 'admin@gmail-fake.org' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: 'Homoglyphs "ɑ" and "і" mimic "a" and "i". Gmail uses accounts.google.com.' },
          { text: 'An SMS arrives. Is it safe?', smsContent: { from: 'Shopee', body: '20% off promo at https://shopee.ph/promo', originalSender: 'promo@shopee.ph' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Legitimate', difficulty: 'Medium', explanation: 'Domain "shopee.ph" and promo context are valid. This is legitimate.' },
          { text: 'A Gmail email appears. Is it trustworthy?', emailContent: { from: 'support@pɑypɑl.com', subject: 'Fraud Alert - Act Now', body: 'Secure: https://pɑypɑl-securіty.com/protect', originalSender: 'support@paypal-fake.net' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Extremely Highly Technical', explanation: 'Homoglyphs "ɑ" mimic "a". PayPal uses paypal.com; urgency adds phishing intent.' },
          { text: 'You get an SMS. What is it?', smsContent: { from: 'BDO', body: 'Account alert. Login: https://bdo.com.ph/login', originalSender: 'alert@bdo.com.ph' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Legitimate', difficulty: 'Medium', explanation: 'Domain "bdo.com.ph" and alert context are valid. This is legitimate.' },
          { text: 'A Gmail email arrives. Is it safe?', emailContent: { from: 'hr@c0mpаny.co', subject: 'Tax Form Submission', body: 'Submit: https://c0mpаny-tɑx.com/form', originalSender: 'hr@company-phish.org' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Extremely Highly Technical', explanation: 'Homoglyphs "0" and "а" mimic "o" and "a"; spear phishing. Verify with HR.' },
          { text: 'An SMS appears. Is it legitimate?', smsContent: { from: 'PayPal', body: '$100 payment approved. View: https://paypal.com', originalSender: 'notify@paypal.com' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Legitimate', difficulty: 'Medium', explanation: 'Domain "paypal.com" and payment context are valid. This is legitimate.' },
          { text: 'You receive a Gmail email. What is it?', emailContent: { from: 'ceo@rnіcrosoft.net', subject: 'Urgent Executive Action', body: 'Approve $200,000 by 4 PM PST: https://rnіcrosoft-trɑnsfer.net/act', originalSender: 'ceo@microsoft-phish.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Extremely Highly Technical', explanation: 'Homoglyphs "rn" and "і" mimic "m" and "i"; whaling with urgency. Verify with CEO.' },
          { text: 'An SMS arrives. Is it safe?', smsContent: { from: 'GCash', body: 'P300 cash-in confirmed. Check: https://gcash.com', originalSender: 'notify@gcash.com' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Legitimate', difficulty: 'Medium', explanation: 'Domain "gcash.com" and cash-in context are valid. This is legitimate.' },
          { text: 'A Gmail email appears. Is it trustworthy?', emailContent: { from: 'admin@gmɑіl.com', subject: 'Login Warning - Immediate Action', body: 'Secure: https://gmɑіl-wɑrnіng.com/verify', originalSender: 'admin@gmail-fake.net' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: 'Homoglyphs "ɑ" and "і" mimic "a" and "i". Gmail uses accounts.google.com.' },
          { text: 'You get an SMS. What is it?', smsContent: { from: 'Shopee', body: 'Order #VWX234 shipped. Track: https://shopee.ph', originalSender: 'orders@shopee.ph' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Legitimate', difficulty: 'Medium', explanation: 'Domain "shopee.ph" and shipping context are valid. This is legitimate.' },
          { text: 'A Gmail email arrives. Is it safe?', emailContent: { from: 'security@nètflіx.com', subject: 'Account Issue - Urgent', body: 'Fix: https://nètflіx-securіty.com/resolve', originalSender: 'security@netflix-phish.org' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Extremely Highly Technical', explanation: 'Homoglyphs "è" and "і" mimic "e" and "i". Netflix uses netflix.com.' },
          { text: 'An SMS appears. Is it legitimate?', smsContent: { from: 'DHL', body: 'Delivery scheduled. Confirm: https://dhl.com', originalSender: 'tracking@dhl.com' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Legitimate', difficulty: 'Medium', explanation: 'Domain "dhl.com" and delivery context are valid. This is legitimate.' }
        ],
        netsec: [
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
        ],
        forensics: [
          { text: 'You investigate a breach. A log shows unusual traffic to 192.168.1.100. What to do?', options: ['Ignore', 'Analyze logs', 'Reboot'], correctAnswer: 'Analyze logs', difficulty: 'Medium', explanation: 'Unusual traffic may indicate a breach. Review logs for patterns or anomalies.' },
          { text: 'A user reports a pop-up. You find "svchost.exe" spiking CPU. What’s likely?', options: ['Normal', 'Malware', 'Update'], correctAnswer: 'Malware', difficulty: 'Medium', explanation: 'Unexpected "svchost.exe" activity suggests malware. Perform a forensic analysis.' },
          { text: 'A deleted file "data.log" is found. What to do?', options: ['Ignore', 'Recover it', 'Delete it'], correctAnswer: 'Recover it', difficulty: 'Highly Technical', explanation: 'Deleted files may hold evidence. Use forensic tools to recover and analyze.' },
          { text: 'A log shows traffic on port 4444 to 10.0.0.5. What might it be?', options: ['Normal', 'C2', 'Backup'], correctAnswer: 'C2', difficulty: 'Highly Technical', explanation: 'Port 4444 is often used for command-and-control. Investigate the destination.' },
          { text: 'You find "ransom_note.txt" with a crypto wallet address. What’s happening?', options: ['Backup', 'Ransomware', 'Update'], correctAnswer: 'Ransomware', difficulty: 'Medium', explanation: 'This indicates a ransomware attack. Isolate the system and report it.' },
          { text: 'A browser history shows "malware-site.com". What to check?', options: ['Cache', 'Network logs', 'Cookies'], correctAnswer: 'Network logs', difficulty: 'Highly Technical', explanation: 'Network logs can trace connections to malicious sites for evidence.' },
          { text: 'A registry shows "Run\\suspicious.exe". What is it?', options: ['Startup', 'System', 'Malware'], correctAnswer: 'Malware', difficulty: 'Highly Technical', explanation: 'Run keys launching "suspicious.exe" suggest persistence. Analyze the file.' },
          { text: 'A file "backup.zip" was accessed, then deleted. What next?', options: ['Ignore', 'Recover', 'Reboot'], correctAnswer: 'Recover', difficulty: 'Highly Technical', explanation: 'Deleted backups may contain breach evidence. Recover with forensic tools.' },
          { text: 'A PC shows high disk I/O. What to investigate?', options: ['RAM', 'Hard drive', 'Network'], correctAnswer: 'Hard drive', difficulty: 'Medium', explanation: 'High I/O may indicate data exfiltration. Check for suspicious files.' },
          { text: 'A user clicked a link, and "explorer.exe" spiked. What to do?', options: ['Ignore', 'Monitor', 'Analyze'], correctAnswer: 'Analyze', difficulty: 'Highly Technical', explanation: 'Unusual "explorer.exe" activity may indicate malware. Perform a forensic analysis.' }
        ],
        crypto: [
          { text: 'You see a code "SGVsbG8=". What is it?', options: ['Base64', 'AES', 'MD5'], correctAnswer: 'Base64', difficulty: 'Medium', explanation: 'Decodes to "Hello". Base64 is common for encoding data.' },
          { text: 'A file uses key "secret" for encryption. What type?', options: ['Symmetric', 'Asymmetric', 'Hash'], correctAnswer: 'Symmetric', difficulty: 'Medium', explanation: 'A single key suggests symmetric encryption (e.g., AES). Use a strong key.' },
          { text: 'A hash is "e80b5017098950fc58aad83c8c14978e". What type?', options: ['MD5', 'SHA-1', 'SHA-256'], correctAnswer: 'MD5', difficulty: 'Highly Technical', explanation: 'This 32-character hash is MD5. It’s weak; use SHA-256.' },
          { text: 'A cipher shifts "HI" to "KL". What is it?', options: ['Caesar', 'Vigenère', 'AES'], correctAnswer: 'Caesar', difficulty: 'Medium', explanation: 'A shift of 2 (H->K, I->L) is a Caesar cipher. Break it with frequency analysis.' },
          { text: 'A site’s private RSA key is leaked. What to do?', options: ['Nothing', 'New keys', 'Reset site'], correctAnswer: 'New keys', difficulty: 'Highly Technical', explanation: 'A leaked key compromises security. Generate new RSA keys.' },
          { text: 'A password is hashed as "pass123". Is this secure?', options: ['Yes', 'No', 'Maybe'], correctAnswer: 'No', difficulty: 'Medium', explanation: 'Plaintext hashing is insecure. Use bcrypt with a salt.' },
          { text: 'You see "U2FsdGVkX18". What encryption?', options: ['Base64', 'AES', 'RSA'], correctAnswer: 'AES', difficulty: 'Highly Technical', explanation: 'This is AES (OpenSSL format). Decrypt with the correct key.' },
          { text: 'A message "WKH" decodes to "THE". What cipher?', options: ['Caesar', 'Substitution', 'ROT13'], correctAnswer: 'Caesar', difficulty: 'Highly Technical', explanation: 'A shift of 3 (W->T, K->H, H->E) is Caesar. Analyze shifts to decode.' },
          { text: 'A site uses TLS 1.1. Is it secure?', options: ['Yes', 'No', 'Maybe'], correctAnswer: 'No', difficulty: 'Medium', explanation: 'TLS 1.1 is outdated. Upgrade to TLS 1.3 for security.' },
          { text: 'A 64-bit key encrypts a file. Is it safe?', options: ['Yes', 'No', 'Maybe'], correctAnswer: 'No', difficulty: 'Highly Technical', explanation: '64-bit keys (e.g., DES) are weak. Use 256-bit keys like AES-256.' }
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
