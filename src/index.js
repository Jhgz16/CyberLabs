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
          React.createElement('p', { className: 'text-sm text-gray-500' }, `From: ${question.emailContent.from}`),
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
          className: `w-full p-2 mb-2 bg-gray-700 rounded-lg hover:bg-gray-600 ${answer === option ? 'bg-gray-500' : ''} ${showFeedback ? 'cursor-not-allowed opacity-50' : ''}`,
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
          { text: 'You receive an email in Gmail. Is it legitimate?', emailContent: { from: 'support@paypa1.com', subject: 'Urgent: Account Verification', body: 'Your PayPaI account needs verification. Click here: <a href="https://paypa1.com/verify" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://paypa1.com/verify">paypa1.com/verify</a>' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Medium', explanation: 'The homoglyph "1" mimics "l" in "paypa1.com" and "PayPaI", a phishing tactic. PayPal uses paypal.com. Avoid clicking links.' },
          { text: 'An SMS arrives on your phone. Is it safe?', smsContent: { from: '+639123456789', body: 'Your BDO card is locked. Reply YES to unlock.' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Medium', explanation: 'Banks don’t request replies via SMS. This is smishing. Contact BDO officially.' },
          { text: 'A Gmail email appears. Is it trustworthy?', emailContent: { from: 'no-reply@amazon-dea1s2025.com', subject: 'Order Confirmation #XYZ123', body: 'Your Amazon order is confirmed. Track here: <a href="https://amazon-dea1s2025.com/track" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://amazon-dea1s2025.com/track">amazon-dea1s2025.com/track</a>' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: 'The homoglyph "1" replaces "l" in "dea1s", and the domain mimics Amazon. Verify on amazon.com.' },
          { text: 'You get an SMS. What is it?', smsContent: { from: 'GCash Support', body: 'Low balance alert. Top up at <a href="https://gcash-support.net" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://gcash-support.net">gcash-support.net</a>' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Medium', explanation: 'GCash uses gcash.com, not gcash-support.net. This is smishing. Use the official app.' },
          { text: 'A Gmail email arrives. Is it safe?', emailContent: { from: 'promo@shopee-prom0.com', subject: 'Win P5000!', body: 'Claim your prize: <a href="https://bit.ly/sh0pee-promo" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://bit.ly/sh0pee-promo">bit.ly/sh0pee-promo</a>' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: 'The "0" mimics "o", and the shortened URL hides the site. Shopee uses shopee.ph. Verify directly.' },
          { text: 'An SMS appears. Is it legitimate?', smsContent: { from: 'DHL Tracking', body: 'Your package is delayed. Track at <a href="https://dhl-tracking.org" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://dhl-tracking.org">dhl-tracking.org</a>' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Medium', explanation: 'DHL uses dhl.com. This is smishing. Use the official site to track.' },
          { text: 'You receive a Gmail email. What is it?', emailContent: { from: 'tax@irs.gov.ph', subject: 'Tax Payment Due', body: 'Pay $2000 by May 20, 2025. Click: <a href="https://irs-payment.gov.ph" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://irs-payment.gov.ph">irs-payment.gov.ph</a>' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: 'The ".gov.ph" is suspicious (IRS uses .gov). This is a whaling attack targeting officials. Verify via irs.gov.' },
          { text: 'An SMS arrives. Is it safe?', smsContent: { from: '+12025550123', body: 'Netflix billing issue. Update at <a href="https://netf1ix.com" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://netf1ix.com">netf1ix.com</a>' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Highly Technical', explanation: 'The "1" mimics "l" in "netf1ix.com". Netflix uses netflix.com. This is smishing.' },
          { text: 'A Gmail email appears. Is it trustworthy?', emailContent: { from: 'support@gmaìl.com', subject: 'Account Security Alert', body: 'Your account is at risk. Verify: <a href="https://gmaìl.com/security" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://gmaìl.com/security">gmaìl.com/security</a>' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Extremely Highly Technical', explanation: 'The homoglyph "ì" mimics "i" in "gmaìl.com". This is a spear phishing attack. Use accounts.google.com.' },
          { text: 'You get an SMS. What is it?', smsContent: { from: 'Globe PH', body: 'Your load expires. Recharge at <a href="https://gl0be.com.ph" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://gl0be.com.ph">gl0be.com.ph</a>' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Highly Technical', explanation: 'The "0" mimics "o" in "gl0be.com.ph". Globe uses globe.com.ph. This is smishing.' },
          { text: 'A Gmail email arrives. Is it safe?', emailContent: { from: 'ceo@company.c0m', subject: 'Urgent: Wire Transfer', body: 'Approve $50,000 transfer by EOD. Link: <a href="https://company.c0m/approve" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://company.c0m/approve">company.c0m/approve</a>' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Extremely Highly Technical', explanation: 'The "0" mimics "o" in "c0m", a whaling attack targeting executives. Verify with the CEO directly.' },
          { text: 'An SMS appears. Is it legitimate?', smsContent: { from: 'BDO Bank', body: 'Your account is secure. Login at <a href="https://bdo-on1ine.com" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://bdo-on1ine.com">bdo-on1ine.com</a>' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Highly Technical', explanation: 'The "1" mimics "l" in "on1ine.com". BDO uses bdo.com.ph. This is smishing.' },
          { text: 'You receive a Gmail email. What is it?', emailContent: { from: 'support@amazon.com', subject: 'Order Shipped', body: 'Your order #ABC123 shipped. Track: <a href="https://amazon.com/track" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://amazon.com/track">amazon.com/track</a>' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Legitimate', difficulty: 'Medium', explanation: 'The domain "amazon.com" and context match Amazon’s official communication. This is legitimate.' },
          { text: 'An SMS arrives. Is it safe?', smsContent: { from: '+639178901234', body: 'Globe: Your bill is due. Pay at <a href="https://globe.com.ph/bill" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://globe.com.ph/bill">globe.com.ph/bill</a>' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Legitimate', difficulty: 'Medium', explanation: 'The domain "globe.com.ph" and official tone are valid. This is a legitimate reminder.' },
          { text: 'A Gmail email appears. Is it trustworthy?', emailContent: { from: 'security@gmai1.com', subject: 'Login Attempt', body: 'Unusual login from Philippines. Secure: <a href="https://gmai1.com/login" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://gmai1.com/login">gmai1.com/login</a>' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: 'The "1" mimics "l" in "gmai1.com". Gmail uses accounts.google.com. This is phishing.' },
          { text: 'You get an SMS. What is it?', smsContent: { from: 'PayPal', body: 'Your payment of $50 succeeded. Details: <a href="https://paypal.com/receipt" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://paypal.com/receipt">paypal.com/receipt</a>' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Legitimate', difficulty: 'Medium', explanation: 'The domain "paypal.com" and payment context are valid. This is a legitimate receipt.' },
          { text: 'A Gmail email arrives. Is it safe?', emailContent: { from: 'hr@compaпy.com', subject: 'New Policy', body: 'Review policy at <a href="https://compaпy.com/policy" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://compaпy.com/policy">compaпy.com/policy</a>' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Extremely Highly Technical', explanation: 'The "п" (Cyrillic) mimics "n" in "compaпy.com". This is spear phishing. Verify with HR.' },
          { text: 'An SMS appears. Is it legitimate?', smsContent: { from: 'DHL', body: 'Package delivered. Confirm at <a href="https://dhl.com/track" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://dhl.com/track">dhl.com/track</a>' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Legitimate', difficulty: 'Medium', explanation: 'The domain "dhl.com" and delivery context are valid. This is legitimate.' },
          { text: 'You receive a Gmail email. What is it?', emailContent: { from: 'admin@netf1ix.com', subject: 'Account Update', body: 'Update payment: <a href="https://netf1ix.com/bill" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://netf1ix.com/bill">netf1ix.com/bill</a>' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: 'The "1" mimics "l" in "netf1ix.com". Netflix uses netflix.com. This is phishing.' },
          { text: 'An SMS arrives. Is it safe?', smsContent: { from: '+12025550123', body: 'Shopee: Order #123 shipped. Track at <a href="https://shopee.ph" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://shopee.ph">shopee.ph</a>' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Legitimate', difficulty: 'Medium', explanation: 'The domain "shopee.ph" and order context are valid. This is legitimate.' },
          { text: 'A Gmail email appears. Is it trustworthy?', emailContent: { from: 'support@gmaïl.com', subject: 'Security Alert', body: 'Login from new device. Secure: <a href="https://gmaïl.com" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://gmaïl.com">gmaïl.com</a>' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Extremely Highly Technical', explanation: 'The "ï" mimics "i" in "gmaïl.com". Gmail uses accounts.google.com. This is phishing.' },
          { text: 'You get an SMS. What is it?', smsContent: { from: 'GCash', body: 'Transaction of P500 confirmed. Check: <a href="https://gcash.com" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://gcash.com">gcash.com</a>' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Legitimate', difficulty: 'Medium', explanation: 'The domain "gcash.com" and confirmation are valid. This is legitimate.' },
          { text: 'A Gmail email arrives. Is it safe?', emailContent: { from: 'ceo@compɑny.com', subject: 'Urgent Action', body: 'Approve $100,000 transfer: <a href="https://compɑny.com/approve" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://compɑny.com/approve">compɑny.com/approve</a>' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Extremely Highly Technical', explanation: 'The "ɑ" mimics "a" in "compɑny.com", a whaling attack. Verify with the CEO.' },
          { text: 'An SMS appears. Is it legitimate?', smsContent: { from: 'BDO', body: 'Your statement is ready. View: <a href="https://bdo.com.ph/statement" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://bdo.com.ph/statement">bdo.com.ph/statement</a>' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Legitimate', difficulty: 'Medium', explanation: 'The domain "bdo.com.ph" and statement context are valid. This is legitimate.' },
          { text: 'You receive a Gmail email. What is it?', emailContent: { from: 'support@pɑypal.com', subject: 'Account Locked', body: 'Unlock: <a href="https://pɑypal.com/unlock" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://pɑypal.com/unlock">pɑypal.com/unlock</a>' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: 'The "ɑ" mimics "a" in "pɑypal.com". PayPal uses paypal.com. This is phishing.' },
          { text: 'An SMS arrives. Is it safe?', smsContent: { from: '+639178901234', body: 'Amazon: Order delayed. Track at <a href="https://amazon.com" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://amazon.com">amazon.com</a>' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Legitimate', difficulty: 'Medium', explanation: 'The domain "amazon.com" and delay notice are valid. This is legitimate.' },
          { text: 'A Gmail email appears. Is it trustworthy?', emailContent: { from: 'admin@rnicrosoft.com', subject: 'Software Update', body: 'Install update: <a href="https://rnicrosoft.com/update" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://rnicrosoft.com/update">rnicrosoft.com/update</a>' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Extremely Highly Technical', explanation: 'The "rn" mimics "m" in "rnicrosoft.com", targeting Microsoft users. Verify at microsoft.com.' },
          { text: 'You get an SMS. What is it?', smsContent: { from: 'PayPal', body: 'Your $20 payment failed. Fix: <a href="https://paypal.com/pay" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://paypal.com/pay">paypal.com/pay</a>' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Legitimate', difficulty: 'Medium', explanation: 'The domain "paypal.com" and payment context are valid. This is legitimate.' },
          { text: 'A Gmail email arrives. Is it safe?', emailContent: { from: 'security@gmaìl.com.ph', subject: 'Login Alert', body: 'Verify: <a href="https://gmaìl.com.ph/login" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://gmaìl.com.ph/login">gmaìl.com.ph/login</a>' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: 'The "ì" mimics "i", and ".com.ph" is suspicious. Gmail uses accounts.google.com.' },
          { text: 'An SMS appears. Is it legitimate?', smsContent: { from: 'DHL', body: 'Shipment #XYZ123 delivered. Check: <a href="https://dhl.com" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://dhl.com">dhl.com</a>' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Legitimate', difficulty: 'Medium', explanation: 'The domain "dhl.com" and delivery context are valid. This is legitimate.' },
          { text: 'You receive a Gmail email. What is it?', emailContent: { from: 'support@nètflix.com', subject: 'Billing Issue', body: 'Resolve: <a href="https://nètflix.com/bill" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://nètflix.com/bill">nètflix.com/bill</a>' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: 'The "è" mimics "e" in "nètflix.com". Netflix uses netflix.com. This is phishing.' },
          { text: 'An SMS arrives. Is it safe?', smsContent: { from: '+12025550123', body: 'Globe: New offer at <a href="https://globe.com.ph" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://globe.com.ph">globe.com.ph</a>' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Legitimate', difficulty: 'Medium', explanation: 'The domain "globe.com.ph" and offer context are valid. This is legitimate.' },
          { text: 'A Gmail email appears. Is it trustworthy?', emailContent: { from: 'hr@compаny.org', subject: 'Payroll Update', body: 'Details: <a href="https://compаny.org/payroll" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://compаny.org/payroll">compаny.org/payroll</a>' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Extremely Highly Technical', explanation: 'The "а" mimics "a" in "compаny.org", a spear phishing attempt. Verify with HR.' },
          { text: 'You get an SMS. What is it?', smsContent: { from: 'Shopee', body: 'Order #456 confirmed. Track: <a href="https://shopee.ph" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://shopee.ph">shopee.ph</a>' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Legitimate', difficulty: 'Medium', explanation: 'The domain "shopee.ph" and order context are valid. This is legitimate.' },
          { text: 'A Gmail email arrives. Is it safe?', emailContent: { from: 'admin@gmaìl.org', subject: 'Password Reset', body: 'Reset: <a href="https://gmaìl.org/reset" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://gmaìl.org/reset">gmaìl.org/reset</a>' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: 'The "ì" mimics "i", and ".org" is suspicious. Gmail uses accounts.google.com.' },
          { text: 'An SMS appears. Is it legitimate?', smsContent: { from: 'BDO', body: 'Your loan approved. Login: <a href="https://bdo.com.ph" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://bdo.com.ph">bdo.com.ph</a>' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Legitimate', difficulty: 'Medium', explanation: 'The domain "bdo.com.ph" and loan context are valid. This is legitimate.' },
          { text: 'You receive a Gmail email. What is it?', emailContent: { from: 'ceo@compаny.net', subject: 'Confidential', body: 'Send $10,000: <a href="https://compаny.net/transfer" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://compаny.net/transfer">compаny.net/transfer</a>' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Extremely Highly Technical', explanation: 'The "а" mimics "a", a whaling attack. Verify with the CEO.' },
          { text: 'An SMS arrives. Is it safe?', smsContent: { from: 'PayPal', body: 'Refund of $30 processed. Check: <a href="https://paypal.com" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://paypal.com">paypal.com</a>' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Legitimate', difficulty: 'Medium', explanation: 'The domain "paypal.com" and refund context are valid. This is legitimate.' },
          { text: 'A Gmail email appears. Is it trustworthy?', emailContent: { from: 'support@amɑzon.com', subject: 'Account Review', body: 'Review: <a href="https://amɑzon.com/review" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://amɑzon.com/review">amɑzon.com/review</a>' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: 'The "ɑ" mimics "a" in "amɑzon.com". Amazon uses amazon.com. This is phishing.' },
          { text: 'You get an SMS. What is it?', smsContent: { from: 'GCash', body: 'P1000 added. Details: <a href="https://gcash.com" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://gcash.com">gcash.com</a>' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Legitimate', difficulty: 'Medium', explanation: 'The domain "gcash.com" and addition context are valid. This is legitimate.' },
          { text: 'A Gmail email arrives. Is it safe?', emailContent: { from: 'security@nètflix.net', subject: 'Login Blocked', body: 'Unblock: <a href="https://nètflix.net/unblock" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://nètflix.net/unblock">nètflix.net/unblock</a>' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: 'The "è" mimics "e", and ".net" is suspicious. Netflix uses netflix.com.' },
          { text: 'An SMS appears. Is it legitimate?', smsContent: { from: 'DHL', body: 'Tracking #DEF456 updated. Check: <a href="https://dhl.com" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://dhl.com">dhl.com</a>' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Legitimate', difficulty: 'Medium', explanation: 'The domain "dhl.com" and tracking context are valid. This is legitimate.' },
          { text: 'You receive a Gmail email. What is it?', emailContent: { from: 'admin@gmɑil.com', subject: 'Security Update', body: 'Update: <a href="https://gmɑil.com/update" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://gmɑil.com/update">gmɑil.com/update</a>' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: 'The "ɑ" mimics "a" in "gmɑil.com". Gmail uses accounts.google.com.' },
          { text: 'An SMS arrives. Is it safe?', smsContent: { from: 'Shopee', body: 'Promo: 20% off at <a href="https://shopee.ph/promo" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://shopee.ph/promo">shopee.ph/promo</a>' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Legitimate', difficulty: 'Medium', explanation: 'The domain "shopee.ph" and promo context are valid. This is legitimate.' },
          { text: 'A Gmail email appears. Is it trustworthy?', emailContent: { from: 'support@pɑypɑl.com', subject: 'Fraud Alert', body: 'Secure: <a href="https://pɑypɑl.com/secure" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://pɑypɑl.com/secure">pɑypɑl.com/secure</a>' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Extremely Highly Technical', explanation: 'The "ɑ" mimics "a" in "pɑypɑl.com". PayPal uses paypal.com. This is phishing.' },
          { text: 'You get an SMS. What is it?', smsContent: { from: 'BDO', body: 'Account alert. Login: <a href="https://bdo.com.ph/login" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://bdo.com.ph/login">bdo.com.ph/login</a>' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Legitimate', difficulty: 'Medium', explanation: 'The domain "bdo.com.ph" and alert context are valid. This is legitimate.' },
          { text: 'A Gmail email arrives. Is it safe?', emailContent: { from: 'hr@compаny.co', subject: 'Tax Form', body: 'Submit: <a href="https://compаny.co/tax" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://compаny.co/tax">compаny.co/tax</a>' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Extremely Highly Technical', explanation: 'The "а" mimics "a", a spear phishing attempt. Verify with HR.' },
          { text: 'An SMS appears. Is it legitimate?', smsContent: { from: 'PayPal', body: 'Payment $100 approved. View: <a href="https://paypal.com" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://paypal.com">paypal.com</a>' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Legitimate', difficulty: 'Medium', explanation: 'The domain "paypal.com" and payment context are valid. This is legitimate.' },
          { text: 'You receive a Gmail email. What is it?', emailContent: { from: 'ceo@rnicrosoft.net', subject: 'Urgent Memo', body: 'Act now: <a href="https://rnicrosoft.net/memo" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://rnicrosoft.net/memo">rnicrosoft.net/memo</a>' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Extremely Highly Technical', explanation: 'The "rn" mimics "m" in "rnicrosoft.net". Microsoft uses microsoft.com. This is whaling.' },
          { text: 'An SMS arrives. Is it safe?', smsContent: { from: 'GCash', body: 'Cash-in of P200. Check: <a href="https://gcash.com" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://gcash.com">gcash.com</a>' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Legitimate', difficulty: 'Medium', explanation: 'The domain "gcash.com" and cash-in context are valid. This is legitimate.' },
          { text: 'A Gmail email appears. Is it trustworthy?', emailContent: { from: 'admin@gmɑi1.com', subject: 'Login Warning', body: 'Secure: <a href="https://gmɑi1.com/warning" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://gmɑi1.com/warning">gmɑi1.com/warning</a>' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: 'The "ɑ" and "1" mimic "a" and "l". Gmail uses accounts.google.com.' },
          { text: 'You get an SMS. What is it?', smsContent: { from: 'Shopee', body: 'Order #789 shipped. Track: <a href="https://shopee.ph" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://shopee.ph">shopee.ph</a>' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Legitimate', difficulty: 'Medium', explanation: 'The domain "shopee.ph" and shipping context are valid. This is legitimate.' },
          { text: 'A Gmail email arrives. Is it safe?', emailContent: { from: 'security@nètflìx.com', subject: 'Account Issue', body: 'Fix: <a href="https://nètflìx.com/fix" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://nètflìx.com/fix">nètflìx.com/fix</a>' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Extremely Highly Technical', explanation: 'The "è" and "ì" mimic "e" and "i". Netflix uses netflix.com. This is phishing.' },
          { text: 'An SMS appears. Is it legitimate?', smsContent: { from: 'DHL', body: 'Delivery scheduled. Confirm: <a href="https://dhl.com" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;" title="https://dhl.com">dhl.com</a>' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Legitimate', difficulty: 'Medium', explanation: 'The domain "dhl.com" and delivery context are valid. This is legitimate.' }
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
          { text: 'You investigate a breach. A log shows "GET /admin.php?user=admin\' --". What attack?', options: ['SQL Injection', 'Phishing', 'Unauthorized access'], correctAnswer: 'Unauthorized access', difficulty: 'Medium', explanation: 'The "--" suggests a manual attempt to bypass authentication. Check user access logs.' },
          { text: 'A user reports a pop-up. You find "cmd.exe" in task manager. What’s likely?', options: ['Normal', 'Malware', 'Update'], correctAnswer: 'Malware', difficulty: 'Medium', explanation: 'cmd.exe running unexpectedly suggests malware. Analyze the process.' },
          { text: 'A deleted file "data.exe" is found. What to do?', options: ['Ignore', 'Recover it', 'Delete it'], correctAnswer: 'Recover it', difficulty: 'Highly Technical', explanation: 'Deleted files may hold evidence. Use forensic tools to recover and analyze.' },
          { text: 'A log shows traffic to 10.0.0.5 on port 4444. What might it be?', options: ['Normal', 'C2', 'Backup'], correctAnswer: 'C2', difficulty: 'Highly Technical', explanation: 'Port 4444 is often used for command-and-control. Investigate the destination.' },
          { text: 'You find "ransom.txt" with a Bitcoin address. What’s happening?', options: ['Backup', 'Ransomware', 'Update'], correctAnswer: 'Ransomware', difficulty: 'Medium', explanation: 'This indicates a ransomware attack. Isolate the system and report it.' },
          { text: 'A browser history shows "evil.com/login". What to check?', options: ['Cache', 'Network logs', 'Cookies'], correctAnswer: 'Network logs', difficulty: 'Highly Technical', explanation: 'Network logs can trace connections to "evil.com" for evidence.' },
          { text: 'A registry shows "Run\\malware.exe". What is it?', options: ['Startup', 'System', 'Malware'], correctAnswer: 'Malware', difficulty: 'Highly Technical', explanation: 'Run keys launching "malware.exe" suggest persistence. Analyze the file.' },
          { text: 'A file "log.zip" was accessed, then deleted. What next?', options: ['Ignore', 'Recover', 'Reboot'], correctAnswer: 'Recover', difficulty: 'Highly Technical', explanation: 'Deleted logs may contain breach evidence. Recover with forensic tools.' },
          { text: 'A PC shows unusual disk activity. What to investigate?', options: ['RAM', 'Hard drive', 'Network'], correctAnswer: 'Hard drive', difficulty: 'Medium', explanation: 'Disk activity may indicate data exfiltration. Check for suspicious files.' },
          { text: 'A user clicked a link, and "svchost.exe" spiked. What to do?', options: ['Ignore', 'Monitor', 'Analyze'], correctAnswer: 'Analyze', difficulty: 'Highly Technical', explanation: 'Unusual svchost.exe activity may indicate malware. Perform a forensic analysis.' }
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
