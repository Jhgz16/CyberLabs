// Global feedback handler for all question categories
window.getFeedback = function(question, userAnswer) {
  const feedback = {
    isCorrect: userAnswer === question.correctAnswer,
    explanation: question.explanation,
    difficulty: question.difficulty
  };

  // Return feedback object with methods to access details
  return {
    isCorrect: () => feedback.isCorrect,
    getExplanation: () => feedback.explanation,
    getDifficulty: () => feedback.difficulty,
    display: () => {
      let message = `Answer: ${feedback.isCorrect ? 'Correct' : 'Incorrect'}. `;
      message += `Explanation: ${feedback.explanation}. Difficulty: ${feedback.difficulty}.`;
      return message;
    }
  };
};

// Example usage (to be implemented in your quiz UI)
// const feedback = getFeedback(phishingQuestions[0], 'Smishing');
// console.log(feedback.display());