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
                url => `<a href="#" title="${question.smsContent.maskedUrl || url}" style="color: blue; text-decoration: underline;">${url}</a>`
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
          // Email Phishing (40 questions)
          { text: 'You received an email from what appears to be PayPal regarding an urgent account verification. The email includes your account details and a request to verify your identity to avoid suspension. Is this email legitimate?', emailContent: { from: 'support@paypa1.com', subject: 'Urgent: Action Required - Verify Your PayPal Account by May 20, 2025', body: 'Dear Valued PayPal User,<br><br>We have detected unusual activity on your account. To ensure the security of your funds, please verify your identity by clicking the link below and logging in with your credentials:<br><br><a href="#">https://paypa1.com/verify</a><br><br>Failure to comply by May 20, 2025, will result in temporary suspension of your account. Thank you for your prompt attention.<br><br>Best regards,<br>PayPal Security Team', maskedUrl: 'https://secure.paypal-login.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: [
            'The sender’s email domain is "paypa1.com", not "paypal.com".',
            'It uses a homoglyph: the character "1" mimics the letter "l" to deceive users.',
            'The link’s display URL ("paypa1.com/verify") doesn’t match the masked URL ("secure.paypal-login.com"), indicating URL spoofing.',
            'PayPal never asks for credentials via email links; always verify directly on their official site, paypal.com.',
            'Check email headers for discrepancies in the sender’s domain and SPF/DKIM alignment.'
          ] },
          { text: 'An official-looking email from Amazon confirms an order with a tracking link and details about a recent purchase. Is this email trustworthy?', emailContent: { from: 'no-reply@amazon-dea1s2025.com', subject: 'Order Confirmation #XYZ123 - Shipped on May 19, 2025', body: 'Hello [Your Name],<br><br>Thank you for your recent purchase on Amazon. Your order #XYZ123 has shipped and is on its way. Track your package here:<br><br><a href="#">https://amazon-dea1s2025.com/track</a><br><br>For any issues, contact our support team. Enjoy your shopping!<br><br>Best,<br>Amazon Customer Service', maskedUrl: 'https://amazon.order-tracking.org' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: [
            'The sender’s domain "amazon-dea1s2025.com" is suspicious.',
            'It uses a homoglyph: "1" replaces "l" in "deals", making it look legitimate at a glance.',
            'The tracking link’s displayed URL ("amazon-dea1s2025.com/track") differs from the masked URL ("amazon.order-tracking.org"), a sign of phishing.',
            'Amazon’s official domain is "amazon.com"; always log in directly to verify orders.',
            'Inspect email headers for sender authenticity and cross-check with Amazon’s official contact methods.'
          ] },
          { text: 'A professional email from Shopee offers a chance to win P5000, including a link to claim the prize and a personalized greeting. Is it safe?', emailContent: { from: 'promo@shopee-prom0.com', subject: 'Congratulations! You’ve Won P5000 - Claim by May 20, 2025', body: 'Dear [Your Name],<br><br>Congratulations! You’ve been selected to win P5000 in our latest promotion. Click below to claim your prize:<br><br><a href="#">https://bit.ly/sh0pee-promo</a><br><br>Hurry, this offer expires on May 20, 2025. Terms apply.<br><br>Cheers,<br>Shopee Promotions Team', maskedUrl: 'https://shopee-promotions.ph' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: [
            'The sender’s domain is "shopee-prom0.com", not Shopee’s official "shopee.ph".',
            'It uses a homoglyph: "0" mimics the letter "o" in "promo".',
            'The link uses a URL shortener ("bit.ly"), which hides the real destination ("shopee-promotions.ph"), a common phishing tactic.',
            'Shopee does not use shortened URLs for official promotions; always navigate to shopee.ph directly.',
            'Verify the email’s authenticity by checking the sender’s domain in the email header and Shopee’s official promotions page.'
          ] },
          { text: 'You received an email from the IRS regarding a tax payment due, with a deadline of May 20, 2025, and a payment link. What is this email?', emailContent: { from: 'tax@irs.gov.ph', subject: 'Important: Tax Payment Due - Action Required by May 20, 2025', body: 'Dear Taxpayer,<br><br>Our records indicate an outstanding balance of $2,000 due by May 20, 2025. To avoid penalties, please settle your payment immediately via:<br><br><a href="#">https://irs-payment.gov.ph/pay</a><br><br>Contact us at our official line if you have questions.<br><br>Sincerely,<br>IRS Payment Department', maskedUrl: 'https://secure-tax.us.gov' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: [
            'The sender’s domain "irs.gov.ph" is fake; the real IRS uses "irs.gov".',
            'The ".gov.ph" extension is incorrect for the U.S. IRS, which operates under ".gov".',
            'The payment link’s displayed URL ("irs-payment.gov.ph/pay") doesn’t match the masked URL ("secure-tax.us.gov"), indicating a phishing attempt.',
            'The IRS never requests payments via email links; always verify through irs.gov.',
            'Examine the email’s SPF/DKIM records to confirm the sender’s legitimacy.'
          ] },
          { text: 'A Gmail email from Google warns of an account security alert, requesting verification with a link and a deadline. Is it trustworthy?', emailContent: { from: 'support@gmaìl.com', subject: 'Security Alert: Verify Your Google Account by May 20, 2025', body: 'Dear User,<br><br>We’ve detected suspicious activity on your Google account. To secure your account, please verify your identity here:<br><br><a href="#">https://gmaìl.com/security</a><br><br>Action is required by May 20, 2025, to prevent access loss.<br><br>Regards,<br>Google Account Security', maskedUrl: 'https://accounts.google-login.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: [
            'The sender’s domain "gmaìl.com" contains a homoglyph: "ì" mimics "i".',
            'The domain includes a zero-width space (U+200B), invisible to the eye but detectable in code.',
            'The link’s displayed URL ("gmaìl.com/security") differs from the masked URL ("accounts.google-login.com"), a phishing red flag.',
            'Google’s official domain for account security is "accounts.google.com"; never use email links to log in.',
            'Requires meticulous inspection of the email header for domain mismatches and hidden characters.'
          ] },
          { text: 'An email from BDO Unibank claims your account has been blocked due to suspicious activity and provides a link to verify it. Is this legitimate?', emailContent: { from: 'alert@bdo-unibank.com', subject: 'BDO Advisory: Account Blocked! Reactivate by May 20, 2025', body: 'Dear Client,<br><br>Your BDO account has been blocked due to suspicious activities. To reactivate, please follow this link:<br><br><a href="#">https://bdo-unibank.com/verify</a><br><br>Failure to comply by May 20, 2025, will result in permanent suspension.<br><br>Regards,<br>BDO Security Team', maskedUrl: 'https://bdo-security.net' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Difficult', explanation: [
            'The sender’s domain "bdo-unibank.com" is not BDO’s official domain, which is "bdo.com.ph".',
            'The link’s displayed URL ("bdo-unibank.com/verify") doesn’t match the masked URL ("bdo-security.net"), a phishing indicator.',
            'BDO Unibank does not send links in emails for account verification; always log in via bdo.com.ph.',
            'Contact BDO directly using official channels to confirm any account issues.'
          ] },
          { text: 'You get an email from Facebook saying your account was accessed from a new device and asks you to verify the login. Is this safe?', emailContent: { from: 'security@faceb00k.com', subject: 'New Device Login Alert - Verify Now by May 20, 2025', body: 'Hello [Your Name],<br><br>We detected a login from a new device on your Facebook account. Please verify this activity to secure your account:<br><br><a href="#">https://faceb00k.com/verify-login</a><br><br>If this wasn’t you, act immediately by May 20, 2025.<br><br>Best,<br>Facebook Security', maskedUrl: 'https://fb-security-login.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: [
            'The sender’s domain "faceb00k.com" uses a homoglyph: "0" mimics "o".',
            'The link’s displayed URL ("faceb00k.com/verify-login") differs from the masked URL ("fb-security-login.com"), indicating phishing.',
            'Facebook’s official domain is "facebook.com"; always verify login alerts directly on their site.',
            'Check the email header for domain authenticity and report suspicious emails to Facebook.'
          ] },
          { text: 'An email from Microsoft claims your Office 365 subscription needs renewal and includes a payment link. Is this legitimate?', emailContent: { from: 'billing@mìcrosoft.com', subject: 'Action Required: Renew Your Office 365 Subscription by May 20, 2025', body: 'Dear User,<br><br>Your Office 365 subscription is expiring. Renew now to avoid interruption:<br><br><a href="#">https://mìcrosoft.com/renew</a><br><br>Act by May 20, 2025, to continue using your services.<br><br>Thank you,<br>Microsoft Billing Team', maskedUrl: 'https://office365-renewal.net' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: [
            'The sender’s domain "mìcrosoft.com" contains a homoglyph: "ì" mimics "i".',
            'It includes an embedded zero-width space (U+200B), which is invisible but alters the domain.',
            'The link’s displayed URL ("mìcrosoft.com/renew") doesn’t match the masked URL ("office365-renewal.net"), a phishing tactic.',
            'Microsoft’s official domain is "microsoft.com"; renew subscriptions directly on their site.',
            'Deep inspection of the email header is required to detect hidden characters and domain spoofing.'
          ] },
          { text: 'A 2013-2015 email scam targeted Google and Facebook, tricking employees into paying fake invoices. What type of attack was this?', emailContent: { from: 'billing@quanta-taiwan.com', subject: 'Invoice #INV-2025 - Payment Due by May 20, 2025', body: 'Dear Accounts Team,<br><br>Please find attached invoice #INV-2025 for services rendered. Pay via the link below by May 20, 2025:<br><br><a href="#">https://quanta-taiwan.com/pay</a><br><br>Thank you,<br>Quanta Computer Billing', maskedUrl: 'https://quanta-fakebilling.com' }, options: ['Spear Phishing', 'Business Email Compromise', 'Smishing'], correctAnswer: 'Business Email Compromise', difficulty: 'Highly Technical Extremely Difficult', explanation: [
            'This is a Business Email Compromise (BEC) scam targeting high-value companies like Google and Facebook.',
            'The sender impersonates a trusted vendor ("Quanta Computer") with a fake domain ("quanta-taiwan.com").',
            'The link’s displayed URL ("quanta-taiwan.com/pay") masks the real URL ("quanta-fakebilling.com"), leading to a phishing site.',
            'The scam defrauded over $100M by using forged invoices and CEO-level spoofing, which even experts missed.',
            'Always verify payment requests through official channels and cross-check email domains with known vendor contacts.'
          ] },
          { text: 'An email from Netflix warns of a billing issue and asks you to update your payment details via a link. Is this safe?', emailContent: { from: 'support@netf1ix.com', subject: 'Billing Issue: Update Payment Details by May 20, 2025', body: 'Dear Subscriber,<br><br>We encountered a billing issue with your account. Update your payment details here to continue enjoying Netflix:<br><br><a href="#">https://netf1ix.com/bill</a><br><br>Please act by May 20, 2025.<br><br>Regards,<br>Netflix Support', maskedUrl: 'https://netflix-billing.support' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: [
            'The sender’s domain "netf1ix.com" uses a homoglyph: "1" mimics "l".',
            'The link’s displayed URL ("netf1ix.com/bill") doesn’t match the masked URL ("netflix-billing.support"), indicating phishing.',
            'Netflix’s official domain is "netflix.com"; never update payment details via email links.',
            'Verify billing issues directly on Netflix’s official site or app.'
          ] },
          { text: 'An email from Apple says your iCloud storage is full and provides a link to upgrade your plan. Is this legitimate?', emailContent: { from: 'support@applè.com', subject: 'iCloud Storage Full - Upgrade Now by May 20, 2025', body: 'Dear User,<br><br>Your iCloud storage is full. Upgrade your plan to avoid losing data:<br><br><a href="#">https://applè.com/icloud-upgrade</a><br><br>Please act by May 20, 2025.<br><br>Best,<br>Apple Support', maskedUrl: 'https://icloud-upgrade-fake.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: [
            'The sender’s domain "applè.com" uses a homoglyph: "è" mimics "e".',
            'It contains a zero-width joiner (U+200D), invisible but detectable in the domain.',
            'The link’s displayed URL ("applè.com/icloud-upgrade") differs from the masked URL ("icloud-upgrade-fake.com"), a phishing sign.',
            'Apple’s official domain is "apple.com"; manage iCloud directly on their site.',
            'Requires meticulous header analysis to detect hidden characters and spoofed domains.'
          ] },
          { text: 'An email from your bank (HSBC) requests you to confirm a recent transaction via a link due to potential fraud. Is this safe?', emailContent: { from: 'security@hsbc-sec.com', subject: 'Confirm Transaction - Potential Fraud Alert by May 20, 2025', body: 'Dear Customer,<br><br>We detected a potentially fraudulent transaction. Confirm it here to secure your account:<br><br><a href="#">https://hsbc-sec.com/confirm</a><br><br>Please act by May 20, 2025.<br><br>Regards,<br>HSBC Security', maskedUrl: 'https://hsbc-fraud.net' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Difficult', explanation: [
            'The sender’s domain "hsbc-sec.com" is not HSBC’s official domain, which is "hsbc.com".',
            'The link’s displayed URL ("hsbc-sec.com/confirm") doesn’t match the masked URL ("hsbc-fraud.net"), a phishing indicator.',
            'HSBC does not send links for transaction verification; always log in via hsbc.com.',
            'Contact HSBC directly using official channels to confirm any fraud alerts.'
          ] },
          { text: 'An email from LinkedIn says your profile needs verification due to a policy update and includes a link. Is this legitimate?', emailContent: { from: 'support@linkedìn.com', subject: 'Profile Verification Required - Policy Update by May 20, 2025', body: 'Dear Member,<br><br>Due to a recent policy update, please verify your profile to continue using LinkedIn:<br><br><a href="#">https://linkedìn.com/verify</a><br><br>Act by May 20, 2025.<br><br>Thank you,<br>LinkedIn Team', maskedUrl: 'https://linkedin-verify-fake.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: [
            'The sender’s domain "linkedìn.com" uses a homoglyph: "ì" mimics "i".',
            'The domain includes a multi-stage redirect, detectable only through DNS inspection.',
            'The link’s displayed URL ("linkedìn.com/verify") differs from the masked URL ("linkedin-verify-fake.com"), a phishing tactic.',
            'LinkedIn’s official domain is "linkedin.com"; verify profiles directly on their site.',
            'Requires deep DNS inspection to uncover the redirect chain and confirm the domain’s legitimacy.'
          ] },
          { text: 'An email from eBay says you’ve won an auction and need to confirm payment details via a link. Is this safe?', emailContent: { from: 'support@ebày.com', subject: 'Auction Won - Confirm Payment by May 20, 2025', body: 'Dear Bidder,<br><br>Congratulations on winning auction #12345! Confirm your payment details here:<br><br><a href="#">https://ebày.com/payment</a><br><br>Please act by May 20, 2025.<br><br>Best,<br>eBay Team', maskedUrl: 'https://ebay-payment-fake.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: [
            'The sender’s domain "ebày.com" uses a homoglyph: "à" mimics "a".',
            'The link’s displayed URL ("ebày.com/payment") doesn’t match the masked URL ("ebay-payment-fake.com"), indicating phishing.',
            'eBay’s official domain is "ebay.com"; confirm auction wins directly on their site.',
            'Check the email header for domain authenticity and report suspicious emails to eBay.'
          ] },
          { text: 'An email from Zoom invites you to a meeting to discuss account security, with a link to join. Is this legitimate?', emailContent: { from: 'support@zo0m.us', subject: 'Urgent: Join Security Meeting by May 20, 2025', body: 'Dear User,<br><br>We need to discuss your account security. Join the meeting here:<br><br><a href="#">https://zo0m.us/join/123456</a><br><br>Please attend by May 20, 2025.<br><br>Regards,<br>Zoom Support', maskedUrl: 'https://zoom-fake-meeting.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: [
            'The sender’s domain "zo0m.us" uses a homoglyph: "0" mimics "o".',
            'The link’s displayed URL ("zo0m.us/join/123456") differs from the masked URL ("zoom-fake-meeting.com"), a phishing sign.',
            'Zoom’s official domain is "zoom.us"; join meetings directly through their app or site.',
            'Verify meeting invites by checking Zoom’s official scheduling system.'
          ] },
          { text: 'An email from PayPal (impersonated in 51.7% of global phishing attacks) asks you to confirm a recent payment. Is this safe?', emailContent: { from: 'support@paypa1.com', subject: 'Confirm Payment #PAY123 - Action Needed by May 20, 2025', body: 'Dear User,<br><br>We need you to confirm a recent payment #PAY123. Click here to verify:<br><br><a href="#">https://paypa1.com/confirm</a><br><br>Please act by May 20, 2025.<br><br>Thank you,<br>PayPal Team', maskedUrl: 'https://paypal-fake-confirm.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Difficult', explanation: [
            'The sender’s domain "paypa1.com" uses a homoglyph: "1" mimics "l".',
            'The link’s displayed URL ("paypa1.com/confirm") doesn’t match the masked URL ("paypal-fake-confirm.com"), a phishing indicator.',
            'PayPal is a top impersonated brand (51.7% of phishing attacks); their official domain is "paypal.com".',
            'Never confirm payments via email links; log in directly to paypal.com to verify.'
          ] },
          { text: 'An email from Adobe says your subscription has been charged and provides a refund link if unauthorized. Is this legitimate?', emailContent: { from: 'billing@ad0be.com', subject: 'Subscription Charged - Refund Option by May 20, 2025', body: 'Dear Customer,<br><br>Your Adobe subscription has been charged $99. If unauthorized, request a refund here:<br><br><a href="#">https://ad0be.com/refund</a><br><br>Act by May 20, 2025.<br><br>Regards,<br>Adobe Billing', maskedUrl: 'https://adobe-fake-refund.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: [
            'The sender’s domain "ad0be.com" uses a homoglyph: "0" mimics "o".',
            'The link’s displayed URL ("ad0be.com/refund") differs from the masked URL ("adobe-fake-refund.com"), indicating phishing.',
            'Adobe’s official domain is "adobe.com"; manage subscriptions directly on their site.',
            'Verify charges by logging into your Adobe account, not through email links.'
          ] },
          { text: 'An email from Shopee claims you’ve won a P10,000 voucher and provides a link to claim it. Is this legitimate?', emailContent: { from: 'promo@sh0pee.com', subject: 'Congratulations! Claim Your P10,000 Shopee Voucher by May 20, 2025', body: 'Dear Shopper,<br><br>You’ve won a P10,000 voucher from Shopee! Claim it now:<br><br><a href="#">https://sh0pee.com/claim-voucher</a><br><br>Offer expires May 20, 2025.<br><br>Best,<br>Shopee Team', maskedUrl: 'https://shopee-voucher-fake.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Difficult', explanation: [
            'The sender’s domain "sh0pee.com" uses a homoglyph: "0" mimics "o".',
            'The link’s displayed URL ("sh0pee.com/claim-voucher") doesn’t match the masked URL ("shopee-voucher-fake.com"), a phishing sign.',
            'Shopee’s official domain is "shopee.ph"; claim vouchers directly on their site.',
            'Contact Shopee support through official channels to verify promotional offers.'
          ] },
          { text: 'An email from Lazada says your order delivery failed and asks you to update your address via a link. Is this safe?', emailContent: { from: 'support@lazàda.com', subject: 'Delivery Failed: Update Address by May 20, 2025', body: 'Dear Customer,<br><br>Your recent Lazada order delivery failed. Update your address here:<br><br><a href="#">https://lazàda.com/update-address</a><br><br>Please act by May 20, 2025.<br><br>Thank you,<br>Lazada Support', maskedUrl: 'https://lazada-fake-delivery.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: [
            'The sender’s domain "lazàda.com" uses a homoglyph: "à" mimics "a".',
            'The link’s displayed URL ("lazàda.com/update-address") differs from the masked URL ("lazada-fake-delivery.com"), indicating phishing.',
            'Lazada’s official domain is "lazada.com.ph"; update addresses directly on their site.',
            'Verify delivery issues through Lazada’s official app or website.'
          ] },
          { text: 'An email from TikTok warns of a copyright strike on your account and provides a link to appeal. Is this legitimate?', emailContent: { from: 'support@tìktok.com', subject: 'Urgent: Copyright Strike on Your TikTok Account - Appeal by May 20, 2025', body: 'Dear Creator,<br><br>Your TikTok account has received a copyright strike. Appeal here to avoid suspension:<br><br><a href="#">https://tìktok.com/appeal</a><br><br>Act by May 20, 2025.<br><br>Regards,<br>TikTok Team', maskedUrl: 'https://tiktok-fake-appeal.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: [
            'The sender’s domain "tìktok.com" uses a homoglyph: "ì" mimics "i".',
            'It includes a zero-width non-joiner (U+200C), invisible but detectable in the domain.',
            'The link’s displayed URL ("tìktok.com/appeal") differs from the masked URL ("tiktok-fake-appeal.com"), a phishing sign.',
            'TikTok’s official domain is "tiktok.com"; manage appeals directly on their platform.',
            'Requires meticulous header checks to detect hidden characters and spoofed domains.'
          ] },
          { text: 'An email claims you’ve won a P5,000 GCash voucher and asks you to claim it via a link. Is this safe?', emailContent: { from: 'promo@gcàsh.com', subject: 'You’ve Won a P5,000 GCash Voucher! Claim by May 20, 2025', body: 'Dear User,<br><br>Congratulations! You’ve won a P5,000 GCash voucher. Claim it here:<br><br><a href="#">https://gcàsh.com/claim</a><br><br>Offer expires May 20, 2025.<br><br>Best,<br>GCash Promotions', maskedUrl: 'https://gcash-voucher-fake.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Difficult', explanation: [
            'The sender’s domain "gcàsh.com" uses a homoglyph: "à" mimics "a".',
            'The link’s displayed URL ("gcàsh.com/claim") doesn’t match the masked URL ("gcash-voucher-fake.com"), indicating phishing.',
            'GCash’s official domain is "gcash.com"; claim vouchers directly on their app or site.',
            'Contact GCash support through official channels to verify promotional offers.'
          ] },
          { text: 'An email from Globe PH offers a free data bundle if you verify your account via a link. Is this legitimate?', emailContent: { from: 'support@gl0be.com.ph', subject: 'Get Free 5GB Data! Verify Your Globe Account by May 20, 2025', body: 'Dear Subscriber,<br><br>Get a free 5GB data bundle! Verify your account here:<br><br><a href="#">https://gl0be.com.ph/verify</a><br><br>Act by May 20, 2025.<br><br>Cheers,<br>Globe Team', maskedUrl: 'https://globe-fake-verify.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: [
            'The sender’s domain "gl0be.com.ph" uses a homoglyph: "0" mimics "o".',
            'The link’s displayed URL ("gl0be.com.ph/verify") differs from the masked URL ("globe-fake-verify.com"), a phishing sign.',
            'Globe’s official domain is "globe.com.ph"; verify promotions directly on their site.',
            'Check Globe’s official app or website for legitimate offers.'
          ] },
          { text: 'An email from Smart PH claims your bill is overdue and provides a payment link to avoid disconnection. Is this safe?', emailContent: { from: 'billing@smàrt.com.ph', subject: 'Overdue Bill: Pay Now to Avoid Disconnection by May 20, 2025', body: 'Dear Subscriber,<br><br>Your Smart bill is overdue. Pay now to avoid disconnection:<br><br><a href="#">https://smàrt.com.ph/pay</a><br><br>Act by May 20, 2025.<br><br>Regards,<br>Smart Billing', maskedUrl: 'https://smart-fake-bill.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: [
            'The sender’s domain "smàrt.com.ph" uses a homoglyph: "à" mimics "a".',
            'The link’s displayed URL ("smàrt.com.ph/pay") doesn’t match the masked URL ("smart-fake-bill.com"), indicating phishing.',
            'Smart’s official domain is "smart.com.ph"; pay bills directly on their site.',
            'Verify billing issues through Smart’s official app or customer service.'
          ] },
          { text: 'An email from Shopee says your account was flagged for suspicious activity and asks you to verify your identity. Is this legitimate?', emailContent: { from: 'security@sh0pee.com', subject: 'Account Flagged: Verify Identity by May 20, 2025', body: 'Dear User,<br><br>Your Shopee account was flagged for suspicious activity. Verify your identity here:<br><br><a href="#">https://sh0pee.com/verify</a><br><br>Act by May 20, 2025.<br><br>Regards,<br>Shopee Security', maskedUrl: 'https://shopee-fake-verify.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Difficult', explanation: [
            'The sender’s domain "sh0pee.com" uses a homoglyph: "0" mimics "o".',
            'The link’s displayed URL ("sh0pee.com/verify") doesn’t match the masked URL ("shopee-fake-verify.com"), a phishing sign.',
            'Shopee’s official domain is "shopee.ph"; verify accounts directly on their site.',
            'Contact Shopee support through official channels to confirm account issues.'
          ] },
          { text: 'An email from Lazada offers a 50% off voucher for your next purchase if you click a link to claim it. Is this safe?', emailContent: { from: 'promo@lazàda.com', subject: 'Get 50% Off Your Next Lazada Purchase! Claim by May 20, 2025', body: 'Dear Shopper,<br><br>Enjoy 50% off your next purchase! Claim your voucher here:<br><br><a href="#">https://lazàda.com/claim-voucher</a><br><br>Offer expires May 20, 2025.<br><br>Happy Shopping,<br>Lazada Team', maskedUrl: 'https://lazada-voucher-fake.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Difficult', explanation: [
            'The sender’s domain "lazàda.com" uses a homoglyph: "à" mimics "a".',
            'The link’s displayed URL ("lazàda.com/claim-voucher") doesn’t match the masked URL ("lazada-voucher-fake.com"), indicating phishing.',
            'Lazada’s official domain is "lazada.com.ph"; claim vouchers directly on their site.',
            'Verify promotional offers through Lazada’s official app or website.'
          ] },
          { text: 'An email from TikTok claims you’ve been selected for a creator fund and provides a link to apply. Is this legitimate?', emailContent: { from: 'creator@tìktok.com', subject: 'Join the TikTok Creator Fund! Apply by May 20, 2025', body: 'Dear Creator,<br><br>You’ve been selected for the TikTok Creator Fund. Apply here:<br><br><a href="#">https://tìktok.com/apply-fund</a><br><br>Act by May 20, 2025.<br><br>Best,<br>TikTok Creator Team', maskedUrl: 'https://tiktok-fake-fund.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: [
            'The sender’s domain "tìktok.com" uses a homoglyph: "ì" mimics "i".',
            'The domain employs multi-stage obfuscation, detectable only through DNS tracing.',
            'The link’s displayed URL ("tìktok.com/apply-fund") differs from the masked URL ("tiktok-fake-fund.com"), a phishing sign.',
            'TikTok’s official domain is "tiktok.com"; apply for funds directly on their platform.',
            'Requires expert DNS tracing to uncover the obfuscation and confirm the domain’s legitimacy.'
          ] },
          { text: 'An email claims you’ve won a free iPhone from a Shopee raffle and asks you to claim it via a link. Is this safe?', emailContent: { from: 'promo@sh0pee.com', subject: 'You’ve Won an iPhone from Shopee! Claim by May 20, 2025', body: 'Dear Winner,<br><br>Congratulations! You’ve won an iPhone from our Shopee raffle. Claim it here:<br><br><a href="#">https://sh0pee.com/claim-iphone</a><br><br>Act by May 20, 2025.<br><br>Best,<br>Shopee Team', maskedUrl: 'https://shopee-iphone-fake.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Difficult', explanation: [
            'The sender’s domain "sh0pee.com" uses a homoglyph: "0" mimics "o".',
            'The link’s displayed URL ("sh0pee.com/claim-iphone") doesn’t match the masked URL ("shopee-iphone-fake.com"), indicating phishing.',
            'Shopee’s official domain is "shopee.ph"; claim prizes directly on their site.',
            'Verify raffle wins through Shopee’s official app or customer support.'
          ] },
          { text: 'An email from Lazada says you’ve been charged for a subscription you didn’t sign up for and offers a refund link. Is this legitimate?', emailContent: { from: 'billing@lazàda.com', subject: 'Subscription Charged: Request Refund by May 20, 2025', body: 'Dear Customer,<br><br>You’ve been charged P999 for a Lazada subscription. Request a refund here if unauthorized:<br><br><a href="#">https://lazàda.com/refund</a><br><br>Act by May 20, 2025.<br><br>Regards,<br>Lazada Billing', maskedUrl: 'https://lazada-fake-refund.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: [
            'The sender’s domain "lazàda.com" uses a homoglyph: "à" mimics "a".',
            'The link’s displayed URL ("lazàda.com/refund") differs from the masked URL ("lazada-fake-refund.com"), a phishing sign.',
            'Lazada’s official domain is "lazada.com.ph"; manage subscriptions directly on their site.',
            'Verify charges through Lazada’s official app or customer support.'
          ] },
          { text: 'An email from a Philippine charity claims you’ve won a P20,000 donation voucher and asks you to claim it via a link. Is this safe?', emailContent: { from: 'donate@charìty-ph.com', subject: 'You’ve Won a P20,000 Donation Voucher! Claim by May 20, 2025', body: 'Dear Donor,<br><br>You’ve won a P20,000 donation voucher! Claim it here:<br><br><a href="#">https://charìty-ph.com/claim</a><br><br>Act by May 20, 2025.<br><br>Thank you,<br>Charity PH Team', maskedUrl: 'https://charity-fake-voucher.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Difficult', explanation: [
            'The sender’s domain "charìty-ph.com" uses a homoglyph: "ì" mimics "i".',
            'The link’s displayed URL ("charìty-ph.com/claim") doesn’t match the masked URL ("charity-fake-voucher.com"), indicating phishing.',
            'Legitimate charities do not send unsolicited voucher emails with links.',
            'Verify the charity’s legitimacy by contacting them directly through official channels.'
          ] },
          { text: 'An email from PLDT says your internet bill is overdue and provides a payment link to avoid disconnection. Is this legitimate?', emailContent: { from: 'billing@pldt-h0me.com', subject: 'Overdue Internet Bill: Pay Now by May 20, 2025', body: 'Dear Subscriber,<br><br>Your PLDT bill is overdue. Pay now to avoid disconnection:<br><br><a href="#">https://pldt-h0me.com/pay</a><br><br>Act by May 20, 2025.<br><br>Regards,<br>PLDT Billing', maskedUrl: 'https://pldt-fake-bill.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: [
            'The sender’s domain "pldt-h0me.com" uses a homoglyph: "0" mimics "o".',
            'The link’s displayed URL ("pldt-h0me.com/pay") differs from the masked URL ("pldt-fake-bill.com"), a phishing sign.',
            'PLDT’s official domain is "pldt.com"; pay bills directly on their site.',
            'Verify billing issues through PLDT’s official app or customer service.'
          ] },
          { text: 'An email from Cebu Pacific offers a free flight voucher if you verify your account via a link. Is this safe?', emailContent: { from: 'promo@cebu-pacìfic.com', subject: 'Get a Free Flight Voucher! Verify by May 20, 2025', body: 'Dear Traveler,<br><br>Get a free flight voucher! Verify your Cebu Pacific account here:<br><br><a href="#">https://cebu-pacìfic.com/verify</a><br><br>Act by May 20, 2025.<br><br>Happy Travels,<br>Cebu Pacific Team', maskedUrl: 'https://cebu-fake-voucher.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: [
            'The sender’s domain "cebu-pacìfic.com" uses a homoglyph: "ì" mimics "i".',
            'The link’s displayed URL ("cebu-pacìfic.com/verify") differs from the masked URL ("cebu-fake-voucher.com"), indicating phishing.',
            'Cebu Pacific’s official domain is "cebupacificair.com"; verify offers directly on their site.',
            'Check Cebu Pacific’s official promotions page for legitimate offers.'
          ] },
          { text: 'An email from a Philippine online casino claims you’ve won P50,000 and asks you to claim it via a link. Is this legitimate?', emailContent: { from: 'win@casìno-ph.com', subject: 'You’ve Won P50,000! Claim by May 20, 2025', body: 'Dear Player,<br><br>Congratulations! You’ve won P50,000 from our casino. Claim your prize here:<br><br><a href="#">https://casìno-ph.com/claim</a><br><br>Act by May 20, 2025.<br><br>Good Luck,<br>Casino PH Team', maskedUrl: 'https://casino-fake-win.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Difficult', explanation: [
            'The sender’s domain "casìno-ph.com" uses a homoglyph: "ì" mimics "i".',
            'The link’s displayed URL ("casìno-ph.com/claim") doesn’t match the masked URL ("casino-fake-win.com"), a phishing sign.',
            'Legitimate casinos do not send unsolicited win notifications with links.',
            'Verify the casino’s legitimacy by contacting them through official channels.'
          ] },
          { text: 'An email from your CFO (spoofed) requests an urgent wire transfer for a confidential deal, with an attached invoice. Is this safe?', emailContent: { from: 'cfo@company.com', subject: 'Confidential: Urgent Wire Transfer Required by May 20, 2025', body: 'Dear Team,<br><br>Please process a wire transfer of P1M for a confidential deal. Invoice attached. Use this link to confirm details:<br><br><a href="#">https://company-finance.com/transfer</a><br><br>Act by May 20, 2025.<br><br>Regards,<br>[CFO Name]', maskedUrl: 'https://fake-finance-transfer.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: [
            'The sender’s email appears to be "cfo@company.com", but it’s spoofed with a zero-width character (U+200B) in the metadata.',
            'The link’s displayed URL ("company-finance.com/transfer") masks the real URL ("fake-finance-transfer.com"), indicating phishing.',
            'The email includes a forged invoice, a common tactic in Business Email Compromise (BEC) attacks.',
            'Even cybersecurity experts have fallen for similar attacks due to the convincing impersonation of a CFO.',
            'Always verify wire transfer requests through a separate, trusted communication channel (e.g., phone call to the CFO).'
          ] },
          { text: 'An email from AWS claims your account is compromised and provides a link to secure it, signed by a senior engineer. Is this legitimate?', emailContent: { from: 'security@aws.amazon.c0m', subject: 'Critical: Secure Your AWS Account by May 20, 2025', body: 'Dear Customer,<br><br>Your AWS account shows unauthorized access. Secure it here, signed by Engineer John Doe:<br><br><a href="#">https://aws.amazon.c0m/security</a><br><br>Act by May 20, 2025.<br><br>Best,<br>AWS Security Team', maskedUrl: 'https://aws-fake-security.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: [
            'The sender’s domain "aws.amazon.c0m" uses a homoglyph: "0" mimics "o".',
            'The link uses a multi-stage redirect, masking the real URL ("aws-fake-security.com").',
            'The email includes a forged signature ("Engineer John Doe"), adding false legitimacy.',
            'AWS’s official domain is "aws.amazon.com"; secure accounts directly on their site.',
            'Requires expert header analysis to detect the homoglyph and redirect chain.'
          ] },
          { text: 'An email from a trusted vendor (spoofed) requests updated payment details for an overdue invoice. Is this safe?', emailContent: { from: 'accounts@vendor.com', subject: 'Overdue Invoice #INV-2025 - Update Payment by May 20, 2025', body: 'Dear Finance,<br><br>Invoice #INV-2025 is overdue. Update payment details here:<br><br><a href="#">https://vendor.com/update-payment</a><br><br>Act by May 20, 2025.<br><br>Regards,<br>Vendor Accounts', maskedUrl: 'https://vendor-fake-payment.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: [
            'The sender’s email "accounts@vendor.com" is spoofed with a zero-width joiner (U+200D) in the metadata.',
            'The link’s displayed URL ("vendor.com/update-payment") masks the real URL ("vendor-fake-payment.com"), a phishing tactic.',
            'This is a Business Email Compromise (BEC) attack, often missed by experts due to the trusted vendor impersonation.',
            'Always verify payment requests through a separate, trusted communication channel.',
            'Check the email header for SPF/DKIM alignment to confirm the sender’s legitimacy.'
          ] },
          { text: 'An email from GitHub claims your repository was flagged for a security issue and provides a link to review. Is this legitimate?', emailContent: { from: 'security@gìthub.com', subject: 'Security Alert: Review Your GitHub Repository by May 20, 2025', body: 'Dear Developer,<br><br>Your repository has a security issue. Review it here:<br><br><a href="#">https://gìthub.com/security-review</a><br><br>Act by May 20, 2025.<br><br>Best,<br>GitHub Security', maskedUrl: 'https://github-fake-review.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: [
            'The sender’s domain "gìthub.com" uses a homoglyph: "ì" mimics "i".',
            'The link employs multi-vector obfuscation, masking the real URL ("github-fake-review.com").',
            'GitHub’s official domain is "github.com"; review security issues directly on their platform.',
            'Requires meticulous DNS lookup to detect the obfuscation and confirm the domain’s legitimacy.',
            'Check GitHub’s official notifications or email settings for legitimate alerts.'
          ] },
          { text: 'An email from your CEO (spoofed) requests sensitive HR data for an audit, with a follow-up call scheduled. Is this safe?', emailContent: { from: 'ceo@company.com', subject: 'Urgent: HR Data Audit by May 20, 2025', body: 'Dear HR,<br><br>Please send employee payroll data for an urgent audit. Use this link to upload:<br><br><a href="#">https://company-hr.com/upload</a><br><br>Call scheduled for May 20, 2025. Act now.<br><br>Regards,<br>[CEO Name]', maskedUrl: 'https://fake-hr-upload.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: [
            'The sender’s email "ceo@company.com" is spoofed with a multi-stage deception.',
            'The email includes a scheduled follow-up call, a tactic used in whaling attacks to build trust.',
            'The link’s displayed URL ("company-hr.com/upload") masks the real URL ("fake-hr-upload.com"), indicating phishing.',
            'Experts have fallen for similar whaling attacks due to the convincing CEO impersonation.',
            'Always verify sensitive data requests through a separate, trusted communication channel (e.g., direct call to the CEO).'
          ] },
          { text: 'An email from Oracle claims your cloud account has a critical vulnerability and provides a patch link. Is this legitimate?', emailContent: { from: 'support@orac1e.com', subject: 'Critical Vulnerability in Your Oracle Cloud - Patch by May 20, 2025', body: 'Dear Customer,<br><br>Your Oracle Cloud account has a critical vulnerability. Patch it here:<br><br><a href="#">https://orac1e.com/patch</a><br><br>Act by May 20, 2025.<br><br>Regards,<br>Oracle Support', maskedUrl: 'https://oracle-fake-patch.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: [
            'The sender’s domain "orac1e.com" uses a homoglyph: "1" mimics "l".',
            'The domain includes a zero-width non-joiner (U+200C), invisible but detectable.',
            'The link’s displayed URL ("orac1e.com/patch") differs from the masked URL ("oracle-fake-patch.com"), a phishing sign.',
            'Oracle’s official domain is "oracle.com"; apply patches directly on their site.',
            'Requires expert scrutiny of the email header to detect hidden characters and spoofed domains.'
          ] },

          // SMS Phishing (Smishing) (10 questions)
          { text: 'An SMS from a number claiming to be BDO Bank alerts you about a locked card and asks you to reply or visit a link to unlock it, citing a recent transaction. Is this message safe?', smsContent: { from: '+639123456789', body: 'BDO Alert: Your card ending in 4567 is locked due to a suspicious transaction on May 19, 2025. Reply YES or visit https://bdo-on1ine.com/unlock to resolve.', maskedUrl: 'https://bdo-bank.online' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Medium', explanation: [
            'The sender’s number "+639123456789" is not an official BDO contact number.',
            'The URL "bdo-on1ine.com" uses a homoglyph: "1" mimics "l".',
            'The link’s displayed URL ("bdo-on1ine.com/unlock") masks the real URL ("bdo-bank.online"), a smishing tactic.',
            'BDO’s official domain is "bdo.com.ph"; never respond to SMS links for account issues.',
            'Contact BDO directly using their official hotline to verify card status.'
          ] },
          { text: 'An SMS from GCash Support notifies you of a low balance and provides a link to top up your account, mentioning a promotional offer. What is this message?', smsContent: { from: 'GCash Support', body: 'GCash Alert: Your balance is low. Top up now to enjoy a 10% bonus! Visit https://gcash-support.net/topup by May 20, 2025.', maskedUrl: 'https://secure.gcash-login.net' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Medium', explanation: [
            'The sender "GCash Support" is not a verified GCash contact.',
            'The URL "gcash-support.net" is not GCash’s official domain, which is "gcash.com".',
            'The link masks the real URL ("secure.gcash-login.net"), a common smishing tactic.',
            'GCash does not send unsolicited SMS with links to top up; use their official app.',
            'Verify promotions through GCash’s official app or customer support.'
          ] },
          { text: 'An SMS from DHL Tracking informs you of a delayed package with a link to track its status, including a tracking number. Is it legitimate?', smsContent: { from: 'DHL Tracking', body: 'DHL Update: Your package 1Z9999W999999999 is delayed. Track status at https://dhl-tracking.org/status by May 20, 2025.', maskedUrl: 'https://dhl-delivery-service.com' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Medium', explanation: [
            'The sender "DHL Tracking" is not a verified DHL contact.',
            'The URL "dhl-tracking.org" is not DHL’s official domain, which is "dhl.com".',
            'The link masks the real URL ("dhl-delivery-service.com"), indicating smishing.',
            'DHL does not send unsolicited SMS with tracking links; track packages on dhl.com.',
            'Verify tracking numbers through DHL’s official website or customer service.'
          ] },
          { text: 'An SMS from a number alerts you of a Netflix billing issue and provides a link to update your payment, mentioning your account. Is it safe?', smsContent: { from: '+12025550123', body: 'Netflix Alert: Billing issue on account ending 1234. Update payment at https://netf1ix.com/bill by May 20, 2025.', maskedUrl: 'https://netflix-billing.support' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Highly Technical', explanation: [
            'The sender’s number "+12025550123" is not an official Netflix contact.',
            'The URL "netf1ix.com" uses a homoglyph: "1" mimics "l".',
            'The link masks the real URL ("netflix-billing.support"), a smishing sign.',
            'Netflix’s official domain is "netflix.com"; update payments directly on their site.',
            'Check Netflix’s official app or website for billing issues.'
          ] },
          { text: 'An SMS from Globe PH notifies you of an expiring load and offers a recharge link with a bonus incentive. What is it?', smsContent: { from: 'Globe PH', body: 'Globe Alert: Your load expires today! Recharge at https://gl0be.com.ph/recharge for a 20% bonus by May 20, 2025.', maskedUrl: 'https://globe-mobile.topup' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Highly Technical', explanation: [
            'The sender "Globe PH" is not a verified Globe contact.',
            'The URL "gl0be.com.ph" uses a homoglyph: "0" mimics "o".',
            'The link masks the real URL ("globe-mobile.topup"), indicating smishing.',
            'Globe’s official domain is "globe.com.ph"; recharge directly on their site.',
            'Verify promotions through Globe’s official app or customer service.'
          ] },
          { text: 'An SMS from Amazon claims you’ve won a gift card and provides a link to claim it. Is this legitimate?', smsContent: { from: '+12025550124', body: 'Amazon Reward: You’ve won a $100 gift card! Claim it at https://amaz0n.com/claim by May 20, 2025.', maskedUrl: 'https://amazon-fake-claim.com' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Highly Technical', explanation: [
            'The sender’s number "+12025550124" is not an official Amazon contact.',
            'The URL "amaz0n.com" uses a homoglyph: "0" mimics "o".',
            'The link masks the real URL ("amazon-fake-claim.com"), a smishing sign.',
            'Amazon’s official domain is "amazon.com"; claim rewards directly on their site.',
            'Verify promotions through Amazon’s official website or customer support.'
          ] },
          { text: 'An SMS from PayPal alerts you to a large transaction and asks you to confirm it via a link. Is this safe?', smsContent: { from: '+12025550125', body: 'PayPal Alert: $500 transaction detected. Confirm at https://paypa1.com/confirm by May 20, 2025.', maskedUrl: 'https://paypal-fake-transaction.com' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Medium', explanation: [
            'The sender’s number "+12025550125" is not an official PayPal contact.',
            'The URL "paypa1.com" uses a homoglyph: "1" mimics "l".',
            'The link masks the real URL ("paypal-fake-transaction.com"), indicating smishing.',
            'PayPal’s official domain is "paypal.com"; confirm transactions directly on their site.',
            'Check PayPal’s official app or website for transaction alerts.'
          ] },
          { text: 'An SMS from the NHS (exploited during COVID) claims you’ve been exposed to a variant and need to book a test via a link. Is this legitimate?', smsContent: { from: 'NHS Alert', body: 'NHS: You’ve been exposed to Omicron. Book a test at https://nhs-test.com/book by May 20, 2025.', maskedUrl: 'https://nhs-fake-test.com' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Highly Technical', explanation: [
            'The sender "NHS Alert" is not a verified NHS contact.',
            'The URL "nhs-test.com" is not the NHS’s official domain, which is "nhs.uk".',
            'The link masks the real URL ("nhs-fake-test.com"), a smishing tactic.',
            'This exploits COVID fears, a common smishing strategy during the pandemic.',
            'Book tests directly on nhs.uk or through official NHS channels.'
          ] },
          { text: 'An SMS from Shopee claims you’ve won a P5,000 voucher and provides a link to claim it. Is this legitimate?', smsContent: { from: 'Shopee PH', body: 'Shopee Alert: You’ve won a P5,000 voucher! Claim at https://sh0pee.com/claim by May 20, 2025.', maskedUrl: 'https://shopee-fake-voucher.com' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Medium', explanation: [
            'The sender "Shopee PH" is not a verified Shopee contact.',
            'The URL "sh0pee.com" uses a homoglyph: "0" mimics "o".',
            'The link masks the real URL ("shopee-fake-voucher.com"), indicating smishing.',
            'Shopee’s official domain is "shopee.ph"; claim vouchers directly on their site.',
            'Verify promotions through Shopee’s official app or customer support.'
          ] },
          { text: 'An SMS from Lazada says your package is on hold due to a payment issue and provides a link to resolve it. Is this safe?', smsContent: { from: 'Lazada PH', body: 'Lazada Alert: Your package is on hold due to a payment issue. Resolve at https://lazàda.com/resolve by May 20, 2025.', maskedUrl: 'https://lazada-fake-payment.com' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Highly Technical', explanation: [
            'The sender "Lazada PH" is not a verified Lazada contact.',
            'The URL "lazàda.com" uses a homoglyph: "à" mimics "a".',
            'The link masks the real URL ("lazada-fake-payment.com"), a smishing sign.',
            'Lazada’s official domain is "lazada.com.ph"; resolve payment issues directly on their site.',
            'Check Lazada’s official app or website for package updates.'
          ] }
        ],
        netsec: [],
        forensics: [],
        crypto: []
      };
