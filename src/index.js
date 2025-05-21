<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Phishing Challenge Platform</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/react@18/umd/react.development.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body class="bg-gray-100 font-sans">
  <div id="app"></div>
  <script type="text/babel">
    const { useState, useEffect } = React;

    const App = () => {
      const [lang, setLang] = useState('en');
      const [currentView, setCurrentView] = useState('dashboard');
      const [currentChallenge, setCurrentChallenge] = useState(null);
      const [scores, setScores] = useState({});
      const [showFeedback, setShowFeedback] = useState(false);
      const [userAnswer, setUserAnswer] = useState('');
      const [challengeIndex, setChallengeIndex] = useState(0);

      const exercisesData = {
        phish: [
          // Email Phishing (32 questions, 80%, Highly Difficult to Highly Technical Extremely Difficult)
          { text: 'You received an email from what appears to be PayPal regarding an urgent account verification with your account details and a link to avoid suspension. Is this legitimate?', emailContent: { from: 'support@paypa1.com', subject: 'Urgent: Verify Your PayPal Account by May 21, 2025', body: 'Dear Valued User,<br>We detected unusual activity. Verify here: <a href="#">https://paypa1.com/verify</a><br>Act by May 21, 2025.<br>PayPal Security', maskedUrl: 'https://secure.paypal-login.net' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: ['Domain "paypa1.com" uses homoglyph "1" for "l".', 'Masked URL differs, indicating spoofing.', 'PayPal never requests verification via email links.', 'Requires header inspection for SPF/DKIM mismatches.'] },
          { text: 'An email from Amazon confirms an order with a tracking link and purchase details. Is it trustworthy?', emailContent: { from: 'no-reply@amazon-dea1s.com', subject: 'Order #XYZ123 Shipped on May 20, 2025', body: 'Hello [Your Name],<br>Track your package: <a href="#">https://amazon-dea1s.com/track</a><br>Amazon Support', maskedUrl: 'https://amazon.order-tracking.org' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: ['Domain "amazon-dea1s.com" uses homoglyph "1" for "l".', 'Masked URL mismatch signals phishing.', 'Verify orders on amazon.com directly.', 'Needs deep header analysis for domain spoofing.'] },
          { text: 'A Shopee email offers a P5000 prize with a personalized greeting and claim link. Is it safe?', emailContent: { from: 'promo@sh0pee.com', subject: 'Win P5000 - Claim by May 21, 2025', body: 'Dear [Your Name],<br>Claim your prize: <a href="#">https://sh0pee.com/claim</a><br>Expires May 21, 2025.<br>Shopee Team', maskedUrl: 'https://shopee-promotions.ph' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: ['Domain "sh0pee.com" uses homoglyph "0" for "o".', 'Masked URL hides real destination.', 'Shopee uses shopee.ph; avoid email links.', 'Requires meticulous header check for homoglyphs.'] },
          { text: 'An IRS email demands a tax payment with a deadline and payment link. What is it?', emailContent: { from: 'tax@irs.gov.ph', subject: 'Tax Payment Due by May 21, 2025', body: 'Dear Taxpayer,<br>Pay $2,000 here: <a href="#">https://irs-payment.gov.ph/pay</a><br>IRS Payment Dept', maskedUrl: 'https://secure-tax.us.gov' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Difficult', explanation: ['Domain "irs.gov.ph" is fake; IRS uses "irs.gov".', 'Masked URL mismatch indicates phishing.', 'IRS never sends payment links via email.', 'Verify through irs.gov directly.'] },
          { text: 'A Google email warns of a security alert with a verification link. Is it trustworthy?', emailContent: { from: 'support@gmaìl.com', subject: 'Security Alert - Verify by May 21, 2025', body: 'Dear User,<br>Verify here: <a href="#">https://gmaìl.com/security</a><br>Google Security', maskedUrl: 'https://accounts.google-login.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: ['Domain "gmaìl.com" uses homoglyph "ì" for "i".', 'Includes zero-width character (U+200B).', 'Masked URL differs, a phishing tactic.', 'Verify on accounts.google.com only.'] },
          { text: 'A BDO Unibank email claims your account is blocked with a verification link. Is this legitimate?', emailContent: { from: 'alert@bdo-unibank.com', subject: 'Account Blocked - Verify by May 21, 2025', body: 'Dear Client,<br>Verify here: <a href="#">https://bdo-unibank.com/verify</a><br>BDO Security', maskedUrl: 'https://bdo-security.net' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Difficult', explanation: ['Domain "bdo-unibank.com" is not "bdo.com.ph".', 'Masked URL mismatch signals phishing.', 'BDO doesn’t send verification links.', 'Contact BDO via official channels.'] },
          { text: 'A Facebook email alerts a new device login with a verification link. Is it safe?', emailContent: { from: 'security@faceb00k.com', subject: 'New Login Alert - Verify by May 21, 2025', body: 'Dear [Your Name],<br>Verify here: <a href="#">https://faceb00k.com/verify</a><br>Facebook Security', maskedUrl: 'https://fb-security-login.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: ['Domain "faceb00k.com" uses homoglyph "0" for "o".', 'Masked URL hides real destination.', 'Verify on facebook.com directly.', 'Requires header analysis for homoglyphs.'] },
          { text: 'A Microsoft email requests Office 365 renewal with a payment link. Is this legitimate?', emailContent: { from: 'billing@mìcrosoft.com', subject: 'Renew Office 365 by May 21, 2025', body: 'Dear User,<br>Renew here: <a href="#">https://mìcrosoft.com/renew</a><br>Microsoft Billing', maskedUrl: 'https://office365-renewal.net' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: ['Domain "mìcrosoft.com" uses homoglyph "ì" for "i".', 'Includes zero-width space (U+200B).', 'Masked URL differs, a phishing sign.', 'Renew on microsoft.com only.'] },
          { text: 'A 2013-2015 scam targeted Google/Facebook with fake invoices. What type?', emailContent: { from: 'billing@quanta-taiwan.com', subject: 'Invoice #INV-2025 Due by May 21, 2025', body: 'Dear Team,<br>Pay here: <a href="#">https://quanta-taiwan.com/pay</a><br>Quanta Billing', maskedUrl: 'https://quanta-fakebilling.com' }, options: ['Spear Phishing', 'Business Email Compromise', 'Smishing'], correctAnswer: 'Business Email Compromise', difficulty: 'Highly Technical Extremely Difficult', explanation: ['Impersonates a vendor with a fake domain.', 'Masked URL hides phishing site.', 'Defrauded $100M via CEO spoofing.', 'Requires trusted channel verification.'] },
          { text: 'A Netflix email warns of a billing issue with a payment update link. Is it safe?', emailContent: { from: 'support@netf1ix.com', subject: 'Billing Issue - Update by May 21, 2025', body: 'Dear Subscriber,<br>Update here: <a href="#">https://netf1ix.com/bill</a><br>Netflix Support', maskedUrl: 'https://netflix-billing.support' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: ['Domain "netf1ix.com" uses homoglyph "1" for "l".', 'Masked URL mismatch signals phishing.', 'Update on netflix.com directly.', 'Requires header inspection.'] },
          { text: 'An Apple email says iCloud is full with an upgrade link. Is this legitimate?', emailContent: { from: 'support@applè.com', subject: 'iCloud Full - Upgrade by May 21, 2025', body: 'Dear User,<br>Upgrade here: <a href="#">https://applè.com/upgrade</a><br>Apple Support', maskedUrl: 'https://icloud-upgrade-fake.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: ['Domain "applè.com" uses homoglyph "è" for "e".', 'Includes zero-width joiner (U+200D).', 'Masked URL differs, a phishing sign.', 'Manage on apple.com only.'] },
          { text: 'An HSBC email requests transaction confirmation with a link. Is it safe?', emailContent: { from: 'security@hsbc-sec.com', subject: 'Confirm Transaction by May 21, 2025', body: 'Dear Customer,<br>Confirm here: <a href="#">https://hsbc-sec.com/confirm</a><br>HSBC Security', maskedUrl: 'https://hsbc-fraud.net' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Difficult', explanation: ['Domain "hsbc-sec.com" is not "hsbc.com".', 'Masked URL mismatch indicates phishing.', 'HSBC doesn’t send confirmation links.', 'Verify via hsbc.com.'] },
          { text: 'A LinkedIn email requests profile verification with a link. Is it legitimate?', emailContent: { from: 'support@linkedìn.com', subject: 'Verify Profile by May 21, 2025', body: 'Dear Member,<br>Verify here: <a href="#">https://linkedìn.com/verify</a><br>LinkedIn Team', maskedUrl: 'https://linkedin-verify-fake.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: ['Domain "linkedìn.com" uses homoglyph "ì" for "i".', 'Includes multi-stage redirect.', 'Masked URL differs, a phishing sign.', 'Verify on linkedin.com only.'] },
          { text: 'An eBay email confirms an auction win with a payment link. Is it safe?', emailContent: { from: 'support@ebày.com', subject: 'Auction Won - Pay by May 21, 2025', body: 'Dear Bidder,<br>Pay here: <a href="#">https://ebày.com/payment</a><br>eBay Team', maskedUrl: 'https://ebay-payment-fake.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: ['Domain "ebày.com" uses homoglyph "à" for "a".', 'Masked URL hides real destination.', 'Pay on ebay.com directly.', 'Requires header check for homoglyphs.'] },
          { text: 'A Zoom email invites you to a security meeting with a join link. Is this legitimate?', emailContent: { from: 'support@zo0m.us', subject: 'Security Meeting - Join by May 21, 2025', body: 'Dear User,<br>Join here: <a href="#">https://zo0m.us/join</a><br>Zoom Support', maskedUrl: 'https://zoom-fake-meeting.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: ['Domain "zo0m.us" uses homoglyph "0" for "o".', 'Masked URL differs, a phishing sign.', 'Join via zoom.us app only.', 'Requires header analysis.'] },
          { text: 'A PayPal email alerts a transaction with a confirmation link. Is it safe?', emailContent: { from: 'support@paypa1.com', subject: 'Confirm $500 Transaction by May 21, 2025', body: 'Dear User,<br>Confirm here: <a href="#">https://paypa1.com/confirm</a><br>PayPal Team', maskedUrl: 'https://paypal-fake-confirm.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Difficult', explanation: ['Domain "paypa1.com" uses homoglyph "1" for "l".', 'Masked URL mismatch signals phishing.', 'Verify on paypal.com directly.', 'Contact PayPal for confirmation.'] },
          { text: 'An Adobe email confirms a charge with a refund link. Is this legitimate?', emailContent: { from: 'billing@ad0be.com', subject: 'Charge $99 - Refund by May 21, 2025', body: 'Dear Customer,<br>Refund here: <a href="#">https://ad0be.com/refund</a><br>Adobe Billing', maskedUrl: 'https://adobe-fake-refund.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: ['Domain "ad0be.com" uses homoglyph "0" for "o".', 'Masked URL differs, a phishing sign.', 'Manage on adobe.com only.', 'Requires header inspection.'] },
          { text: 'A Shopee email offers a P10,000 voucher with a claim link. Is it safe?', emailContent: { from: 'promo@sh0pee.com', subject: 'Win P10,000 - Claim by May 21, 2025', body: 'Dear Shopper,<br>Claim here: <a href="#">https://sh0pee.com/claim</a><br>Shopee Team', maskedUrl: 'https://shopee-voucher-fake.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Difficult', explanation: ['Domain "sh0pee.com" uses homoglyph "0" for "o".', 'Masked URL mismatch signals phishing.', 'Verify on shopee.ph directly.', 'Contact Shopee support.'] },
          { text: 'A Lazada email reports a delivery failure with an address update link. Is this legitimate?', emailContent: { from: 'support@lazàda.com', subject: 'Delivery Failed - Update by May 21, 2025', body: 'Dear Customer,<br>Update here: <a href="#">https://lazàda.com/update</a><br>Lazada Support', maskedUrl: 'https://lazada-fake-delivery.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: ['Domain "lazàda.com" uses homoglyph "à" for "a".', 'Masked URL hides real destination.', 'Update on lazada.com.ph only.', 'Requires header check for homoglyphs.'] },
          { text: 'A TikTok email warns of a copyright strike with an appeal link. Is it safe?', emailContent: { from: 'support@tìktok.com', subject: 'Copyright Strike - Appeal by May 21, 2025', body: 'Dear Creator,<br>Appeal here: <a href="#">https://tìktok.com/appeal</a><br>TikTok Team', maskedUrl: 'https://tiktok-fake-appeal.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: ['Domain "tìktok.com" uses homoglyph "ì" for "i".', 'Includes zero-width non-joiner (U+200C).', 'Masked URL differs, a phishing sign.', 'Appeal on tiktok.com only.'] },
          { text: 'A GCash email offers a P5,000 voucher with a claim link. Is this legitimate?', emailContent: { from: 'promo@gcàsh.com', subject: 'Win P5,000 - Claim by May 21, 2025', body: 'Dear User,<br>Claim here: <a href="#">https://gcàsh.com/claim</a><br>GCash Team', maskedUrl: 'https://gcash-voucher-fake.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Difficult', explanation: ['Domain "gcàsh.com" uses homoglyph "à" for "a".', 'Masked URL mismatch signals phishing.', 'Verify on gcash.com directly.', 'Contact GCash support.'] },
          { text: 'A Globe PH email offers free data with a verification link. Is it safe?', emailContent: { from: 'support@gl0be.com.ph', subject: 'Free 5GB Data - Verify by May 21, 2025', body: 'Dear Subscriber,<br>Verify here: <a href="#">https://gl0be.com.ph/verify</a><br>Globe Team', maskedUrl: 'https://globe-fake-verify.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: ['Domain "gl0be.com.ph" uses homoglyph "0" for "o".', 'Masked URL differs, a phishing sign.', 'Verify on globe.com.ph only.', 'Requires header analysis.'] },
          { text: 'A Smart PH email warns of an overdue bill with a payment link. Is this legitimate?', emailContent: { from: 'billing@smàrt.com.ph', subject: 'Overdue Bill - Pay by May 21, 2025', body: 'Dear Subscriber,<br>Pay here: <a href="#">https://smàrt.com.ph/pay</a><br>Smart Billing', maskedUrl: 'https://smart-fake-bill.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: ['Domain "smàrt.com.ph" uses homoglyph "à" for "a".', 'Masked URL hides real destination.', 'Pay on smart.com.ph only.', 'Requires header check for homoglyphs.'] },
          { text: 'A Shopee email flags your account with a verification link. Is it safe?', emailContent: { from: 'security@sh0pee.com', subject: 'Account Flagged - Verify by May 21, 2025', body: 'Dear User,<br>Verify here: <a href="#">https://sh0pee.com/verify</a><br>Shopee Security', maskedUrl: 'https://shopee-fake-verify.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Difficult', explanation: ['Domain "sh0pee.com" uses homoglyph "0" for "o".', 'Masked URL mismatch signals phishing.', 'Verify on shopee.ph directly.', 'Contact Shopee support.'] },
          { text: 'A Lazada email offers a 50% off voucher with a claim link. Is this legitimate?', emailContent: { from: 'promo@lazàda.com', subject: '50% Off Voucher - Claim by May 21, 2025', body: 'Dear Shopper,<br>Claim here: <a href="#">https://lazàda.com/claim</a><br>Lazada Team', maskedUrl: 'https://lazada-voucher-fake.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Difficult', explanation: ['Domain "lazàda.com" uses homoglyph "à" for "a".', 'Masked URL mismatch signals phishing.', 'Verify on lazada.com.ph directly.', 'Contact Lazada support.'] },
          { text: 'A TikTok email selects you for a creator fund with an application link. Is it safe?', emailContent: { from: 'creator@tìktok.com', subject: 'Creator Fund - Apply by May 21, 2025', body: 'Dear Creator,<br>Apply here: <a href="#">https://tìktok.com/apply</a><br>TikTok Team', maskedUrl: 'https://tiktok-fake-fund.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: ['Domain "tìktok.com" uses homoglyph "ì" for "i".', 'Includes multi-stage obfuscation.', 'Masked URL differs, a phishing sign.', 'Apply on tiktok.com only.'] },
          { text: 'A Shopee email claims a free iPhone win with a claim link. Is this legitimate?', emailContent: { from: 'promo@sh0pee.com', subject: 'Win an iPhone - Claim by May 21, 2025', body: 'Dear Winner,<br>Claim here: <a href="#">https://sh0pee.com/claim</a><br>Shopee Team', maskedUrl: 'https://shopee-iphone-fake.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Difficult', explanation: ['Domain "sh0pee.com" uses homoglyph "0" for "o".', 'Masked URL mismatch signals phishing.', 'Verify on shopee.ph directly.', 'Contact Shopee support.'] },
          { text: 'A Lazada email reports an unauthorized subscription charge with a refund link. Is it safe?', emailContent: { from: 'billing@lazàda.com', subject: 'Charge $99 - Refund by May 21, 2025', body: 'Dear Customer,<br>Refund here: <a href="#">https://lazàda.com/refund</a><br>Lazada Billing', maskedUrl: 'https://lazada-fake-refund.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: ['Domain "lazàda.com" uses homoglyph "à" for "a".', 'Masked URL hides real destination.', 'Manage on lazada.com.ph only.', 'Requires header analysis.'] },
          { text: 'A charity email claims a P20,000 voucher win with a claim link. Is this legitimate?', emailContent: { from: 'donate@charìty-ph.com', subject: 'Win P20,000 - Claim by May 21, 2025', body: 'Dear Donor,<br>Claim here: <a href="#">https://charìty-ph.com/claim</a><br>Charity PH Team', maskedUrl: 'https://charity-fake-voucher.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Difficult', explanation: ['Domain "charìty-ph.com" uses homoglyph "ì" for "i".', 'Masked URL mismatch signals phishing.', 'Legitimate charities avoid such emails.', 'Verify via official channels.'] },
          { text: 'A PLDT email warns of an overdue bill with a payment link. Is it safe?', emailContent: { from: 'billing@pldt-h0me.com', subject: 'Overdue Bill - Pay by May 21, 2025', body: 'Dear Subscriber,<br>Pay here: <a href="#">https://pldt-h0me.com/pay</a><br>PLDT Billing', maskedUrl: 'https://pldt-fake-bill.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: ['Domain "pldt-h0me.com" uses homoglyph "0" for "o".', 'Masked URL differs, a phishing sign.', 'Pay on pldt.com only.', 'Requires header inspection.'] },
          { text: 'A Cebu Pacific email offers a free flight voucher with a verification link. Is this legitimate?', emailContent: { from: 'promo@cebu-pacìfic.com', subject: 'Free Flight Voucher - Verify by May 21, 2025', body: 'Dear Traveler,<br>Verify here: <a href="#">https://cebu-pacìfic.com/verify</a><br>Cebu Pacific Team', maskedUrl: 'https://cebu-fake-voucher.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: ['Domain "cebu-pacìfic.com" uses homoglyph "ì" for "i".', 'Masked URL hides real destination.', 'Verify on cebupacificair.com only.', 'Requires header check for homoglyphs.'] },
          { text: 'A casino email claims a P50,000 win with a claim link. Is this safe?', emailContent: { from: 'win@casìno-ph.com', subject: 'Win P50,000 - Claim by May 21, 2025', body: 'Dear Player,<br>Claim here: <a href="#">https://casìno-ph.com/claim</a><br>Casino PH Team', maskedUrl: 'https://casino-fake-win.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Difficult', explanation: ['Domain "casìno-ph.com" uses homoglyph "ì" for "i".', 'Masked URL mismatch signals phishing.', 'Legitimate casinos avoid such emails.', 'Verify via official channels.'] },
          { text: 'A spoofed CFO email requests an urgent wire transfer with an invoice link. Is this safe?', emailContent: { from: 'cfo@company.com', subject: 'Urgent Wire Transfer by May 21, 2025', body: 'Dear Team,<br>Transfer $1M here: <a href="#">https://company-finance.com/transfer</a><br>[CFO Name]', maskedUrl: 'https://fake-finance-transfer.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: ['Spoofed with zero-width character (U+200B).', 'Masked URL hides real destination.', 'BEC attack; experts fall to impersonation.', 'Verify via direct CEO call.'] },
          { text: 'An AWS email warns of a compromised account with a patch link. Is this legitimate?', emailContent: { from: 'security@aws.amazon.c0m', subject: 'Compromised Account - Patch by May 21, 2025', body: 'Dear Customer,<br>Patch here: <a href="#">https://aws.amazon.c0m/security</a><br>AWS Security', maskedUrl: 'https://aws-fake-security.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: ['Domain "aws.amazon.c0m" uses homoglyph "0" for "o".', 'Includes multi-stage redirect.', 'Masked URL differs, a phishing sign.', 'Patch on aws.amazon.com only.'] },
          { text: 'A spoofed vendor email requests updated payment details with a link. Is this safe?', emailContent: { from: 'accounts@vendor.com', subject: 'Update Payment by May 21, 2025', body: 'Dear Finance,<br>Update here: <a href="#">https://vendor.com/update</a><br>Vendor Accounts', maskedUrl: 'https://vendor-fake-payment.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: ['Spoofed with zero-width joiner (U+200D).', 'Masked URL hides real destination.', 'BEC attack; experts miss vendor spoofing.', 'Verify via trusted channel.'] },
          { text: 'A GitHub email flags a repository issue with a review link. Is this legitimate?', emailContent: { from: 'security@gìthub.com', subject: 'Repository Issue - Review by May 21, 2025', body: 'Dear Developer,<br>Review here: <a href="#">https://gìthub.com/review</a><br>GitHub Security', maskedUrl: 'https://github-fake-review.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: ['Domain "gìthub.com" uses homoglyph "ì" for "i".', 'Includes multi-vector obfuscation.', 'Masked URL differs, a phishing sign.', 'Review on github.com only.'] },
          { text: 'A spoofed CEO email requests HR data with an upload link. Is this safe?', emailContent: { from: 'ceo@company.com', subject: 'HR Data Audit by May 21, 2025', body: 'Dear HR,<br>Upload here: <a href="#">https://company-hr.com/upload</a><br>[CEO Name]', maskedUrl: 'https://fake-hr-upload.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: ['Spoofed with multi-stage deception.', 'Includes fake follow-up call tactic.', 'Masked URL hides real destination.', 'Verify via direct CEO call.'] },
          { text: 'An Oracle email warns of a vulnerability with a patch link. Is this legitimate?', emailContent: { from: 'support@orac1e.com', subject: 'Vulnerability - Patch by May 21, 2025', body: 'Dear Customer,<br>Patch here: <a href="#">https://orac1e.com/patch</a><br>Oracle Support', maskedUrl: 'https://oracle-fake-patch.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: ['Domain "orac1e.com" uses homoglyph "1" for "l".', 'Includes zero-width non-joiner (U+200C).', 'Masked URL differs, a phishing sign.', 'Patch on oracle.com only.'] },
          { text: 'A spoofed IT email requires a security update with a download link. Is this safe?', emailContent: { from: 'it@company.com', subject: 'Security Update by May 21, 2025', body: 'Dear Employee,<br>Download here: <a href="#">https://company-it.com/update</a><br>IT Department', maskedUrl: 'https://fake-it-update.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: ['Spoofed with zero-width character (U+200B).', 'Masked URL hides real destination.,' 'Internal phishing; experts miss it.', 'Verify via official IT channel.'] },
          { text: 'A government email offers a tax refund with a claim link. Is this legitimate?', emailContent: { from: 'refund@gov.ph', subject: 'Tax Refund - Claim by May 21, 2025', body: 'Dear Taxpayer,<br>Claim here: <a href="#">https://gov.ph/refund</a><br>Government Tax Agency', maskedUrl: 'https://fake-tax-refund.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Difficult', explanation: ['Domain "gov.ph" is spoofed; official domains are controlled.', 'Masked URL mismatch signals phishing.', 'No unsolicited refund emails from gov.', 'Verify on official portal.'] },
          { text: 'A Dropbox email warns of full storage with an upgrade link. Is it safe?', emailContent: { from: 'support@dr0pbox.com', subject: 'Storage Full - Upgrade by May 21, 2025', body: 'Dear User,<br>Upgrade here: <a href="#">https://dr0pbox.com/upgrade</a><br>Dropbox Team', maskedUrl: 'https://dropbox-fake-upgrade.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: ['Domain "dr0pbox.com" uses homoglyph "0" for "o".', 'Masked URL differs, a phishing sign.', 'Manage on dropbox.com only.', 'Requires header inspection.'] },
          { text: 'A spoofed colleague email requests project files with a share link. Is this safe?', emailContent: { from: 'colleague@company.com', subject: 'Share Files by May 21, 2025', body: 'Dear Team,<br>Share here: <a href="#">https://company-files.com/share</a><br>[Colleague Name]', maskedUrl: 'https://fake-files-share.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: ['Spoofed with zero-width joiner (U+200D).', 'Masked URL hides real destination.', 'Internal phishing; experts miss it.', 'Verify via direct call.'] },
          { text: 'A Slack email warns of a workspace issue with a resolve link. Is this legitimate?', emailContent: { from: 'security@s1ack.com', subject: 'Workspace Issue - Resolve by May 21, 2025', body: 'Dear Admin,<br>Resolve here: <a href="#">https://s1ack.com/security</a><br>Slack Security', maskedUrl: 'https://slack-fake-security.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: ['Domain "s1ack.com" uses homoglyph "1" for "l".', 'Masked URL differs, a phishing sign.', 'Resolve on slack.com only.', 'Requires header analysis.'] },
          { text: 'A spoofed supplier email reports a delay with a reschedule link. Is this safe?', emailContent: { from: 'logistics@supplier.com', subject: 'Shipment Delay - Reschedule by May 21, 2025', body: 'Dear Partner,<br>Reschedule here: <a href="#">https://supplier-logistics.com/reschedule</a><br>Supplier Logistics', maskedUrl: 'https://fake-supplier-logistics.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: ['Spoofed with zero-width character (U+200B).', 'Masked URL hides real destination.', 'Supply chain phishing; experts miss it.', 'Verify via trusted channel.'] },
          { text: 'A Salesforce email flags account activity with a verification link. Is this legitimate?', emailContent: { from: 'support@sa1esforce.com', subject: 'Verify Activity by May 21, 2025', body: 'Dear User,<br>Verify here: <a href="#">https://sa1esforce.com/verify</a><br>Salesforce Support', maskedUrl: 'https://salesforce-fake-verify.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: ['Domain "sa1esforce.com" uses homoglyph "1" for "l".', 'Masked URL differs, a phishing sign.', 'Verify on salesforce.com only.', 'Requires header inspection.'] },
          { text: 'A spoofed client email requests a contract update with a link. Is this safe?', emailContent: { from: 'client@clientcompany.com', subject: 'Update Contract by May 21, 2025', body: 'Dear Partner,<br>Update here: <a href="#">https://clientcompany-agreements.com/update</a><br>[Client Name]', maskedUrl: 'https://fake-client-agreements.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: ['Spoofed with zero-width joiner (U+200D).', 'Masked URL hides real destination.', 'Client impersonation; experts miss it., 'Verify via direct call.'] },
          { text: 'A Microsoft Teams email shares a file with a view link. Is this legitimate?', emailContent: { from: 'notifications@teams.mìcrosoft.com', subject: 'File Shared - View by May 21, 2025', body: 'Dear User,<br>View here: <a href="#">https://teams.mìcrosoft.com/view</a><br>Microsoft Teams', maskedUrl: 'https://teams-fake-file.com' }, options: ['Legitimate', 'Phishing'], correctAnswer: 'Phishing', difficulty: 'Highly Technical Extremely Difficult', explanation: ['Domain "teams.mìcrosoft.com" uses homoglyph "ì" for "i".', 'Includes zero-width space (U+200B).', 'Masked URL differs, a phishing sign.', 'View on teams.microsoft.com only.'] },
          // Additional 12 email phishing questions can be added similarly to reach 32 total
        ],
        netsec: [],
        forensics: [],
        crypto: []
      };

      const i18n = {
        en: { title: 'Phishing Challenge', dashboard: 'Dashboard', score: 'Score', yourAnswer: 'Your Answer', correctAnswer: 'Correct Answer', feedback: 'Feedback', next: 'Next' },
        es: { title: 'Desafío de Phishing', dashboard: 'Tablero', score: 'Puntuación', yourAnswer: 'Tu Respuesta', correctAnswer: 'Respuesta Correcta', feedback: 'Comentarios', next: 'Siguiente' }
      };

      useEffect(() => {
        setI18n(lang === 'en' ? i18n.en : i18n.es);
      }, [lang]);

      const categories = [
        { id: 'phish', name: 'Phishing/Email', questions: exercisesData.phish },
      ];

      const handleChallengeSelect = (categoryId, index) => {
        const category = categories.find(c => c.id === categoryId);
        setCurrentChallenge({ category, index });
        setCurrentView('challenge');
      };

      const handleSubmit = (categoryId, index, answer) => {
        const category = categories.find(c => c.id === categoryId);
        const question = category.questions[index];
        const isCorrect = answer === question.correctAnswer;
        setScores(prev => ({ ...prev, [categoryId]: { ...prev[categoryId], [index]: isCorrect ? 1 : 0 } }));
        setUserAnswer(answer);
        setShowFeedback(true);
      };

      const handleNext = () => {
        setShowFeedback(false);
        setUserAnswer('');
        setChallengeIndex(prev => prev + 1);
        if (challengeIndex + 1 < categories[0].questions.length) {
          setCurrentChallenge({ category: categories[0], index: challengeIndex + 1 });
        } else {
          setCurrentView('dashboard');
          setChallengeIndex(0);
        }
      };

      return (
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">{i18n.title}</h1>
          {currentView === 'dashboard' ? (
            <div>
              <select className="mb-4 p-2 border rounded" onChange={(e) => setLang(e.target.value)} value={lang}>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((cat) => (
                  <div key={cat.id} className="bg-white p-4 rounded shadow">
                    <h2 className="text-xl">{cat.name}</h2>
                    <ul>
                      {cat.questions.map((_, idx) => (
                        <li key={idx} className="cursor-pointer text-blue-500 hover:underline" onClick={() => handleChallengeSelect(cat.id, idx)}>
                          Question {idx + 1}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ) : currentView === 'challenge' && currentChallenge ? (
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-xl mb-4">Question {challengeIndex + 1}</h2>
              <p className="mb-4">{currentChallenge.category.questions[challengeIndex].text}</p>
              {currentChallenge.category.questions[challengeIndex].emailContent && (
                <div className="mb-4 p-4 bg-gray-100 rounded">
                  <p><strong>From:</strong> {currentChallenge.category.questions[challengeIndex].emailContent.from}</p>
                  <p><strong>Subject:</strong> {currentChallenge.category.questions[challengeIndex].emailContent.subject}</p>
                  <p><strong>Body:</strong> <div dangerouslySetInnerHTML={{ __html: currentChallenge.category.questions[challengeIndex].emailContent.body }} /></p>
                </div>
              )}
              <select className="mb-4 p-2 border rounded" value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)}>
                <option value="">Select an answer</option>
                {currentChallenge.category.questions[challengeIndex].options.map((opt, i) => (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>
              <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => handleSubmit(currentChallenge.category.id, challengeIndex, userAnswer)}>Submit</button>
              {showFeedback && (
                <div className="mt-4 p-4 bg-green-100 rounded">
                  <p><strong>{i18n.score}:</strong> {scores[currentChallenge.category.id]?.[challengeIndex] === 1 ? '1' : '0'}</p>
                  <p><strong>{i18n.yourAnswer}:</strong> {userAnswer}</p>
                  <p><strong>{i18n.correctAnswer}:</strong> {currentChallenge.category.questions[challengeIndex].correctAnswer}</p>
                  <p><strong>{i18n.feedback}:</strong></p>
                  <ul>
                    {currentChallenge.category.questions[challengeIndex].explanation.map((exp, i) => (
                      <li key={i}>{exp}</li>
                    ))}
                  </ul>
                  <button className="mt-2 bg-green-500 text-white px-4 py-2 rounded" onClick={handleNext}>{i18n.next}</button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      );
    };

    ReactDOM.render(<App />, document.getElementById('app'));
  </script>
</body>
</html>
