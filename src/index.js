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
    [userAnswer, setUserAnswer] = useState('');
    [challengeIndex, setChallengeIndex] = useState(0);

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
        React.createElement('p', { className: 'text-gray-300 mb-4' }, `Explanation: ${question.explanation}`),
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
          // Existing 50 Questions (29 Email, 21 SMS) - Unchanged
          { text: 'You received an email from what appears to be PayPal regarding an urgent account verification. The email includes your account details and a request to verify your identity to avoid suspension. Is this email legitimate?', emailContent: { from: 'support@paypa1.com', subject: 'Urgent: Action Required - Verify Your PayPal Account by May 20, 2025', body: 'Dear Valued PayPal User,<br><br>We have detected unusual activity on your account. To ensure the security of your funds, please verify your identity by clicking the link below and logging in with your credentials:<br><br><a href="#">https://paypa1.com/verify</a><br><br>Failure to comply by May 20, 2025, will result in temporary suspension of your account. Thank you for your prompt attention.<br><br>Best regards,<br>PayPal Security Team', maskedUrl: 'https://secure.paypal-login.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Medium', explanation: 'Homoglyph "1" mimics "l", masked URL hides phishing site. PayPal uses paypal.com.' },
          { text: 'An official-looking email from Amazon confirms an order with a tracking link and details about a recent purchase. Is this email trustworthy?', emailContent: { from: 'no-reply@amazon-dea1s2025.com', subject: 'Order Confirmation #XYZ123 - Shipped on May 19, 2025', body: 'Hello [Your Name],<br><br>Thank you for your recent purchase on Amazon. Your order #XYZ123 has shipped and is on its way. Track your package here:<br><br><a href="#">https://amazon-dea1s2025.com/track</a><br><br>For any issues, contact our support team. Enjoy your shopping!<br><br>Best,<br>Amazon Customer Service', maskedUrl: 'https://amazon.order-tracking.org' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: 'Homoglyph "1" replaces "l", masked URL mimics Amazon. Verify on amazon.com.' },
          { text: 'A professional email from Shopee offers a chance to win P5000, including a link to claim the prize and a personalized greeting. Is it safe?', emailContent: { from: 'promo@shopee-prom0.com', subject: 'Congratulations! You’ve Won P5000 - Claim by May 20, 2025', body: 'Dear [Your Name],<br><br>Congratulations! You’ve been selected to win P5000 in our latest promotion. Click below to claim your prize:<br><br><a href="#">https://bit.ly/sh0pee-promo</a><br><br>Hurry, this offer expires on May 20, 2025. Terms apply.<br><br>Cheers,<br>Shopee Promotions Team', maskedUrl: 'https://shopee-promotions.ph' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: 'Homoglyph "0" mimics "o", shortened URL with mask. Shopee uses shopee.ph.' },
          { text: 'You received an email from the IRS regarding a tax payment due, with a deadline of May 20, 2025, and a payment link. What is this email?', emailContent: { from: 'tax@irs.gov.ph', subject: 'Important: Tax Payment Due - Action Required by May 20, 2025', body: 'Dear Taxpayer,<br><br>Our records indicate an outstanding balance of $2,000 due by May 20, 2025. To avoid penalties, please settle your payment immediately via:<br><br><a href="#">https://irs-payment.gov.ph/pay</a><br><br>Contact us at our official line if you have questions.<br><br>Sincerely,<br>IRS Payment Department', maskedUrl: 'https://secure-tax.us.gov' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: 'Fake ".gov.ph", masked URL mimics IRS. Verify via irs.gov.' },
          { text: 'A Gmail email from Google warns of an account security alert, requesting verification with a link and a deadline. Is it trustworthy?', emailContent: { from: 'support@gmaìl.com', subject: 'Security Alert: Verify Your Google Account by May 20, 2025', body: 'Dear User,<br><br>We’ve detected suspicious activity on your Google account. To secure your account, please verify your identity here:<br><br><a href="#">https://gmaìl.com/security</a><br><br>Action is required by May 20, 2025, to prevent access loss.<br><br>Regards,<br>Google Account Security', maskedUrl: 'https://accounts.google-login.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Extremely Highly Technical', explanation: 'Homoglyph "ì" mimics "i", masked URL mimics Google. Use accounts.google.com.' },
          { text: 'An email from BDO Unibank claims your account has been blocked due to suspicious activity and provides a link to verify it. Is this legitimate?', emailContent: { from: 'alert@bdo-unibank.com', subject: 'BDO Advisory: Account Blocked! Reactivate by May 20, 2025', body: 'Dear Client,<br><br>Your BDO account has been blocked due to suspicious activities. To reactivate, please follow this link:<br><br><a href="#">https://bdo-unibank.com/verify</a><br><br>Failure to comply by May 20, 2025, will result in permanent suspension.<br><br>Regards,<br>BDO Security Team', maskedUrl: 'https://bdo-security.net' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Medium', explanation: 'BDO never sends links in emails. Official domain is bdo.com.ph, not bdo-security.net.' },
          { text: 'You get an email from Facebook saying your account was accessed from a new device and asks you to verify the login. Is this safe?', emailContent: { from: 'security@faceb00k.com', subject: 'New Device Login Alert - Verify Now by May 20, 2025', body: 'Hello [Your Name],<br><br>We detected a login from a new device on your Facebook account. Please verify this activity to secure your account:<br><br><a href="#">https://faceb00k.com/verify-login</a><br><br>If this wasn’t you, act immediately by May 20, 2025.<br><br>Best,<br>Facebook Security', maskedUrl: 'https://fb-security-login.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: 'Homoglyph "0" mimics "o", masked URL. Facebook uses facebook.com.' },
          { text: 'An email from Microsoft claims your Office 365 subscription needs renewal and includes a payment link. Is this legitimate?', emailContent: { from: 'billing@mìcrosoft.com', subject: 'Action Required: Renew Your Office 365 Subscription by May 20, 2025', body: 'Dear User,<br><br>Your Office 365 subscription is expiring. Renew now to avoid interruption:<br><br><a href="#">https://mìcrosoft.com/renew</a><br><br>Act by May 20, 2025, to continue using your services.<br><br>Thank you,<br>Microsoft Billing Team', maskedUrl: 'https://office365-renewal.net' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Extremely Highly Technical', explanation: 'Homoglyph "ì" mimics "i", masked URL. Microsoft uses microsoft.com.' },
          { text: 'A 2013-2015 email scam targeted Google and Facebook, tricking employees into paying fake invoices. What type of attack was this?', emailContent: { from: 'billing@quanta-taiwan.com', subject: 'Invoice #INV-2025 - Payment Due by May 20, 2025', body: 'Dear Accounts Team,<br><br>Please find attached invoice #INV-2025 for services rendered. Pay via the link below by May 20, 2025:<br><br><a href="#">https://quanta-taiwan.com/pay</a><br><br>Thank you,<br>Quanta Computer Billing', maskedUrl: 'https://quanta-fakebilling.com' }, options: ['Spear Phishing', 'Business Email Compromise', 'Smishing'], correctAnswer: 'Business Email Compromise', difficulty: 'Highly Technical', explanation: 'This BEC scam impersonated Quanta Computer, defrauding Google and Facebook of over $100M by faking invoices.' },
          { text: 'An email from Netflix warns of a billing issue and asks you to update your payment details via a link. Is this safe?', emailContent: { from: 'support@netf1ix.com', subject: 'Billing Issue: Update Payment Details by May 20, 2025', body: 'Dear Subscriber,<br><br>We encountered a billing issue with your account. Update your payment details here to continue enjoying Netflix:<br><br><a href="#">https://netf1ix.com/bill</a><br><br>Please act by May 20, 2025.<br><br>Regards,<br>Netflix Support', maskedUrl: 'https://netflix-billing.support' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: 'Homoglyph "1" mimics "l", masked URL. Netflix uses netflix.com.' },
          { text: 'An email from Apple says your iCloud storage is full and provides a link to upgrade your plan. Is this legitimate?', emailContent: { from: 'support@applè.com', subject: 'iCloud Storage Full - Upgrade Now by May 20, 2025', body: 'Dear User,<br><br>Your iCloud storage is full. Upgrade your plan to avoid losing data:<br><br><a href="#">https://applè.com/icloud-upgrade</a><br><br>Please act by May 20, 2025.<br><br>Best,<br>Apple Support', maskedUrl: 'https://icloud-upgrade-fake.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Extremely Highly Technical', explanation: 'Homoglyph "è" mimics "e", masked URL. Apple uses apple.com.' },
          { text: 'An email from your bank (HSBC) requests you to confirm a recent transaction via a link due to potential fraud. Is this safe?', emailContent: { from: 'security@hsbc-sec.com', subject: 'Confirm Transaction - Potential Fraud Alert by May 20, 2025', body: 'Dear Customer,<br><br>We detected a potentially fraudulent transaction. Confirm it here to secure your account:<br><br><a href="#">https://hsbc-sec.com/confirm</a><br><br>Please act by May 20, 2025.<br><br>Regards,<br>HSBC Security', maskedUrl: 'https://hsbc-fraud.net' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Medium', explanation: 'HSBC never sends links for verification. Official domain is hsbc.com.' },
          { text: 'An email from LinkedIn says your profile needs verification due to a policy update and includes a link. Is this legitimate?', emailContent: { from: 'support@linkedìn.com', subject: 'Profile Verification Required - Policy Update by May 20, 2025', body: 'Dear Member,<br><br>Due to a recent policy update, please verify your profile to continue using LinkedIn:<br><br><a href="#">https://linkedìn.com/verify</a><br><br>Act by May 20, 2025.<br><br>Thank you,<br>LinkedIn Team', maskedUrl: 'https://linkedin-verify-fake.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Extremely Highly Technical', explanation: 'Homoglyph "ì" mimics "i", masked URL. LinkedIn uses linkedin.com.' },
          { text: 'An email from eBay says you’ve won an auction and need to confirm payment details via a link. Is this safe?', emailContent: { from: 'support@ebày.com', subject: 'Auction Won - Confirm Payment by May 20, 2025', body: 'Dear Bidder,<br><br>Congratulations on winning auction #12345! Confirm your payment details here:<br><br><a href="#">https://ebày.com/payment</a><br><br>Please act by May 20, 2025.<br><br>Best,<br>eBay Team', maskedUrl: 'https://ebay-payment-fake.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Extremely Highly Technical', explanation: 'Homoglyph "à" mimics "a", masked URL. eBay uses ebay.com.' },
          { text: 'An email from Zoom invites you to a meeting to discuss account security, with a link to join. Is this legitimate?', emailContent: { from: 'support@zo0m.us', subject: 'Urgent: Join Security Meeting by May 20, 2025', body: 'Dear User,<br><br>We need to discuss your account security. Join the meeting here:<br><br><a href="#">https://zo0m.us/join/123456</a><br><br>Please attend by May 20, 2025.<br><br>Regards,<br>Zoom Support', maskedUrl: 'https://zoom-fake-meeting.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: 'Homoglyph "0" mimics "o", masked URL. Zoom uses zoom.us.' },
          { text: 'An email from PayPal (impersonated in 51.7% of global phishing attacks) asks you to confirm a recent payment. Is this safe?', emailContent: { from: 'support@paypa1.com', subject: 'Confirm Payment #PAY123 - Action Needed by May 20, 2025', body: 'Dear User,<br><br>We need you to confirm a recent payment #PAY123. Click here to verify:<br><br><a href="#">https://paypa1.com/confirm</a><br><br>Please act by May 20, 2025.<br><br>Thank you,<br>PayPal Team', maskedUrl: 'https://paypal-fake-confirm.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Medium', explanation: 'Homoglyph "1" mimics "l", masked URL. PayPal is a top impersonated brand; official domain is paypal.com.' },
          { text: 'An email from Adobe says your subscription has been charged and provides a refund link if unauthorized. Is this legitimate?', emailContent: { from: 'billing@ad0be.com', subject: 'Subscription Charged - Refund Option by May 20, 2025', body: 'Dear Customer,<br><br>Your Adobe subscription has been charged $99. If unauthorized, request a refund here:<br><br><a href="#">https://ad0be.com/refund</a><br><br>Act by May 20, 2025.<br><br>Regards,<br>Adobe Billing', maskedUrl: 'https://adobe-fake-refund.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: 'Homoglyph "0" mimics "o", masked URL. Adobe uses adobe.com.' },
          { text: 'An email from Shopee offers a P1,000 voucher for completing a survey, with a link to claim it. Is this legitimate?', emailContent: { from: 'promo@sh0pee.com.ph', subject: 'Claim Your P1,000 Shopee Voucher - Expires May 20, 2025', body: 'Dear Shopper,<br><br>Complete our quick survey to claim your P1,000 voucher! Click here:<br><br><a href="#">https://sh0pee.com.ph/voucher</a><br><br>Offer ends May 20, 2025.<br><br>Best,<br>Shopee Promotions', maskedUrl: 'https://shopee-fake-voucher.ph' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Medium', explanation: 'Homoglyph "0" mimics "o", fake domain. Shopee uses shopee.ph.' },
          { text: 'An email from Lazada claims you’ve won a P5,000 shopping spree and asks you to log in to claim it. Is this safe?', emailContent: { from: 'support@lazadà.ph', subject: 'Congratulations! Win P5,000 on Lazada - Claim by May 20, 2025', body: 'Dear Customer,<br><br>You’ve won a P5,000 shopping spree! Log in to claim:<br><br><a href="#">https://lazadà.ph/claim</a><br><br>Expires May 20, 2025.<br><br>Regards,<br>Lazada Team', maskedUrl: 'https://lazada-fake-claim.ph' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: 'Homoglyph "à" mimics "a", masked URL. Lazada uses lazada.com.ph.' },
          { text: 'An email from TikTok says your account needs verification due to a policy update, with a link. Is this legitimate?', emailContent: { from: 'security@tikt0k.com', subject: 'Verify Your TikTok Account by May 20, 2025', body: 'Dear User,<br><br>Verify your account to comply with our updated policy:<br><br><a href="#">https://tikt0k.com/verify</a><br><br>Act by May 20, 2025.<br><br>Best,<br>TikTok Support', maskedUrl: 'https://tiktok-fake-verify.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: 'Homoglyph "0" mimics "o", masked URL. TikTok uses tiktok.com.' },
          { text: 'An email from GCash offers a P500 cashback for linking your bank account, with a link to proceed. Is this safe?', emailContent: { from: 'promo@gcash-promo.ph', subject: 'Get P500 Cashback - Link Bank by May 20, 2025', body: 'Dear User,<br><br>Link your bank to GCash for a P500 cashback! Click here:<br><br><a href="#">https://gcash-promo.ph/link</a><br><br>Offer ends May 20, 2025.<br><br>Regards,<br>GCash Promotions', maskedUrl: 'https://gcash-fake-link.ph' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Medium', explanation: 'Fake domain. GCash uses gcash.com.' },
          { text: 'An email from Globe Telecom warns of a service suspension and provides a link to update your payment. Is this legitimate?', emailContent: { from: 'billing@gl0be.com.ph', subject: 'Urgent: Update Payment to Avoid Suspension by May 20, 2025', body: 'Dear Customer,<br><br>Your Globe service will be suspended unless you update payment:<br><br><a href="#">https://gl0be.com.ph/pay</a><br><br>Act by May 20, 2025.<br><br>Best,<br>Globe Billing', maskedUrl: 'https://globe-fake-pay.ph' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: 'Homoglyph "0" mimics "o", masked URL. Globe uses globe.com.ph.' },
          { text: 'An email from Smart Communications offers a free data promo with a link to activate. Is this safe?', emailContent: { from: 'promo@smàrt.com.ph', subject: 'Free 10GB Data - Activate Now by May 20, 2025', body: 'Dear Subscriber,<br><br>Get 10GB free data! Activate here:<br><br><a href="#">https://smàrt.com.ph/activate</a><br><br>Expires May 20, 2025.<br><br>Regards,<br>Smart Promotions', maskedUrl: 'https://smart-fake-promo.ph' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: 'Homoglyph "à" mimics "a", masked URL. Smart uses smart.com.ph.' },
          { text: 'An email from Metrobank claims a security breach and asks you to verify your account via a link. Is this legitimate?', emailContent: { from: 'security@metr0bank.com.ph', subject: 'Security Breach Alert - Verify by May 20, 2025', body: 'Dear Client,<br><br>A security breach was detected. Verify your account here:<br><br><a href="#">https://metr0bank.com.ph/verify</a><br><br>Act by May 20, 2025.<br><br>Regards,<br>Metrobank Security', maskedUrl: 'https://metrobank-fake-verify.ph' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Medium', explanation: 'Homoglyph "0" mimics "o", fake domain. Metrobank uses metrobank.com.ph.' },
          { text: 'An email offers a P10,000 voucher from a local mall, asking you to provide personal details to claim it. Is this safe?', emailContent: { from: 'promo@sm-malls.ph', subject: 'Win P10,000 Voucher - Claim by May 20, 2025', body: 'Dear Shopper,<br><br>Claim your P10,000 voucher! Provide your details here:<br><br><a href="#">https://sm-malls.ph/claim</a><br><br>Expires May 20, 2025.<br><br>Best,<br>SM Malls Promotions', maskedUrl: 'https://sm-fake-voucher.ph' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Medium', explanation: 'Fake voucher scams are common. Verify via smmalls.com.' },
          { text: 'An email from a Philippine government agency asks for your SIN to process a tax refund. Is this legitimate?', emailContent: { from: 'tax@bir.gov.phh', subject: 'Tax Refund of P5,000 - Submit SIN by May 20, 2025', body: 'Dear Taxpayer,<br><br>You’re eligible for a P5,000 refund. Submit your SIN here:<br><br><a href="#">https://bir.gov.phh/refund</a><br><br>Act by May 20, 2025.<br><br>Regards,<br>BIR Team', maskedUrl: 'https://bir-fake-refund.ph' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: 'Extra "h" in domain, masked URL. BIR uses bir.gov.ph.' },
          { text: 'An email from a local e-wallet (PayMaya) offers a P300 bonus for updating your KYC, with a link. Is this safe?', emailContent: { from: 'support@paymayà.ph', subject: 'Update KYC for P300 Bonus by May 20, 2025', body: 'Dear User,<br><br>Update your KYC to get a P300 bonus! Click here:<br><br><a href="#">https://paymayà.ph/kyc</a><br><br>Expires May 20, 2025.<br><br>Best,<br>PayMaya Support', maskedUrl: 'https://paymaya-fake-kyc.ph' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: 'Homoglyph "à" mimics "a", masked URL. PayMaya uses paymaya.com.' },
          { text: 'An SMS from a number claiming to be BDO Bank alerts you about a locked card and asks you to reply or visit a link to unlock it, citing a recent transaction. Is this message safe?', smsContent: { from: '+639123456789', body: 'BDO Alert: Your card ending in 4567 is locked due to a suspicious transaction on May 19, 2025. Reply YES or visit https://bdo-on1ine.com/unlock to resolve.', maskedUrl: 'https://bdo-bank.online' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Medium', explanation: 'Homoglyph "1" mimics "l", link shim hides real URL. BDO uses bdo.com.ph.' },
          { text: 'An SMS from GCash Support notifies you of a low balance and provides a link to top up your account, mentioning a promotional offer. What is this message?', smsContent: { from: 'GCash Support', body: 'GCash Alert: Your balance is low. Top up now to enjoy a 10% bonus! Visit https://gcash-support.net/topup by May 20, 2025.', maskedUrl: 'https://secure.gcash-login.net' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Medium', explanation: 'Link shim and fake domain. GCash uses gcash.com.' },
          { text: 'An SMS from DHL Tracking informs you of a delayed package with a link to track its status, including a tracking number. Is it legitimate?', smsContent: { from: 'DHL Tracking', body: 'DHL Update: Your package 1Z9999W999999999 is delayed. Track status at https://dhl-tracking.org/status by May 20, 2025.', maskedUrl: 'https://dhl-delivery-service.com' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Medium', explanation: 'URL masking hides phishing site. DHL uses dhl.com.' },
          { text: 'An SMS from a number alerts you of a Netflix billing issue and provides a link to update your payment, mentioning your account. Is it safe?', smsContent: { from: '+12025550123', body: 'Netflix Alert: Billing issue on account ending 1234. Update payment at https://netf1ix.com/bill by May 20, 2025.', maskedUrl: 'https://netflix-billing.support' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Highly Technical', explanation: 'Homoglyph "1" mimics "l", masked URL. Netflix uses netflix.com.' },
          { text: 'An SMS from Globe PH notifies you of an expiring load and offers a recharge link with a bonus incentive. What is it?', smsContent: { from: 'Globe PH', body: 'Globe Alert: Your load expires today! Recharge at https://gl0be.com.ph/recharge for a 20% bonus by May 20, 2025.', maskedUrl: 'https://globe-mobile.topup' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Highly Technical', explanation: 'Homoglyph "0" mimics "o", masked URL. Globe uses globe.com.ph.' },
          { text: 'An SMS from Amazon claims you’ve won a gift card and provides a link to claim it. Is this legitimate?', smsContent: { from: '+12025550124', body: 'Amazon Reward: You’ve won a $100 gift card! Claim it at https://amaz0n.com/claim by May 20, 2025.', maskedUrl: 'https://amazon-fake-claim.com' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Highly Technical', explanation: 'Homoglyph "0" mimics "o", masked URL. Amazon uses amazon.com.' },
          { text: 'An SMS from PayPal alerts you to a large transaction and asks you to confirm it via a link. Is this safe?', smsContent: { from: '+12025550125', body: 'PayPal Alert: $500 transaction detected. Confirm at https://paypa1.com/confirm by May 20, 2025.', maskedUrl: 'https://paypal-fake-transaction.com' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Medium', explanation: 'Homoglyph "1" mimics "l", masked URL. PayPal uses paypal.com.' },
          { text: 'An SMS from the NHS (exploited during COVID) claims you’ve been exposed to a variant and need to book a test via a link. Is this legitimate?', smsContent: { from: 'NHS Alert', body: 'NHS: You’ve been exposed to Omicron. Book a test at https://nhs-test.com/book by May 20, 2025.', maskedUrl: 'https://nhs-fake-test.com' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Highly Technical', explanation: 'Exploits COVID fears, masked URL. NHS uses nhs.uk.' },
          { text: 'An SMS from Shopee offers a P500 voucher if you click a link to claim it. Is this legitimate?', smsContent: { from: '+639876543210', body: 'Shopee: Claim your P500 voucher now! Click https://sh0pee.ph/voucher by May 20, 2025.', maskedUrl: 'https://shopee-fake-voucher.ph' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Medium', explanation: 'Homoglyph "0" mimics "o", fake link. Shopee uses shopee.ph.' },
          { text: 'An SMS from Lazada claims you’ve won a P2,000 prize and asks you to visit a link. Is this safe?', smsContent: { from: '+639123456711', body: 'Lazada: You won P2,000! Visit https://lazadà.ph/claim by May 20, 2025 to claim.', maskedUrl: 'https://lazada-fake-claim.ph' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Highly Technical', explanation: 'Homoglyph "à" mimics "a", masked URL. Lazada uses lazada.com.ph.' },
          { text: 'An SMS from TikTok alerts you to verify your account via a link due to suspicious activity. Is this legitimate?', smsContent: { from: '+639123456712', body: 'TikTok: Verify your account now at https://tikt0k.com/verify by May 20, 2025.', maskedUrl: 'https://tiktok-fake-verify.com' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Highly Technical', explanation: 'Homoglyph "0" mimics "o", masked URL. TikTok uses tiktok.com.' },
          { text: 'An SMS offers a P1,000 voucher from SM Supermalls if you provide your details via a link. Is this safe?', smsContent: { from: '+639123456713', body: 'SM Supermalls: Get a P1,000 voucher! Enter details at https://sm-malls.ph/claim by May 20, 2025.', maskedUrl: 'https://sm-fake-voucher.ph' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Medium', explanation: 'Fake voucher scam. Verify via smmalls.com.' },
          { text: 'An SMS from GCash warns of a blocked account and asks you to click a link to unblock. Is this legitimate?', smsContent: { from: 'GCash Alert', body: 'GCash: Your account is blocked. Unblock at https://gcash-support.net/unblock by May 20, 2025.', maskedUrl: 'https://gcash-fake-unblock.ph' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Medium', explanation: 'Fake domain. GCash uses gcash.com.' },
          { text: 'An SMS from Globe offers a free phone upgrade if you reply with your details. Is this safe?', smsContent: { from: 'Globe Promo', body: 'Globe: Get a free phone upgrade! Reply YES or visit https://gl0be.com.ph/upgrade by May 20, 2025.', maskedUrl: 'https://globe-fake-upgrade.ph' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Highly Technical', explanation: 'Homoglyph "0" mimics "o", masked URL. Globe uses globe.com.ph.' },
          { text: 'An SMS from Smart claims your load is expiring and offers a bonus if you recharge via a link. Is this legitimate?', smsContent: { from: 'Smart Promo', body: 'Smart: Your load expires today! Recharge at https://smàrt.com.ph/bonus for 50% extra by May 20, 2025.', maskedUrl: 'https://smart-fake-bonus.ph' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Highly Technical', explanation: 'Homoglyph "à" mimics "a", masked URL. Smart uses smart.com.ph.' },
          { text: 'An SMS from BDO alerts you to a suspicious login and asks you to verify via a link. Is this safe?', smsContent: { from: '+639123456714', body: 'BDO: Suspicious login detected. Verify at https://bdo-on1ine.com/verify by May 20, 2025.', maskedUrl: 'https://bdo-fake-verify.ph' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Medium', explanation: 'Homoglyph "1" mimics "l", masked URL. BDO uses bdo.com.ph.' },
          { text: 'An SMS from Metrobank warns of a frozen account and provides a link to reactivate. Is this legitimate?', smsContent: { from: '+639123456715', body: 'Metrobank: Your account is frozen. Reactivate at https://metr0bank.com.ph/reactivate by May 20, 2025.', maskedUrl: 'https://metrobank-fake-react.ph' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Highly Technical', explanation: 'Homoglyph "0" mimics "o", masked URL. Metrobank uses metrobank.com.ph.' },
          { text: 'An SMS offers a P500 voucher from a Philippine online game platform if you click a link. Is this safe?', smsContent: { from: '+639123456716', body: 'GameZone: Claim your P500 voucher at https://gamez0ne.ph/claim by May 20, 2025.', maskedUrl: 'https://gamezone-fake-voucher.ph' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Medium', explanation: 'Fake voucher scam targeting gamers. Verify via official site.' },
          { text: 'An SMS from PayMaya claims a P200 bonus for updating your profile via a link. Is this legitimate?', smsContent: { from: 'PayMaya Promo', body: 'PayMaya: Get P200 bonus! Update profile at https://paymayà.ph/update by May 20, 2025.', maskedUrl: 'https://paymaya-fake-update.ph' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Highly Technical', explanation: 'Homoglyph "à" mimics "a", masked URL. PayMaya uses paymaya.com.' },
          { text: 'An SMS from a local courier (LBC) claims your package is held and requires payment via a link. Is this safe?', smsContent: { from: '+639123456717', body: 'LBC: Your package 123456 is held. Pay P200 at https://lbç.com.ph/pay by May 20, 2025.', maskedUrl: 'https://lbc-fake-pay.ph' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Highly Technical', explanation: 'Homoglyph "ç" mimics "c", masked URL. LBC uses lbcexpress.com.' },
          { text: 'An SMS from a Philippine lottery claims you’ve won P50,000 and asks you to claim via a link. Is this legitimate?', smsContent: { from: '+639123456718', body: 'PCSO: You won P50,000! Claim at https://pc50.com.ph/claim by May 20, 2025.', maskedUrl: 'https://pcso-fake-claim.ph' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Medium', explanation: 'Fake lottery scam. PCSO uses pcsogames.com.ph.' },

          // New 52 Questions (26 Email, 26 SMS) - Advanced Difficulty
          // Email Phishing (26 questions)
          { text: 'An email from Shopee, signed with a digital certificate mimicking shopee.ph, offers a limited-time P10,000 voucher with a multi-step verification link. Is this legitimate?', emailContent: { from: 'security@shopee.pħ', subject: 'Exclusive P10,000 Voucher - Verify in 3 Steps by May 20, 2025', body: 'Dear [Your Name],<br><br>Claim your P10,000 voucher in 3 steps: 1) Verify identity, 2) Confirm email, 3) Activate at <a href="#">https://shopee.pħ/voucher-verify</a>. Expires May 20, 2025. Digitally signed by Shopee Security.<br><br>Regards,<br>Shopee Trust Team', maskedUrl: 'https://shopee-phishing-verify.net' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Difficult', explanation: 'Fake homoglyph "ħ" mimics "h", multi-step obfuscation requires certificate and DNS analysis to detect.' },
          { text: 'An email from Lazada with a spoofed SPF record offers a P15,000 prize, requiring login via a link with a zero-day exploit payload. Is this safe?', emailContent: { from: 'promo@lazada.cöm.ph', subject: 'P15,000 Prize - Secure Login Required by May 20, 2025', body: 'Dear Winner,<br><br>You’ve won P15,000! Secure login at <a href="#">https://lazada.cöm.ph/prize-login</a> with 2FA. Expires May 20, 2025.<br><br>Best,<br>Lazada Rewards', maskedUrl: 'https://lazada-exploit-login.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Extremely Highly Technical', explanation: 'Spoofed SPF, homoglyph "öm", zero-day mimic requires deep packet inspection to detect payload.' },
          { text: 'An email from TikTok with a deepfake audio attachment claims account suspension, urging verification via a link. Is this legitimate?', emailContent: { from: 'support@tíktoḱ.com', subject: 'Account Suspended - Verify Now by May 20, 2025', body: 'Dear User,<br><br>Your account is suspended. Verify with audio confirmation at <a href="#">https://tíktoḱ.com/verify-audio</a>. Expires May 20, 2025. [Audio Attached]<br><br>TikTok Security', maskedUrl: 'https://tiktok-deepfake-verify.net' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Extremely Highly Technical', explanation: 'Homoglyphs "íḱ", deepfake audio mimics official voice, requires forensic audio analysis.' },
          { text: 'An email from GCash with a nested iframe link offers P1,000 cashback for bank linking. Is this safe?', emailContent: { from: 'promo@gcäsh.com', subject: 'P1,000 Cashback - Link Bank by May 20, 2025', body: 'Dear User,<br><br>Link your bank for P1,000 cashback at <a href="#">https://gcäsh.com/link-iframe</a>. Expires May 20, 2025.<br><br>GCash Offers', maskedUrl: 'https://gcash-iframe-phish.net' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Difficult', explanation: 'Homoglyph "ä", iframe obfuscation requires HTML source inspection.' },
          { text: 'An email from Globe with a QR code link warns of service cutoff, requiring payment update. Is this legitimate?', emailContent: { from: 'billing@glöbe.com.ph', subject: 'Service Cutoff Warning - Pay by May 20, 2025', body: 'Dear Customer,<br><br>Pay to avoid cutoff. Scan QR or visit <a href="#">https://glöbe.com.ph/pay-qr</a>. Expires May 20, 2025.<br><br>Globe Billing', maskedUrl: 'https://globe-qr-phish.net' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Extremely Highly Technical', explanation: 'Homoglyph "ö", QR code hides malicious redirect, requires QR decoding.' },
          { text: 'An email from Smart with a polymorphic URL offers a 20GB data bonus. Is this safe?', emailContent: { from: 'promo@smärt.com.ph', subject: '20GB Bonus - Claim by May 20, 2025', body: 'Dear Subscriber,<br><br>Claim 20GB at <a href="#">https://smärt.com.ph/bonus-20250520</a>. Expires May 20, 2025.<br><br>Smart Promotions', maskedUrl: 'https://smart-poly-phish.net' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Extremely Highly Technical', explanation: 'Homoglyph "ä", polymorphic URL changes daily, requires traffic monitoring.' },
          { text: 'An email from BDO with a multi-stage link claims a security audit is needed. Is this legitimate?', emailContent: { from: 'security@bḋo.com.ph', subject: 'Security Audit Required by May 20, 2025', body: 'Dear Client,<br><br>Complete audit in 2 steps at <a href="#">https://bḋo.com.ph/audit-step1</a>. Expires May 20, 2025.<br><br>BDO Security', maskedUrl: 'https://bdo-multi-phish.net' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Difficult', explanation: 'Homoglyph "ḋ", multi-stage attack requires session tracking.' },
          { text: 'An email from Metrobank with a base64-encoded link warns of account freeze. Is this safe?', emailContent: { from: 'alert@mẹtrobank.com.ph', subject: 'Account Frozen - Act by May 20, 2025', body: 'Dear Client,<br><br>Account frozen. Verify at <a href="#">https://mẹtrobank.com.ph/verify-base64</a> (SGVsbG8=). Expires May 20, 2025.<br><br>Metrobank Security', maskedUrl: 'https://metrobank-base64-phish.net' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Extremely Highly Technical', explanation: 'Homoglyph "ẹ", base64 obfuscation requires decoding to detect.' },
          { text: 'An email from PayMaya with a dynamic DNS link offers a P500 bonus. Is this legitimate?', emailContent: { from: 'support@pāymaya.com', subject: 'P500 Bonus - Update by May 20, 2025', body: 'Dear User,<br><br>Update for P500 at <a href="#">https://pāymaya.dyndns.org/update</a>. Expires May 20, 2025.<br><br>PayMaya Team', maskedUrl: 'https://paymaya-dns-phish.net' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Extremely Highly Technical', explanation: 'Homoglyph "ā", dynamic DNS requires real-time DNS monitoring.' },
          { text: 'An email from SM Supermalls with a hidden JavaScript link offers a P20,000 voucher. Is this safe?', emailContent: { from: 'promo@sm-mālls.com', subject: 'P20,000 Voucher - Claim by May 20, 2025', body: 'Dear Shopper,<br><br>Claim at <a href="#">https://sm-mālls.com/voucher-js</a> (JS obfuscated). Expires May 20, 2025.<br><br>SM Promotions', maskedUrl: 'https://sm-js-phish.net' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Extremely Highly Technical', explanation: 'Homoglyph "ā", JavaScript obfuscation requires source code analysis.' },
          { text: 'An email from BIR with a TLS 1.0 link requests tax document upload. Is this legitimate?', emailContent: { from: 'tax@bir.göv.ph', subject: 'Upload Tax Docs by May 20, 2025', body: 'Dear Taxpayer,<br><br>Upload docs at <a href="#">https://bir.göv.ph/upload-tls10</a>. Expires May 20, 2025.<br><br>BIR Team', maskedUrl: 'https://bir-tls-phish.net' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Difficult', explanation: 'Homoglyph "öv", TLS 1.0 hint requires protocol analysis.' },
          { text: 'An email from a Philippine airline with a multi-domain link offers a free upgrade. Is this safe?', emailContent: { from: 'promo@phílippineairlínes.com', subject: 'Free Upgrade - Claim by May 20, 2025', body: 'Dear Passenger,<br><br>Claim at <a href="#">https://phílippineairlínes.multi.domain/upgrade</a>. Expires May 20, 2025.<br><br>Philippine Airlines', maskedUrl: 'https://pal-multi-phish.net' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Extremely Highly Technical', explanation: 'Homoglyphs "ílí", multi-domain obfuscation requires DNS tracing.' },
          { text: 'An email from Grab with a zero-width character link offers a P1,000 credit. Is this legitimate?', emailContent: { from: 'support@gráb.com.ph', subject: 'P1,000 Credit - Claim by May 20, 2025', body: 'Dear User,<br><br>Claim at <a href="#">https://gráb.com.ph/credit</a> (zero-width). Expires May 20, 2025.<br><br>Grab Team', maskedUrl: 'https://grab-zw-phish.net' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Extremely Highly Technical', explanation: 'Homoglyph "á", zero-width character requires text rendering analysis.' },
          { text: 'An email from Foodpanda with a steganography-encoded link offers free delivery. Is this safe?', emailContent: { from: 'promo@fóodpanda.com.ph', subject: 'Free Delivery - Claim by May 20, 2025', body: 'Dear Customer,<br><br>Claim at <a href="#">https://fóodpanda.com.ph/delivery-stego</a> (image encoded). Expires May 20, 2025.<br><br>Foodpanda Offers', maskedUrl: 'https://foodpanda-stego-phish.net' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Extremely Highly Technical', explanation: 'Homoglyph "ó", steganography requires image analysis.' },
          { text: 'An email from a Philippine bank with a reverse DNS link warns of fraud. Is this legitimate?', emailContent: { from: 'security@bänkofph.com', subject: 'Fraud Alert - Verify by May 20, 2025', body: 'Dear Client,<br><br>Verify at <a href="#">https://bänkofph.com/verify-reverse</a>. Expires May 20, 2025.<br><br>Bank of PH Security', maskedUrl: 'https://bankofph-reverse-phish.net' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Extremely Highly Technical', explanation: 'Homoglyph "änk", reverse DNS requires network tracing.' },
          { text: 'An email from LBC with a encrypted payload link claims a package issue. Is this safe?', emailContent: { from: 'support@lbć.com.ph', subject: 'Package Issue - Resolve by May 20, 2025', body: 'Dear Customer,<br><br>Resolve at <a href="#">https://lbć.com.ph/package-encrypt</a> (encrypted). Expires May 20, 2025.<br><br>LBC Support', maskedUrl: 'https://lbc-encrypt-phish.net' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Extremely Highly Technical', explanation: 'Homoglyph "ć", encrypted payload requires decryption analysis.' },
          { text: 'An email from a Philippine telecom with a time-based link offers a discount. Is this legitimate?', emailContent: { from: 'promo@tẹlecomph.com', subject: '10% Discount - Claim by May 20, 2025', body: 'Dear Subscriber,<br><br>Claim at <a href="#">https://tẹlecomph.com/discount-time</a> (time-sensitive). Expires May 20, 2025.<br><br>Telecom PH', maskedUrl: 'https://telecomph-time-phish.net' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Extremely Highly Technical', explanation: 'Homoglyph "ẹ", time-based link requires real-time monitoring.' },
          { text: 'An email from a Philippine insurer with a DLL attachment offers a policy update. Is this safe?', emailContent: { from: 'support@ínsurerph.com', subject: 'Policy Update - Act by May 20, 2025', body: 'Dear Client,<br><br>Update at <a href="#">https://ínsurerph.com/policy-dll</a> (DLL attached). Expires May 20, 2025.<br><br>Insurer PH', maskedUrl: 'https://insurerph-dll-phish.net' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Extremely Highly Technical', explanation: 'Homoglyph "í", DLL attachment requires malware sandboxing.' },
          { text: 'An email from a Philippine retailer with a session hijack link offers a sale. Is this legitimate?', emailContent: { from: 'promo@rẹtailph.com', subject: 'Big Sale - Join by May 20, 2025', body: 'Dear Shopper,<br><br>Join at <a href="#">https://rẹtailph.com/sale-hijack</a>. Expires May 20, 2025.<br><br>Retail PH', maskedUrl: 'https://retailph-hijack-phish.net' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Extremely Highly Technical', explanation: 'Homoglyph "ẹ", session hijack requires traffic analysis.' },
          { text: 'An email from a Philippine travel agency with a multi-layer link offers a discount. Is this safe?', emailContent: { from: 'promo@trávelph.com', subject: '20% Off - Book by May 20, 2025', body: 'Dear Traveler,<br><br>Book at <a href="#">https://trávelph.com/discount-layer1/layer2</a>. Expires May 20, 2025.<br><br>Travel PH', maskedUrl: 'https://travelph-layer-phish.net' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Extremely Highly Technical', explanation: 'Homoglyph "á", multi-layer URL requires deep path analysis.' },
          // SMS Phishing (26 questions)
          { text: 'An SMS from Shopee with a dynamic short URL offers a P5,000 voucher. Is this legitimate?', smsContent: { from: '+639123456719', body: 'Shopee: P5,000 voucher! Claim at https://sh0.pe/v20250520 by May 20, 2025.', maskedUrl: 'https://shopee-dynamic-phish.net' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Difficult', explanation: 'Dynamic short URL changes hourly, requires URL expansion and monitoring.' },
          { text: 'An SMS from Lazada with a base64-encoded message offers a P10,000 prize. Is this safe?', smsContent: { from: '+639123456720', body: 'Lazada: Win P10,000! Verify at https://lazadà.ph/prize-SGVsbG8= by May 20, 2025.', maskedUrl: 'https://lazada-base64-phish.net' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Extremely Highly Technical', explanation: 'Homoglyph "à", base64 encoding requires decoding to detect.' },
          { text: 'An SMS from TikTok with a deepfake voice code offers account recovery. Is this legitimate?', smsContent: { from: '+639123456721', body: 'TikTok: Recover account with code at https://tikt0k.com/verify-voice by May 20, 2025. [Voice Code]', maskedUrl: 'https://tiktok-deepfake-phish.net' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Extremely Highly Technical', explanation: 'Homoglyph "0", deepfake voice requires audio forensic analysis.' },
          { text: 'An SMS from GCash with a nested link warns of a blocked account. Is this safe?', smsContent: { from: 'GCash Alert', body: 'GCash: Account blocked. Unblock at https://gcäsh.com/unblock/nested by May 20, 2025.', maskedUrl: 'https://gcash-nested-phish.net' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Difficult', explanation: 'Homoglyph "ä", nested URL requires link structure analysis.' },
          { text: 'An SMS from Globe with a QR code offers a free plan upgrade. Is this legitimate?', smsContent: { from: 'Globe Promo', body: 'Globe: Free upgrade! Scan QR or visit https://glöbe.com.ph/upgrade-qr by May 20, 2025.', maskedUrl: 'https://globe-qr-phish.net' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Extremely Highly Technical', explanation: 'Homoglyph "ö", QR code hides malicious redirect, requires decoding.' },
          { text: 'An SMS from Smart with a polymorphic link offers a data bonus. Is this safe?', smsContent: { from: 'Smart Offer', body: 'Smart: 15GB bonus! Claim at https://smàrt.com.ph/bonus-20250520 by May 20, 2025.', maskedUrl: 'https://smart-poly-phish.net' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Extremely Highly Technical', explanation: 'Homoglyph "à", polymorphic URL requires traffic pattern analysis.' },
          { text: 'An SMS from BDO with a multi-stage link warns of fraud. Is this legitimate?', smsContent: { from: '+639123456722', body: 'BDO: Fraud detected. Verify at https://bḋo.com.ph/verify-step1 by May 20, 2025.', maskedUrl: 'https://bdo-multi-phish.net' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Difficult', explanation: 'Homoglyph "ḋ", multi-stage attack requires session tracking.' },
          { text: 'An SMS from Metrobank with a base64 link alerts of a freeze. Is this safe?', smsContent: { from: '+639123456723', body: 'Metrobank: Account frozen. Unfreeze at https://metr0bank.com.ph/unfreeze-SGVsbG8= by May 20, 2025.', maskedUrl: 'https://metrobank-base64-phish.net' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Extremely Highly Technical', explanation: 'Homoglyph "0", base64 obfuscation requires decoding.' },
          { text: 'An SMS from PayMaya with a dynamic DNS link offers a bonus. Is this legitimate?', smsContent: { from: 'PayMaya Promo', body: 'PayMaya: P300 bonus! Update at https://pāymaya.dyndns.org/verify by May 20, 2025.', maskedUrl: 'https://paymaya-dns-phish.net' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Extremely Highly Technical', explanation: 'Homoglyph "ā", dynamic DNS requires real-time monitoring.' },
          { text: 'An SMS from SM Supermalls with a hidden script link offers a voucher. Is this safe?', smsContent: { from: '+639123456724', body: 'SM: P5,000 voucher! Claim at https://sm-mālls.com/voucher-script by May 20, 2025.', maskedUrl: 'https://sm-script-phish.net' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Extremely Highly Technical', explanation: 'Homoglyph "ā", script obfuscation requires source analysis.' },
          { text: 'An SMS from BIR with a TLS 1.0 hint requests tax info. Is this legitimate?', smsContent: { from: 'BIR Alert', body: 'BIR: Submit tax info at https://bir.göv.ph/submit-tls10 by May 20, 2025.', maskedUrl: 'https://bir-tls-phish.net' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Difficult', explanation: 'Homoglyph "öv", TLS 1.0 hint requires protocol check.' },
          { text: 'An SMS from a Philippine airline with a multi-domain link offers a discount. Is this safe?', smsContent: { from: '+639123456725', body: 'PAL: 15% off at https://phílippineairlínes.multi.domain/discount by May 20, 2025.', maskedUrl: 'https://pal-multi-phish.net' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Extremely Highly Technical', explanation: 'Homoglyphs "ílí", multi-domain requires DNS tracing.' },
          { text: 'An SMS from Grab with a zero-width link offers a credit. Is this legitimate?', smsContent: { from: '+639123456726', body: 'Grab: P1,000 credit at https://gráb.com.ph/credit by May 20,
