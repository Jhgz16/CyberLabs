/**
 * Generates feedback for a given question based on user response.
 * @param {Object} question - The question object containing text, content, options, correctAnswer, and difficulty.
 * @param {string} userAnswer - The user's selected answer.
 * @returns {string} Feedback message including explanation.
 */
function getFeedback(question, userAnswer) {
  const isCorrect = userAnswer === question.correctAnswer;
  let feedback = isCorrect ? 'Correct! ' : 'Incorrect. The correct answer is ' + question.correctAnswer + '. ';
  
  // Determine category based on content type
  const isEmail = !!question.emailContent;
  const category = isEmail ? 'Phishing (Email)' : 'Smishing (SMS)';
  
  // Generate explanation based on difficulty and category
  let explanation = '';
  switch (question.difficulty) {
    case 'Medium':
      explanation = isCorrect 
        ? 'Good job identifying the scam. Check for domain spoofing or unusual links next time.' 
        : 'Look for signs like masked URLs or unexpected offers from trusted brands.';
      break;
    case 'Highly Difficult':
      explanation = isCorrect 
        ? 'Well done! This required spotting subtle domain impersonation.' 
        : 'This mimics official communications. Verify domains and avoid clicking links.';
      break;
    case 'Highly Technical':
      explanation = isCorrect 
        ? 'Excellent! You caught the homoglyph or URL trick.' 
        : 'Inspect for homoglyphs (e.g., "0" for "o") or masked URLs requiring technical analysis.';
      break;
    case 'Highly Technical Extremely Difficult':
      explanation = isCorrect 
        ? 'Impressive! This needed deep inspection like header analysis or DNS tracing.' 
        : 'This uses advanced techniques (e.g., zero-width characters). Contact the service directly.';
      break;
    default:
      explanation = 'Consider checking the source and link authenticity.';
  }

  feedback += explanation + ` (Category: ${category})`;
  return feedback;
}

// Expose the function globally
window.getFeedback = getFeedback;
