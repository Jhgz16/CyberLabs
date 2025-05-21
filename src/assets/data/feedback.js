/**
 * Generates feedback for a given question based on user response.
 * @param {Object} question - The question object containing text, content, options, correctAnswer, and difficulty.
 * @param {string} userAnswer - The user's selected answer.
 * @returns {string} Feedback message including a bulleted explanation.
 */
function getFeedback(question, userAnswer) {
  const isCorrect = userAnswer === question.correctAnswer;
  let feedback = isCorrect ? 'Correct! ' : 'Incorrect. The correct answer is ' + question.correctAnswer + '. ';
  
  // Determine category based on content type
  const isEmail = !!question.emailContent;
  const category = isEmail ? 'Phishing (Email)' : 'Smishing (SMS)';
  
  // Generate detailed bulleted explanation based on difficulty and category
  let explanation = '<ul>';
  if (isCorrect) {
    switch (question.difficulty) {
      case 'Medium':
        explanation += `
          <li>Great job spotting the scam!</li>
          <li>This type of ${category.toLowerCase()} often uses fake offers or urgent requests.</li>
          <li>Next time, check the domain name for spelling errors or unusual characters.</li>
          <li>Always avoid clicking links from unexpected messages—contact the company directly instead.</li>
        `;
        break;
      case 'Highly Difficult':
        explanation += `
          <li>Well done! You identified a subtle scam.</li>
          <li>This ${category.toLowerCase()} mimics official emails or texts with slight domain impersonation.</li>
          <li>Look for small changes in the URL (e.g., "sh0pee" instead of "shopee").</li>
          <li>Verify the sender’s email or number against the official website before acting.</li>
        `;
        break;
      case 'Highly Technical':
        explanation += `
          <li>Excellent work! You caught a technical trick.</li>
          <li>This ${category.toLowerCase()} uses homoglyphs (e.g., "0" instead of "o") or masked URLs.</li>
          <li>Hover over links (without clicking) to see the real URL, and check for mismatches.</li>
          <li>If unsure, use a secure browser or contact the service provider for confirmation.</li>
        `;
        break;
      case 'Highly Technical Extremely Difficult':
        explanation += `
          <li>Impressive! You mastered a complex scam detection.</li>
          <li>This ${category.toLowerCase()} employs advanced techniques like zero-width characters or multi-stage redirects.</li>
          <li>Inspect email headers or use DNS tools to verify the source, as these are hard to spot visually.</li>
          <li>Always reach out to the official support channel (e.g., website or phone) to validate.</li>
        `;
        break;
      default:
        explanation += '<li>Nice effort! Check the source and link authenticity next time.</li>';
    }
  } else {
    switch (question.difficulty) {
      case 'Medium':
        explanation += `
          <li>Sorry, that was incorrect. The right answer is ${question.correctAnswer}.</li>
          <li>This ${category.toLowerCase()} often includes fake promotions or urgent demands.</li>
          <li>Look for domain spoofing (e.g., extra letters) or unexpected sender details.</li>
          <li>Tip: Contact the company using official contact info from their website.</li>
        `;
        break;
      case 'Highly Difficult':
        explanation += `
          <li>Oops, that was incorrect. The correct answer is ${question.correctAnswer}.</li>
          <li>This ${category.toLowerCase()} imitates legitimate messages with slight URL changes.</li>
          <li>Check the domain carefully (e.g., "paypa1" vs. "paypal") and avoid clicking links.</li>
          <li>Cross-check the sender with the official website or app.</li>
        `;
        break;
      case 'Highly Technical':
        explanation += `
          <li>Incorrect this time. The correct answer is ${question.correctAnswer}.</li>
          <li>This ${category.toLowerCase()} uses technical tricks like homoglyphs or hidden URLs.</li>
          <li>Learn to spot characters like "1" for "l" or use a tool to reveal the true link.</li>
          <li>For safety, verify directly with the service provider using known contacts.</li>
        `;
        break;
      case 'Highly Technical Extremely Difficult':
        explanation += `
          <li>That was tricky! The correct answer is ${question.correctAnswer}.</li>
          <li>This ${category.toLowerCase()} uses advanced methods like zero-width spaces or DNS spoofing.</li>
          <li>These require header analysis or DNS checks—beyond visual inspection.</li>
          <li>Always use official channels (e.g., calling customer service) to confirm.</li>
        `;
        break;
      default:
        explanation += `
          <li>Incorrect. The correct answer is ${question.correctAnswer}.</li>
          <li>Check the sender and link authenticity next time.</li>
        `;
    }
  }
  explanation += `</ul> (Category: ${category})`;

  feedback += explanation;
  return feedback;
}

// Expose the function globally
window.getFeedback = getFeedback;
