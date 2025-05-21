console.log('index.js loaded');
try {
  const React = window.React;
  const ReactDOM = window.ReactDOM;
  const useState = React.useState;
  const useEffect = React.useEffect;
  console.log('React and ReactDOM loaded:', React, ReactDOM);

  // Function to load JSON data
  function loadJson(src) {
    return Promise.resolve({
      exercisesData: {
        phish: [
          // Email Phishing (40 questions, 80% of total)
          { text: 'An email from PayPal requests urgent account verification with a link, citing unusual activity. Is this legitimate?', emailContent: { from: 'support@paypa1.com', subject: 'Urgent: Verify Your PayPal Account by May 20, 2025', body: 'Dear Valued PayPal User,<br><br>We have detected unusual activity on your account. To ensure the security of your funds, please verify your identity by clicking the link below and logging in with your credentials:<br><br><a href="#">https://paypa1.com/verify</a><br><br>Failure to comply by May 20, 2025, will result in temporary suspension of your account. Thank you for your prompt attention.<br><br>Best regards,<br>PayPal Security Team', maskedUrl: 'https://secure.paypal-login.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Difficult', explanation: [
            'The sender’s email domain is "paypa1.com", not "paypal.com".',
            'It uses a homoglyph: the character "1" mimics the letter "l" to deceive users.',
            'The link’s display URL ("paypa1.com/verify") doesn’t match the masked URL ("secure.paypal-login.com"), indicating URL spoofing.',
            'PayPal never asks for credentials via email links; always verify directly on their official site, paypal.com.',
            'Check email headers for discrepancies in the sender’s domain and SPF/DKIM alignment.'
          ] },
          { text: 'An email from Amazon confirms a high-value order with a tracking link. Is this trustworthy?', emailContent: { from: 'no-reply@amazon-dea1s2025.com', subject: 'Order Confirmation #XYZ123 - Shipped on May 19, 2025', body: 'Hello [Your Name],<br><br>Thank you for your recent purchase on Amazon. Your order #XYZ123 has shipped and is on its way. Track your package here:<br><br><a href="#">https://amazon-dea1s2025.com/track</a><br><br>For any issues, contact our support team. Enjoy your shopping!<br><br>Best,<br>Amazon Customer Service', maskedUrl: 'https://amazon.order-tracking.org' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: [
            'The sender’s domain "amazon-dea1s2025.com" is suspicious.',
            'It uses a homoglyph: "1" replaces "l" in "deals", making it look legitimate at a glance.',
            'The tracking link’s displayed URL ("amazon-dea1s2025.com/track") differs from the masked URL ("amazon.order-tracking.org").',
            'Amazon’s official domain is "amazon.com"; always log in directly to verify orders.',
            'Inspect email headers for sender authenticity and cross-check with Amazon’s official contact methods.'
          ] },
          { text: 'An email from Shopee offers a P5000 prize with a personalized greeting and a claim link. Is it safe?', emailContent: { from: 'promo@shopee-prom0.com', subject: 'Congratulations! You’ve Won P5000 - Claim by May 20, 2025', body: 'Dear [Your Name],<br><br>Congratulations! You’ve been selected to win P5000 in our latest promotion. Click below to claim your prize:<br><br><a href="#">https://bit.ly/sh0pee-promo</a><br><br>Hurry, this offer expires on May 20, 2025. Terms apply.<br><br>Cheers,<br>Shopee Promotions Team', maskedUrl: 'https://shopee-promotions.ph' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Difficult', explanation: [
            'The sender’s domain is "shopee-prom0.com", not Shopee’s official "shopee.ph".',
            'It uses a homoglyph: "0" mimics the letter "o" in "promo".',
            'The link uses a URL shortener ("bit.ly"), which hides the real destination ("shopee-promotions.ph").',
            'Shopee does not use shortened URLs for official promotions; always navigate to shopee.ph directly.',
            'Verify the email’s authenticity by checking the sender’s domain in the email header.'
          ] },
          { text: 'An email from the IRS demands immediate tax payment with a link, threatening penalties. Is this legitimate?', emailContent: { from: 'tax@irs.gov.ph', subject: 'Important: Tax Payment Due - Action Required by May 20, 2025', body: 'Dear Taxpayer,<br><br>Our records indicate an outstanding balance of $2,000 due by May 20, 2025. To avoid penalties, please settle your payment immediately via:<br><br><a href="#">https://irs-payment.gov.ph/pay</a><br><br>Contact us at our official line if you have questions.<br><br>Sincerely,<br>IRS Payment Department', maskedUrl: 'https://secure-tax.us.gov' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: [
            'The sender’s domain "irs.gov.ph" is fake; the real IRS uses "irs.gov".',
            'The ".gov.ph" extension is incorrect for the U.S. IRS, which operates under ".gov".',
            'The payment link’s displayed URL ("irs-payment.gov.ph/pay") doesn’t match the masked URL ("secure-tax.us.gov").',
            'The IRS never requests payments via email links; always verify through irs.gov.',
            'Examine the email’s SPF/DKIM records to confirm the sender’s legitimacy.'
          ] },
          { text: 'A Google email warns of a security alert and requests verification with a link. Is it trustworthy?', emailContent: { from: 'support@gmaìl.com', subject: 'Security Alert: Verify Your Google Account by May 20, 2025', body: 'Dear User,<br><br>We’ve detected suspicious activity on your Google account. To secure your account, please verify your identity here:<br><br><a href="#">https://gmaìl.com/security</a><br><br>Action is required by May 20, 2025, to prevent access loss.<br><br>Regards,<br>Google Account Security', maskedUrl: 'https://accounts.google-login.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: [
            'The sender’s domain "gmaìl.com" contains a homoglyph: "ì" mimics "i".',
            'It includes an embedded zero-width space (U+200B), invisible to the eye but detectable in code.',
            'The link’s displayed URL ("gmaìl.com/security") differs from the masked URL ("accounts.google-login.com").',
            'Google’s official domain for account security is "accounts.google.com"; never use email links to log in.',
            'Requires meticulous inspection of the email header for domain mismatches and hidden characters.'
          ] },
          { text: 'An email from BDO Unibank claims your account is blocked and provides a link to reactivate. Is this legitimate?', emailContent: { from: 'alert@bdo-unibank.com', subject: 'BDO Advisory: Account Blocked! Reactivate by May 20, 2025', body: 'Dear Client,<br><br>Your BDO account has been blocked due to suspicious activities. To reactivate, please follow this link:<br><br><a href="#">https://bdo-unibank.com/verify</a><br><br>Failure to comply by May 20, 2025, will result in permanent suspension.<br><br>Regards,<br>BDO Security Team', maskedUrl: 'https://bdo-security.net' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Difficult', explanation: [
            'The sender’s domain "bdo-unibank.com" is not BDO’s official domain, which is "bdo.com.ph".',
            'The link’s displayed URL ("bdo-unibank.com/verify") doesn’t match the masked URL ("bdo-security.net").',
            'BDO Unibank does not send links in emails for account verification; always log in via bdo.com.ph.',
            'Contact BDO directly using official channels to confirm any account issues.'
          ] },
          { text: 'An email from Facebook alerts you to a new device login and asks you to verify it via a link. Is this safe?', emailContent: { from: 'security@faceb00k.com', subject: 'New Device Login Alert - Verify Now by May 20, 2025', body: 'Hello [Your Name],<br><br>We detected a login from a new device on your Facebook account. Please verify this activity to secure your account:<br><br><a href="#">https://faceb00k.com/verify-login</a><br><br>If this wasn’t you, act immediately by May 20, 2025.<br><br>Best,<br>Facebook Security', maskedUrl: 'https://fb-security-login.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: [
            'The sender’s domain "faceb00k.com" uses a homoglyph: "0" mimics "o".',
            'The link’s displayed URL ("faceb00k.com/verify-login") differs from the masked URL ("fb-security-login.com").',
            'Facebook’s official domain is "facebook.com"; always verify login alerts directly on their site.',
            'Check the email header for domain authenticity and report suspicious emails to Facebook.'
          ] },
          { text: 'A Microsoft email claims your Office 365 subscription needs renewal with a payment link. Is this legitimate?', emailContent: { from: 'billing@mìcrosoft.com', subject: 'Action Required: Renew Your Office 365 Subscription by May 20, 2025', body: 'Dear User,<br><br>Your Office 365 subscription is expiring. Renew now to avoid interruption:<br><br><a href="#">https://mìcrosoft.com/renew</a><br><br>Act by May 20, 2025, to continue using your services.<br><br>Thank you,<br>Microsoft Billing Team', maskedUrl: 'https://office365-renewal.net' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: [
            'The sender’s domain "mìcrosoft.com" contains a homoglyph: "ì" mimics "i".',
            'It includes an embedded zero-width space (U+200B), invisible but detectable.',
            'The link’s displayed URL ("mìcrosoft.com/renew") doesn’t match the masked URL ("office365-renewal.net").',
            'Microsoft’s official domain is "microsoft.com"; renew subscriptions directly on their site.',
            'Deep inspection of the email header is required to detect hidden characters and domain spoofing.'
          ] },
          { text: 'A 2013-2015 email scam targeted Google and Facebook employees with fake invoices. What type of attack was this?', emailContent: { from: 'billing@quanta-taiwan.com', subject: 'Invoice #INV-2025 - Payment Due by May 20, 2025', body: 'Dear Accounts Team,<br><br>Please find attached invoice #INV-2025 for services rendered. Pay via the link below by May 20, 2025:<br><br><a href="#">https://quanta-taiwan.com/pay</a><br><br>Thank you,<br>Quanta Computer Billing', maskedUrl: 'https://quanta-fakebilling.com' }, options: ['Spear Phishing', 'Business Email Compromise', 'Smishing'], correctAnswer: 'Business Email Compromise', difficulty: 'Highly Technical Extremely Difficult', explanation: [
            'This is a Business Email Compromise (BEC) scam targeting high-value companies like Google and Facebook.',
            'The sender impersonates a trusted vendor ("Quanta Computer") with a fake domain ("quanta-taiwan.com").',
            'The link’s displayed URL ("quanta-taiwan.com/pay") masks the real URL ("quanta-fakebilling.com").',
            'The scam defrauded over $100M by using forged invoices and CEO-level spoofing, which even experts missed.',
            'Always verify payment requests through official channels and cross-check email domains with known vendor contacts.'
          ] },
          { text: 'A Netflix email warns of a billing issue and asks you to update payment details via a link. Is this safe?', emailContent: { from: 'support@netf1ix.com', subject: 'Billing Issue: Update Payment Details by May 20, 2025', body: 'Dear Subscriber,<br><br>We encountered a billing issue with your account. Update your payment details here to continue enjoying Netflix:<br><br><a href="#">https://netf1ix.com/bill</a><br><br>Please act by May 20, 2025.<br><br>Regards,<br>Netflix Support', maskedUrl: 'https://netflix-billing.support' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: [
            'The sender’s domain "netf1ix.com" uses a homoglyph: "1" mimics "l".',
            'The link’s displayed URL ("netf1ix.com/bill") doesn’t match the masked URL ("netflix-billing.support").',
            'Netflix’s official domain is "netflix.com"; never update payment details via email links.',
            'Verify billing issues directly on Netflix’s official site or app.'
          ] },
          { text: 'An Apple email claims your iCloud storage is full and provides a link to upgrade. Is this legitimate?', emailContent: { from: 'support@applè.com', subject: 'iCloud Storage Full - Upgrade Now by May 20, 2025', body: 'Dear User,<br><br>Your iCloud storage is full. Upgrade your plan to avoid losing data:<br><br><a href="#">https://applè.com/icloud-upgrade</a><br><br>Please act by May 20, 2025.<br><br>Best,<br>Apple Support', maskedUrl: 'https://icloud-upgrade-fake.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: [
            'The sender’s domain "applè.com" uses a homoglyph: "è" mimics "e".',
            'It contains a zero-width joiner (U+200D), invisible but detectable in the domain.',
            'The link’s displayed URL ("applè.com/icloud-upgrade") differs from the masked URL ("icloud-upgrade-fake.com").',
            'Apple’s official domain is "apple.com"; manage iCloud directly on their site.',
            'Requires meticulous header analysis to detect hidden characters and spoofed domains.'
          ] },
          { text: 'An HSBC email requests you to confirm a recent transaction due to potential fraud. Is this safe?', emailContent: { from: 'security@hsbc-sec.com', subject: 'Confirm Transaction - Potential Fraud Alert by May 20, 2025', body: 'Dear Customer,<br><br>We detected a potentially fraudulent transaction. Confirm it here to secure your account:<br><br><a href="#">https://hsbc-sec.com/confirm</a><br><br>Please act by May 20, 2025.<br><br>Regards,<br>HSBC Security', maskedUrl: 'https://hsbc-fraud.net' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Difficult', explanation: [
            'The sender’s domain "hsbc-sec.com" is not HSBC’s official domain, which is "hsbc.com".',
            'The link’s displayed URL ("hsbc-sec.com/confirm") doesn’t match the masked URL ("hsbc-fraud.net").',
            'HSBC does not send links for transaction verification; always log in via hsbc.com.',
            'Contact HSBC directly using official channels to confirm any fraud alerts.'
          ] },
          { text: 'A LinkedIn email says your profile needs verification due to a policy update with a link. Is this legitimate?', emailContent: { from: 'support@linkedìn.com', subject: 'Profile Verification Required - Policy Update by May 20, 2025', body: 'Dear Member,<br><br>Due to a recent policy update, please verify your profile to continue using LinkedIn:<br><br><a href="#">https://linkedìn.com/verify</a><br><br>Act by May 20, 2025.<br><br>Thank you,<br>LinkedIn Team', maskedUrl: 'https://linkedin-verify-fake.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: [
            'The sender’s domain "linkedìn.com" uses a homoglyph: "ì" mimics "i".',
            'The domain includes a multi-stage redirect, detectable only through DNS inspection.',
            'The link’s displayed URL ("linkedìn.com/verify") differs from the masked URL ("linkedin-verify-fake.com").',
            'LinkedIn’s official domain is "linkedin.com"; verify profiles directly on their site.',
            'Requires deep DNS inspection to uncover the redirect chain and confirm the domain’s legitimacy.'
          ] },
          { text: 'An eBay email says you’ve won an auction and need to confirm payment details via a link. Is this safe?', emailContent: { from: 'support@ebày.com', subject: 'Auction Won - Confirm Payment by May 20, 2025', body: 'Dear Bidder,<br><br>Congratulations on winning auction #12345! Confirm your payment details here:<br><br><a href="#">https://ebày.com/payment</a><br><br>Please act by May 20, 2025.<br><br>Best,<br>eBay Team', maskedUrl: 'https://ebay-payment-fake.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: [
            'The sender’s domain "ebày.com" uses a homoglyph: "à" mimics "a".',
            'The link’s displayed URL ("ebày.com/payment") doesn’t match the masked URL ("ebay-payment-fake.com").',
            'eBay’s official domain is "ebay.com"; confirm auction wins directly on their site.',
            'Check the email header for domain authenticity and report suspicious emails to eBay.'
          ] },
          { text: 'A Zoom email invites you to a meeting to discuss account security with a link to join. Is this legitimate?', emailContent: { from: 'support@zo0m.us', subject: 'Urgent: Join Security Meeting by May 20, 2025', body: 'Dear User,<br><br>We need to discuss your account security. Join the meeting here:<br><br><a href="#">https://zo0m.us/join/123456</a><br><br>Please attend by May 20, 2025.<br><br>Regards,<br>Zoom Support', maskedUrl: 'https://zoom-fake-meeting.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: [
            'The sender’s domain "zo0m.us" uses a homoglyph: "0" mimics "o".',
            'The link’s displayed URL ("zo0m.us/join/123456") differs from the masked URL ("zoom-fake-meeting.com").',
            'Zoom’s official domain is "zoom.us"; join meetings directly through their app or site.',
            'Verify meeting invites by checking Zoom’s official scheduling system.'
          ] },
          { text: 'A PayPal email (impersonated in 51.7% of phishing attacks) asks you to confirm a recent payment. Is this safe?', emailContent: { from: 'support@paypa1.com', subject: 'Confirm Payment #PAY123 - Action Needed by May 20, 2025', body: 'Dear User,<br><br>We need you to confirm a recent payment #PAY123. Click here to verify:<br><br><a href="#">https://paypa1.com/confirm</a><br><br>Please act by May 20, 2025.<br><br>Thank you,<br>PayPal Team', maskedUrl: 'https://paypal-fake-confirm.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Difficult', explanation: [
            'The sender’s domain "paypa1.com" uses a homoglyph: "1" mimics "l".',
            'The link’s displayed URL ("paypa1.com/confirm") doesn’t match the masked URL ("paypal-fake-confirm.com").',
            'PayPal is a top impersonated brand (51.7% of phishing attacks); their official domain is "paypal.com".',
            'Never confirm payments via email links; log in directly to paypal.com to verify.'
          ] },
          { text: 'An Adobe email says your subscription has been charged and offers a refund link if unauthorized. Is this legitimate?', emailContent: { from: 'billing@ad0be.com', subject: 'Subscription Charged - Refund Option by May 20, 2025', body: 'Dear Customer,<br><br>Your Adobe subscription has been charged $99. If unauthorized, request a refund here:<br><br><a href="#">https://ad0be.com/refund</a><br><br>Act by May 20, 2025.<br><br>Regards,<br>Adobe Billing', maskedUrl: 'https://adobe-fake-refund.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: [
            'The sender’s domain "ad0be.com" uses a homoglyph: "0" mimics "o".',
            'The link’s displayed URL ("ad0be.com/refund") differs from the masked URL ("adobe-fake-refund.com").',
            'Adobe’s official domain is "adobe.com"; manage subscriptions directly on their site.',
            'Verify charges by logging into your Adobe account, not through email links.'
          ] },
          { text: 'A Shopee email claims you’ve won a P10,000 voucher and provides a link to claim it. Is this legitimate?', emailContent: { from: 'promo@sh0pee.com', subject: 'Congratulations! Claim Your P10,000 Shopee Voucher by May 20, 2025', body: 'Dear Shopper,<br><br>You’ve won a P10,000 voucher from Shopee! Claim it now:<br><br><a href="#">https://sh0pee.com/claim-voucher</a><br><br>Offer expires May 20, 2025.<br><br>Best,<br>Shopee Team', maskedUrl: 'https://shopee-voucher-fake.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Difficult', explanation: [
            'The sender’s domain "sh0pee.com" uses a homoglyph: "0" mimics "o".',
            'The link’s displayed URL ("sh0pee.com/claim-voucher") doesn’t match the masked URL ("shopee-voucher-fake.com").',
            'Shopee’s official domain is "shopee.ph"; claim vouchers directly on their site.',
            'Contact Shopee support through official channels to verify promotional offers.'
          ] },
          { text: 'A Lazada email says your order delivery failed and asks you to update your address via a link. Is this safe?', emailContent: { from: 'support@lazàda.com', subject: 'Delivery Failed: Update Address by May 20, 2025', body: 'Dear Customer,<br><br>Your recent Lazada order delivery failed. Update your address here:<br><br><a href="#">https://lazàda.com/update-address</a><br><br>Please act by May 20, 2025.<br><br>Thank you,<br>Lazada Support', maskedUrl: 'https://lazada-fake-delivery.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: [
            'The sender’s domain "lazàda.com" uses a homoglyph: "à" mimics "a".',
            'The link’s displayed URL ("lazàda.com/update-address") differs from the masked URL ("lazada-fake-delivery.com").',
            'Lazada’s official domain is "lazada.com.ph"; update addresses directly on their site.',
            'Verify delivery issues through Lazada’s official app or website.'
          ] },
          { text: 'A TikTok email warns of a copyright strike on your account with a link to appeal. Is this legitimate?', emailContent: { from: 'support@tìktok.com', subject: 'Urgent: Copyright Strike on Your TikTok Account - Appeal by May 20, 2025', body: 'Dear Creator,<br><br>Your TikTok account has received a copyright strike. Appeal here to avoid suspension:<br><br><a href="#">https://tìktok.com/appeal</a><br><br>Act by May 20, 2025.<br><br>Regards,<br>TikTok Team', maskedUrl: 'https://tiktok-fake-appeal.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: [
            'The sender’s domain "tìktok.com" uses a homoglyph: "ì" mimics "i".',
            'It includes a zero-width non-joiner (U+200C), invisible but detectable in the domain.',
            'The link’s displayed URL ("tìktok.com/appeal") differs from the masked URL ("tiktok-fake-appeal.com").',
            'TikTok’s official domain is "tiktok.com"; manage appeals directly on their platform.',
            'Requires meticulous header checks to detect hidden characters and spoofed domains.'
          ] },
          { text: 'A GCash email claims you’ve won a P5,000 voucher and asks you to claim it via a link. Is this safe?', emailContent: { from: 'promo@gcàsh.com', subject: 'You’ve Won a P5,000 GCash Voucher! Claim by May 20, 2025', body: 'Dear User,<br><br>Congratulations! You’ve won a P5,000 GCash voucher. Claim it here:<br><br><a href="#">https://gcàsh.com/claim</a><br><br>Offer expires May 20, 2025.<br><br>Best,<br>GCash Promotions', maskedUrl: 'https://gcash-voucher-fake.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Difficult', explanation: [
            'The sender’s domain "gcàsh.com" uses a homoglyph: "à" mimics "a".',
            'The link’s displayed URL ("gcàsh.com/claim") doesn’t match the masked URL ("gcash-voucher-fake.com").',
            'GCash’s official domain is "gcash.com"; claim vouchers directly on their app or site.',
            'Contact GCash support through official channels to verify promotional offers.'
          ] },
          { text: 'A Globe PH email offers a free data bundle if you verify your account via a link. Is this legitimate?', emailContent: { from: 'support@gl0be.com.ph', subject: 'Get Free 5GB Data! Verify Your Globe Account by May 20, 2025', body: 'Dear Subscriber,<br><br>Get a free 5GB data bundle! Verify your account here:<br><br><a href="#">https://gl0be.com.ph/verify</a><br><br>Act by May 20, 2025.<br><br>Cheers,<br>Globe Team', maskedUrl: 'https://globe-fake-verify.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: [
            'The sender’s domain "gl0be.com.ph" uses a homoglyph: "0" mimics "o".',
            'The link’s displayed URL ("gl0be.com.ph/verify") differs from the masked URL ("globe-fake-verify.com").',
            'Globe’s official domain is "globe.com.ph"; verify promotions directly on their site.',
            'Check Globe’s official app or website for legitimate offers.'
          ] },
          { text: 'A Smart PH email claims your bill is overdue with a payment link to avoid disconnection. Is this safe?', emailContent: { from: 'billing@smàrt.com.ph', subject: 'Overdue Bill: Pay Now to Avoid Disconnection by May 20, 2025', body: 'Dear Subscriber,<br><br>Your Smart bill is overdue. Pay now to avoid disconnection:<br><br><a href="#">https://smàrt.com.ph/pay</a><br><br>Act by May 20, 2025.<br><br>Regards,<br>Smart Billing', maskedUrl: 'https://smart-fake-bill.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: [
            'The sender’s domain "smàrt.com.ph" uses a homoglyph: "à" mimics "a".',
            'The link’s displayed URL ("smàrt.com.ph/pay") doesn’t match the masked URL ("smart-fake-bill.com").',
            'Smart’s official domain is "smart.com.ph"; pay bills directly on their site.',
            'Verify billing issues through Smart’s official app or customer service.'
          ] },
          { text: 'A Shopee email says your account was flagged for suspicious activity and asks you to verify your identity. Is this legitimate?', emailContent: { from: 'security@sh0pee.com', subject: 'Account Flagged: Verify Identity by May 20, 2025', body: 'Dear User,<br><br>Your Shopee account was flagged for suspicious activity. Verify your identity here:<br><br><a href="#">https://sh0pee.com/verify</a><br><br>Act by May 20, 2025.<br><br>Regards,<br>Shopee Security', maskedUrl: 'https://shopee-fake-verify.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Difficult', explanation: [
            'The sender’s domain "sh0pee.com" uses a homoglyph: "0" mimics "o".',
            'The link’s displayed URL ("sh0pee.com/verify") doesn’t match the masked URL ("shopee-fake-verify.com").',
            'Shopee’s official domain is "shopee.ph"; verify accounts directly on their site.',
            'Contact Shopee support through official channels to confirm account issues.'
          ] },
          { text: 'A Lazada email offers a 50% off voucher for your next purchase if you click a link to claim it. Is this safe?', emailContent: { from: 'promo@lazàda.com', subject: 'Get 50% Off Your Next Lazada Purchase! Claim by May 20, 2025', body: 'Dear Shopper,<br><br>Enjoy 50% off your next purchase! Claim your voucher here:<br><br><a href="#">https://lazàda.com/claim-voucher</a><br><br>Offer expires May 20, 2025.<br><br>Happy Shopping,<br>Lazada Team', maskedUrl: 'https://lazada-voucher-fake.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Difficult', explanation: [
            'The sender’s domain "lazàda.com" uses a homoglyph: "à" mimics "a".',
            'The link’s displayed URL ("lazàda.com/claim-voucher") doesn’t match the masked URL ("lazada-voucher-fake.com").',
            'Lazada’s official domain is "lazada.com.ph"; claim vouchers directly on their site.',
            'Verify promotional offers through Lazada’s official app or website.'
          ] },
          { text: 'A TikTok email claims you’ve been selected for a creator fund and provides a link to apply. Is this legitimate?', emailContent: { from: 'creator@tìktok.com', subject: 'Join the TikTok Creator Fund! Apply by May 20, 2025', body: 'Dear Creator,<br><br>You’ve been selected for the TikTok Creator Fund. Apply here:<br><br><a href="#">https://tìktok.com/apply-fund</a><br><br>Act by May 20, 2025.<br><br>Best,<br>TikTok Creator Team', maskedUrl: 'https://tiktok-fake-fund.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: [
            'The sender’s domain "tìktok.com" uses a homoglyph: "ì" mimics "i".',
            'The domain employs multi-stage obfuscation, detectable only through DNS tracing.',
            'The link’s displayed URL ("tìktok.com/apply-fund") differs from the masked URL ("tiktok-fake-fund.com").',
            'TikTok’s official domain is "tiktok.com"; apply for funds directly on their platform.',
            'Requires expert DNS tracing to uncover the obfuscation and confirm the domain’s legitimacy.'
          ] },
          { text: 'A Shopee email claims you’ve won a free iPhone from a raffle and asks you to claim it via a link. Is this safe?', emailContent: { from: 'promo@sh0pee.com', subject: 'You’ve Won an iPhone from Shopee! Claim by May 20, 2025', body: 'Dear Winner,<br><br>Congratulations! You’ve won an iPhone from our Shopee raffle. Claim it here:<br><br><a href="#">https://sh0pee.com/claim-iphone</a><br><br>Act by May 20, 2025.<br><br>Best,<br>Shopee Team', maskedUrl: 'https://shopee-iphone-fake.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Difficult', explanation: [
            'The sender’s domain "sh0pee.com" uses a homoglyph: "0" mimics "o".',
            'The link’s displayed URL ("sh0pee.com/claim-iphone") doesn’t match the masked URL ("shopee-iphone-fake.com").',
            'Shopee’s official domain is "shopee.ph"; claim prizes directly on their site.',
            'Verify raffle wins through Shopee’s official app or customer support.'
          ] },
          { text: 'A Lazada email says you’ve been charged for a subscription you didn’t sign up for with a refund link. Is this legitimate?', emailContent: { from: 'billing@lazàda.com', subject: 'Subscription Charged: Request Refund by May 20, 2025', body: 'Dear Customer,<br><br>You’ve been charged P999 for a Lazada subscription. Request a refund here if unauthorized:<br><br><a href="#">https://lazàda.com/refund</a><br><br>Act by May 20, 2025.<br><br>Regards,<br>Lazada Billing', maskedUrl: 'https://lazada-fake-refund.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: [
            'The sender’s domain "lazàda.com" uses a homoglyph: "à" mimics "a".',
            'The link’s displayed URL ("lazàda.com/refund") differs from the masked URL ("lazada-fake-refund.com").',
            'Lazada’s official domain is "lazada.com.ph"; manage subscriptions directly on their site.',
            'Verify charges through Lazada’s official app or customer support.'
          ] },
          { text: 'A Philippine charity email claims you’ve won a P20,000 donation voucher with a claim link. Is this safe?', emailContent: { from: 'donate@charìty-ph.com', subject: 'You’ve Won a P20,000 Donation Voucher! Claim by May 20, 2025', body: 'Dear Donor,<br><br>You’ve won a P20,000 donation voucher! Claim it here:<br><br><a href="#">https://charìty-ph.com/claim</a><br><br>Act by May 20, 2025.<br><br>Thank you,<br>Charity PH Team', maskedUrl: 'https://charity-fake-voucher.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Difficult', explanation: [
            'The sender’s domain "charìty-ph.com" uses a homoglyph: "ì" mimics "i".',
            'The link’s displayed URL ("charìty-ph.com/claim") doesn’t match the masked URL ("charity-fake-voucher.com").',
            'Legitimate charities do not send unsolicited voucher emails with links.',
            'Verify the charity’s legitimacy by contacting them directly through official channels.'
          ] },
          { text: 'A PLDT email says your internet bill is overdue with a payment link to avoid disconnection. Is this legitimate?', emailContent: { from: 'billing@pldt-h0me.com', subject: 'Overdue Internet Bill: Pay Now by May 20, 2025', body: 'Dear Subscriber,<br><br>Your PLDT bill is overdue. Pay now to avoid disconnection:<br><br><a href="#">https://pldt-h0me.com/pay</a><br><br>Act by May 20, 2025.<br><br>Regards,<br>PLDT Billing', maskedUrl: 'https://pldt-fake-bill.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: [
            'The sender’s domain "pldt-h0me.com" uses a homoglyph: "0" mimics "o".',
            'The link’s displayed URL ("pldt-h0me.com/pay") differs from the masked URL ("pldt-fake-bill.com").',
            'PLDT’s official domain is "pldt.com"; pay bills directly on their site.',
            'Verify billing issues through PLDT’s official app or customer service.'
          ] },
          { text: 'A Cebu Pacific email offers a free flight voucher if you verify your account via a link. Is this safe?', emailContent: { from: 'promo@cebu-pacìfic.com', subject: 'Get a Free Flight Voucher! Verify by May 20, 2025', body: 'Dear Traveler,<br><br>Get a free flight voucher! Verify your Cebu Pacific account here:<br><br><a href="#">https://cebu-pacìfic.com/verify</a><br><br>Act by May 20, 2025.<br><br>Happy Travels,<br>Cebu Pacific Team', maskedUrl: 'https://cebu-fake-voucher.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: [
            'The sender’s domain "cebu-pacìfic.com" uses a homoglyph: "ì" mimics "i".',
            'The link’s displayed URL ("cebu-pacìfic.com/verify") differs from the masked URL ("cebu-fake-voucher.com").',
            'Cebu Pacific’s official domain is "cebupacificair.com"; verify offers directly on their site.',
            'Check Cebu Pacific’s official promotions page for legitimate offers.'
          ] },
          { text: 'A Philippine online casino email claims you’ve won P50,000 with a claim link. Is this legitimate?', emailContent: { from: 'win@casìno-ph.com', subject: 'You’ve Won P50,000! Claim by May 20, 2025', body: 'Dear Player,<br><br>Congratulations! You’ve won P50,000 from our casino. Claim your prize here:<br><br><a href="#">https://casìno-ph.com/claim</a><br><br>Act by May 20, 2025.<br><br>Good Luck,<br>Casino PH Team', maskedUrl: 'https://casino-fake-win.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Difficult', explanation: [
            'The sender’s domain "casìno-ph.com" uses a homoglyph: "ì" mimics "i".',
            'The link’s displayed URL ("casìno-ph.com/claim") doesn’t match the masked URL ("casino-fake-win.com").',
            'Legitimate casinos do not send unsolicited win notifications with links.',
            'Verify the casino’s legitimacy by contacting them through official channels.'
          ] },
          { text: 'An email from your CFO (spoofed) requests an urgent wire transfer for a confidential deal. Is this safe?', emailContent: { from: 'cfo@company.com', subject: 'Confidential: Urgent Wire Transfer Required by May 20, 2025', body: 'Dear Team,<br><br>Please process a wire transfer of P1M for a confidential deal. Invoice attached. Use this link to confirm details:<br><br><a href="#">https://company-finance.com/transfer</a><br><br>Act by May 20, 2025.<br><br>Regards,<br>[CFO Name]', maskedUrl: 'https://fake-finance-transfer.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: [
            'The sender’s email appears to be "cfo@company.com", but it’s spoofed with a zero-width character (U+200B) in the metadata.',
            'The link’s displayed URL ("company-finance.com/transfer") masks the real URL ("fake-finance-transfer.com").',
            'The email includes a forged invoice, a common tactic in Business Email Compromise (BEC) attacks.',
            'Even cybersecurity experts have fallen for similar attacks due to the convincing impersonation of a CFO.',
            'Always verify wire transfer requests through a separate, trusted communication channel (e.g., phone call to the CFO).'
          ] },
          { text: 'An AWS email claims your account is compromised and provides a link to secure it, signed by a senior engineer. Is this legitimate?', emailContent: { from: 'security@aws.amazon.c0m', subject: 'Critical: Secure Your AWS Account by May 20, 2025', body: 'Dear Customer,<br><br>Your AWS account shows unauthorized access. Secure it here, signed by Engineer John Doe:<br><br><a href="#">https://aws.amazon.c0m/security</a><br><br>Act by May 20, 2025.<br><br>Best,<br>AWS Security Team', maskedUrl: 'https://aws-fake-security.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: [
            'The sender’s domain "aws.amazon.c0m" uses a homoglyph: "0" mimics "o".',
            'The link uses a multi-stage redirect, masking the real URL ("aws-fake-security.com").',
            'The email includes a forged signature ("Engineer John Doe"), adding false legitimacy.',
            'AWS’s official domain is "aws.amazon.com"; secure accounts directly on their site.',
            'Requires expert header analysis to detect the homoglyph and redirect chain.'
          ] },
          { text: 'A vendor email (spoofed) requests updated payment details for an overdue invoice. Is this safe?', emailContent: { from: 'accounts@vendor.com', subject: 'Overdue Invoice #INV-2025 - Update Payment by May 20, 2025', body: 'Dear Finance,<br><br>Invoice #INV-2025 is overdue. Update payment details here:<br><br><a href="#">https://vendor.com/update-payment</a><br><br>Act by May 20, 2025.<br><br>Regards,<br>Vendor Accounts', maskedUrl: 'https://vendor-fake-payment.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: [
            'The sender’s email "accounts@vendor.com" is spoofed with a zero-width joiner (U+200D) in the metadata.',
            'The link’s displayed URL ("vendor.com/update-payment") masks the real URL ("vendor-fake-payment.com").',
            'This is a Business Email Compromise (BEC) attack, often missed by experts due to the trusted vendor impersonation.',
            'Always verify payment requests through a separate, trusted communication channel.',
            'Check the email header for SPF/DKIM alignment to confirm the sender’s legitimacy.'
          ] },
          { text: 'A GitHub email claims your repository was flagged for a security issue with a link to review. Is this legitimate?', emailContent: { from: 'security@gìthub.com', subject: 'Security Alert: Review Your GitHub Repository by May 20, 2025', body: 'Dear Developer,<br><br>Your repository has a security issue. Review it here:<br><br><a href="#">https://gìthub.com/security-review</a><br><br>Act by May 20, 2025.<br><br>Best,<br>GitHub Security', maskedUrl: 'https://github-fake-review.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: [
            'The sender’s domain "gìthub.com" uses a homoglyph: "ì" mimics "i".',
            'The link employs multi-vector obfuscation, masking the real URL ("github-fake-review.com").',
            'GitHub’s official domain is "github.com"; review security issues directly on their platform.',
            'Requires meticulous DNS lookup to detect the obfuscation and confirm the domain’s legitimacy.',
            'Check GitHub’s official notifications or email settings for legitimate alerts.'
          ] },
          { text: 'An email from your CEO (spoofed) requests sensitive HR data for an audit, with a follow-up call scheduled. Is this safe?', emailContent: { from: 'ceo@company.com', subject: 'Urgent: HR Data Audit by May 20, 2025', body: 'Dear HR,<br><br>Please send employee payroll data for an urgent audit. Use this link to upload:<br><br><a href="#">https://company-hr.com/upload</a><br><br>Call scheduled for May 20, 2025. Act now.<br><br>Regards,<br>[CEO Name]', maskedUrl: 'https://fake-hr-upload.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: [
            'The sender’s email "ceo@company.com" is spoofed with a multi-stage deception.',
            'The email includes a scheduled follow-up call, a tactic used in whaling attacks to build trust.',
            'The link’s displayed URL ("company-hr.com/upload") masks the real URL ("fake-hr-upload.com").',
            'Experts have fallen for similar whaling attacks due to the convincing CEO impersonation.',
            'Always verify sensitive data requests through a separate, trusted communication channel (e.g., direct call to the CEO).'
          ] },
          { text: 'An Oracle email claims your cloud account has a critical vulnerability with a patch link. Is this legitimate?', emailContent: { from: 'support@orac1e.com', subject: 'Critical Vulnerability in Your Oracle Cloud - Patch by May 20, 2025', body: 'Dear Customer,<br><br>Your Oracle Cloud account has a critical vulnerability. Patch it here:<br><br><a href="#">https://orac1e.com/patch</a><br><br>Act by May 20, 2025.<br><br>Regards,<br>Oracle Support', maskedUrl: 'https://oracle-fake-patch.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: [
            'The sender’s domain "orac1e.com" uses a homoglyph: "1" mimics "l".',
            'The domain includes a zero-width non-joiner (U+200C), invisible but detectable.',
            'The link’s displayed URL ("orac1e.com/patch") differs from the masked URL ("oracle-fake-patch.com").',
            'Oracle’s official domain is "oracle.com"; apply patches directly on their site.',
            'Requires expert scrutiny of the email header to detect hidden characters and spoofed domains.'
          ] },
          { text: 'A Dropbox email claims your account storage is full and provides a link to upgrade. Is this legitimate?', emailContent: { from: 'support@dr0pbox.com', subject: 'Storage Full: Upgrade Your Dropbox Plan by May 20, 2025', body: 'Dear User,<br><br>Your Dropbox storage is full. Upgrade your plan here:<br><br><a href="#">https://dr0pbox.com/upgrade</a><br><br>Act by May 20, 2025.<br><br>Regards,<br>Dropbox Team', maskedUrl: 'https://dropbox-fake-upgrade.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: [
            'The sender’s domain "dr0pbox.com" uses a homoglyph: "0" mimics "o".',
            'The link’s displayed URL ("dr0pbox.com/upgrade") differs from the masked URL ("dropbox-fake-upgrade.com").',
            'Dropbox’s official domain is "dropbox.com"; upgrade plans directly on their site.',
            'Verify storage issues through Dropbox’s official app or website.'
          ] },
          { text: 'A Microsoft Teams email invites you to a meeting with a link, claiming it’s from your manager. Is this safe?', emailContent: { from: 'manager@micros0ft.com', subject: 'Urgent: Join Teams Meeting with [Manager Name] by May 20, 2025', body: 'Dear Team,<br><br>Please join an urgent meeting with [Manager Name] here:<br><br><a href="#">https://micros0ft.com/meeting</a><br><br>Scheduled for May 20, 2025.<br><br>Regards,<br>[Manager Name]', maskedUrl: 'https://teams-fake-meeting.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: [
            'The sender’s domain "micros0ft.com" uses a homoglyph: "0" mimics "o".',
            'The link’s displayed URL ("micros0ft.com/meeting") masks the real URL ("teams-fake-meeting.com").',
            'The email impersonates a manager, a common whaling tactic to exploit trust.',
            'Microsoft Teams’ official domain is "teams.microsoft.com"; join meetings through the app.',
            'Verify meeting invites directly with your manager via a trusted communication channel.'
          ] },
          { text: 'A Salesforce email claims your account has a security issue and provides a link to fix it. Is this legitimate?', emailContent: { from: 'security@salesf0rce.com', subject: 'Security Issue: Fix Your Salesforce Account by May 20, 2025', body: 'Dear User,<br><br>Your Salesforce account has a security issue. Fix it here:<br><br><a href="#">https://salesf0rce.com/fix</a><br><br>Act by May 20, 2025.<br><br>Regards,<br>Salesforce Security', maskedUrl: 'https://salesforce-fake-fix.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: [
            'The sender’s domain "salesf0rce.com" uses a homoglyph: "0" mimics "o".',
            'The link’s displayed URL ("salesf0rce.com/fix") differs from the masked URL ("salesforce-fake-fix.com").',
            'Salesforce’s official domain is "salesforce.com"; address security issues directly on their site.',
            'Verify account issues through Salesforce’s official portal or support.'
          ] },
          { text: 'A Slack email claims a new user joined your workspace and asks you to verify their identity via a link. Is this safe?', emailContent: { from: 'support@s1ack.com', subject: 'New User Joined Your Slack Workspace - Verify by May 20, 2025', body: 'Dear Admin,<br><br>A new user joined your Slack workspace. Verify their identity here:<br><br><a href="#">https://s1ack.com/verify-user</a><br><br>Act by May 20, 2025.<br><br>Regards,<br>Slack Team', maskedUrl: 'https://slack-fake-verify.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: [
            'The sender’s domain "s1ack.com" uses a homoglyph: "1" mimics "l".',
            'The link’s displayed URL ("s1ack.com/verify-user") differs from the masked URL ("slack-fake-verify.com").',
            'Slack’s official domain is "slack.com"; manage users directly on their platform.',
            'Verify new users through Slack’s official admin dashboard.'
          ] },
          { text: 'A DocuSign email claims you have a document to sign with a link to access it. Is this legitimate?', emailContent: { from: 'sign@d0cusign.com', subject: 'Action Required: Sign Document by May 20, 2025', body: 'Dear User,<br><br>You have a document waiting for your signature. Access it here:<br><br><a href="#">https://d0cusign.com/sign</a><br><br>Act by May 20, 2025.<br><br>Regards,<br>DocuSign Team', maskedUrl: 'https://docusign-fake-sign.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: [
            'The sender’s domain "d0cusign.com" uses a homoglyph: "0" mimics "o".',
            'The link’s displayed URL ("d0cusign.com/sign") differs from the masked URL ("docusign-fake-sign.com").',
            'DocuSign’s official domain is "docusign.com"; access documents directly on their site.',
            'Verify document requests through DocuSign’s official platform or email notifications.'
          ] },
          { text: 'A Payoneer email claims your account balance is at risk and provides a link to secure it. Is this safe?', emailContent: { from: 'support@pay0neer.com', subject: 'Urgent: Secure Your Payoneer Balance by May 20, 2025', body: 'Dear User,<br><br>Your Payoneer balance is at risk due to suspicious activity. Secure it here:<br><br><a href="#">https://pay0neer.com/secure</a><br><br>Act by May 20, 2025.<br><br>Regards,<br>Payoneer Security', maskedUrl: 'https://payoneer-fake-secure.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: [
            'The sender’s domain "pay0neer.com" uses a homoglyph: "0" mimics "o".',
            'The link’s displayed URL ("pay0neer.com/secure") differs from the masked URL ("payoneer-fake-secure.com").',
            'Payoneer’s official domain is "payoneer.com"; secure accounts directly on their site.',
            'Verify account issues through Payoneer’s official portal or support.'
          ] },
          { text: 'A Stripe email claims a payment failed and provides a link to retry. Is this legitimate?', emailContent: { from: 'billing@strìpe.com', subject: 'Payment Failed: Retry by May 20, 2025', body: 'Dear Customer,<br><br>A recent payment failed. Retry here to avoid service interruption:<br><br><a href="#">https://strìpe.com/retry</a><br><br>Act by May 20, 2025.<br><br>Regards,<br>Stripe Billing', maskedUrl: 'https://stripe-fake-retry.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: [
            'The sender’s domain "strìpe.com" uses a homoglyph: "ì" mimics "i".',
            'The domain includes a zero-width space (U+200B), invisible but detectable.',
            'The link’s displayed URL ("strìpe.com/retry") differs from the masked URL ("stripe-fake-retry.com").',
            'Stripe’s official domain is "stripe.com"; manage payments directly on their site.',
            'Requires deep header analysis to detect hidden characters and spoofed domains.'
          ] },
          { text: 'A Trello email claims a new board was shared with you and provides a link to access it. Is this safe?', emailContent: { from: 'support@tre1lo.com', subject: 'New Trello Board Shared - Access by May 20, 2025', body: 'Dear User,<br><br>A new Trello board has been shared with you. Access it here:<br><br><a href="#">https://tre1lo.com/board</a><br><br>Act by May 20, 2025.<br><br>Regards,<br>Trello Team', maskedUrl: 'https://trello-fake-board.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: [
            'The sender’s domain "tre1lo.com" uses a homoglyph: "1" mimics "l".',
            'The link’s displayed URL ("tre1lo.com/board") differs from the masked URL ("trello-fake-board.com").',
            'Trello’s official domain is "trello.com"; access boards directly on their site.',
            'Verify board invites through Trello’s official app or email notifications.'
          ] },
          { text: 'A QuickBooks email claims your invoice is overdue and provides a payment link. Is this legitimate?', emailContent: { from: 'billing@quickb00ks.com', subject: 'Overdue Invoice: Pay Now by May 20, 2025', body: 'Dear Customer,<br><br>Your QuickBooks invoice is overdue. Pay now to avoid penalties:<br><br><a href="#">https://quickb00ks.com/pay</a><br><br>Act by May 20, 2025.<br><br>Regards,<br>QuickBooks Billing', maskedUrl: 'https://quickbooks-fake-pay.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: [
            'The sender’s domain "quickb00ks.com" uses a homoglyph: "0" mimics "o".',
            'The link’s displayed URL ("quickb00ks.com/pay") differs from the masked URL ("quickbooks-fake-pay.com").',
            'QuickBooks’ official domain is "quickbooks.intuit.com"; pay invoices directly on their site.',
            'Verify invoices through QuickBooks’ official portal or support.'
          ] },
          { text: 'A Zendesk email claims a new support ticket was opened and provides a link to view it. Is this safe?', emailContent: { from: 'support@zendesḱ.com', subject: 'New Support Ticket #12345 - View by May 20, 2025', body: 'Dear User,<br><br>A new support ticket #12345 has been opened. View it here:<br><br><a href="#">https://zendesḱ.com/ticket</a><br><br>Act by May 20, 2025.<br><br>Regards,<br>Zendesk Support', maskedUrl: 'https://zendesk-fake-ticket.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: [
            'The sender’s domain "zendesḱ.com" uses a homoglyph: "ḱ" mimics "k".',
            'The domain includes a zero-width joiner (U+200D), invisible but detectable.',
            'The link’s displayed URL ("zendesḱ.com/ticket") differs from the masked URL ("zendesk-fake-ticket.com").',
            'Zendesk’s official domain is "zendesk.com"; view tickets directly on their site.',
            'Requires meticulous header analysis to detect hidden characters and spoofed domains.'
          ] },
          { text: 'A Shopify email claims your store has a payment issue and provides a link to resolve it. Is this legitimate?', emailContent: { from: 'billing@sh0pify.com', subject: 'Payment Issue: Resolve for Your Shopify Store by May 20, 2025', body: 'Dear Merchant,<br><br>Your Shopify store has a payment issue. Resolve it here:<br><br><a href="#">https://sh0pify.com/resolve</a><br><br>Act by May 20, 2025.<br><br>Regards,<br>Shopify Billing', maskedUrl: 'https://shopify-fake-resolve.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: [
            'The sender’s domain "sh0pify.com" uses a homoglyph: "0" mimics "o".',
            'The link’s displayed URL ("sh0pify.com/resolve") differs from the masked URL ("shopify-fake-resolve.com").',
            'Shopify’s official domain is "shopify.com"; resolve payment issues directly on their site.',
            'Verify payment issues through Shopify’s official dashboard or support.'
          ] },
          { text: 'A Mailchimp email claims your campaign failed and provides a link to retry. Is this safe?', emailContent: { from: 'support@maìlchimp.com', subject: 'Campaign Failed: Retry by May 20, 2025', body: 'Dear User,<br><br>Your recent Mailchimp campaign failed. Retry here:<br><br><a href="#">https://maìlchimp.com/retry</a><br><br>Act by May 20, 2025.<br><br>Regards,<br>Mailchimp Support', maskedUrl: 'https://mailchimp-fake-retry.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: [
            'The sender’s domain "maìlchimp.com" uses a homoglyph: "ì" mimics "i".',
            'The domain includes a multi-stage redirect, detectable only through DNS inspection.',
            'The link’s displayed URL ("maìlchimp.com/retry") differs from the masked URL ("mailchimp-fake-retry.com").',
            'Mailchimp’s official domain is "mailchimp.com"; manage campaigns directly on their site.',
            'Requires deep DNS inspection to uncover the redirect chain and confirm the domain’s legitimacy.'
          ] },
          { text: 'A Twilio email claims your account has a billing issue and provides a link to update payment. Is this legitimate?', emailContent: { from: 'billing@twìlio.com', subject: 'Billing Issue: Update Payment for Twilio by May 20, 2025', body: 'Dear Customer,<br><br>Your Twilio account has a billing issue. Update payment here:<br><br><a href="#">https://twìlio.com/update</a><br><br>Act by May 20, 2025.<br><br>Regards,<br>Twilio Billing', maskedUrl: 'https://twilio-fake-update.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: [
            'The sender’s domain "twìlio.com" uses a homoglyph: "ì" mimics "i".',
            'The domain includes a zero-width non-joiner (U+200C), invisible but detectable.',
            'The link’s displayed URL ("twìlio.com/update") differs from the masked URL ("twilio-fake-update.com").',
            'Twilio’s official domain is "twilio.com"; update payments directly on their site.',
            'Requires meticulous header checks to detect hidden characters and spoofed domains.'
          ] },
          { text: 'A HubSpot email claims your account has a security alert and provides a link to secure it. Is this safe?', emailContent: { from: 'security@hùbspot.com', subject: 'Security Alert: Secure Your HubSpot Account by May 20, 2025', body: 'Dear User,<br><br>Your HubSpot account has a security alert. Secure it here:<br><br><a href="#">https://hùbspot.com/secure</a><br><br>Act by May 20, 2025.<br><br>Regards,<br>HubSpot Security', maskedUrl: 'https://hubspot-fake-secure.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: [
            'The sender’s domain "hùbspot.com" uses a homoglyph: "ù" mimics "u".',
            'The domain employs multi-stage obfuscation, detectable only through DNS tracing.',
            'The link’s displayed URL ("hùbspot.com/secure") differs from the masked URL ("hubspot-fake-secure.com").',
            'HubSpot’s official domain is "hubspot.com"; secure accounts directly on their site.',
            'Requires expert DNS tracing to uncover the obfuscation and confirm the domain’s legitimacy.'
          ] },
          { text: 'A Zoho email claims your account has a login issue and provides a link to fix it. Is this legitimate?', emailContent: { from: 'support@z0ho.com', subject: 'Login Issue: Fix Your Zoho Account by May 20, 2025', body: 'Dear User,<br><br>Your Zoho account has a login issue. Fix it here:<br><br><a href="#">https://z0ho.com/fix</a><br><br>Act by May 20, 2025.<br><br>Regards,<br>Zoho Support', maskedUrl: 'https://zoho-fake-fix.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical', explanation: [
            'The sender’s domain "z0ho.com" uses a homoglyph: "0" mimics "o".',
            'The link’s displayed URL ("z0ho.com/fix") differs from the masked URL ("zoho-fake-fix.com").',
            'Zoho’s official domain is "zoho.com"; fix login issues directly on their site.',
            'Verify account issues through Zoho’s official portal or support.'
          ] },

          // Smishing (10 questions, 20% of total)
          { text: 'An SMS from BDO Bank alerts you about a locked card with a link to unlock it. Is this safe?', smsContent: { from: '+639123456789', body: 'BDO Alert: Your card ending in 4567 is locked due to a suspicious transaction on May 19, 2025. Reply YES or visit https://bdo-on1ine.com/unlock to resolve.', maskedUrl: 'https://bdo-bank.online' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Medium', explanation: [
            'The sender’s number "+639123456789" is not an official BDO contact number.',
            'The URL "bdo-on1ine.com" uses a homoglyph: "1" mimics "l".',
            'The link’s displayed URL ("bdo-on1ine.com/unlock") masks the real URL ("bdo-bank.online").',
            'BDO’s official domain is "bdo.com.ph"; never respond to SMS links for account issues.',
            'Contact BDO directly using their official hotline to verify card status.'
          ] },
          { text: 'An SMS from GCash notifies you of a low balance with a link to top up. Is this legitimate?', smsContent: { from: 'GCash Support', body: 'GCash Alert: Your balance is low. Top up now to enjoy a 10% bonus! Visit https://gcash-support.net/topup by May 20, 2025.', maskedUrl: 'https://secure.gcash-login.net' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Medium', explanation: [
            'The sender "GCash Support" is not a verified GCash contact.',
            'The URL "gcash-support.net" is not GCash’s official domain, which is "gcash.com".',
            'The link masks the real URL ("secure.gcash-login.net").',
            'GCash does not send unsolicited SMS with links to top up; use their official app.',
            'Verify promotions through GCash’s official app or customer support.'
          ] },
          { text: 'An SMS from DHL informs you of a delayed package with a link to track it. Is this legitimate?', smsContent: { from: 'DHL Tracking', body: 'DHL Update: Your package 1Z9999W999999999 is delayed. Track status at https://dhl-tracking.org/status by May 20, 2025.', maskedUrl: 'https://dhl-delivery-service.com' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Medium', explanation: [
            'The sender "DHL Tracking" is not a verified DHL contact.',
            'The URL "dhl-tracking.org" is not DHL’s official domain, which is "dhl.com".',
            'The link masks the real URL ("dhl-delivery-service.com").',
            'DHL does not send unsolicited SMS with tracking links; track packages on dhl.com.',
            'Verify tracking numbers through DHL’s official website or customer service.'
          ] },
          { text: 'An SMS from Netflix alerts you to a billing issue with a link to update payment. Is this safe?', smsContent: { from: '+12025550123', body: 'Netflix Alert: Billing issue on account ending 1234. Update payment at https://netf1ix.com/bill by May 20, 2025.', maskedUrl: 'https://netflix-billing.support' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Medium', explanation: [
            'The sender’s number "+12025550123" is not an official Netflix contact.',
            'The URL "netf1ix.com" uses a homoglyph: "1" mimics "l".',
            'The link masks the real URL ("netflix-billing.support").',
            'Netflix’s official domain is "netflix.com"; update payments directly on their site.',
            'Check Netflix’s official app or website for billing issues.'
          ] },
          { text: 'An SMS from Globe PH offers a recharge link with a bonus for an expiring load. Is this legitimate?', smsContent: { from: 'Globe PH', body: 'Globe Alert: Your load expires today! Recharge at https://gl0be.com.ph/recharge for a 20% bonus by May 20, 2025.', maskedUrl: 'https://globe-mobile.topup' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing', difficulty: 'Medium', explanation: [
            'The sender "Globe PH" is not a verified Globe contact.',
            'The URL "gl0be.com.ph" uses a homoglyph: "0" mimics "o".',
            'The link masks the real URL ("globe-mobile.topup").',
            'Globe’s official domain is "globe.com.ph"; recharge directly on their site.',
            'Verify promotions through Globe’s official app or customer service.'
          ] },
          { text: 'An SMS from Amazon claims you’ve won a gift card with a link to claim it. Is this legitimate?', smsContent: { from: '+12025550124', body: 'Amazon Reward: You’ve won a $100 gift card! Claim it at https://amaz0n.com/claim by May 20, 2025.', maskedUrl: 'https://amazon-fake-claim.com' }, options: ['Legitimate', 'Smishing'], correctAnswer: 'Smishing
