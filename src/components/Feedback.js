const Feedback = ({ exercise, score, onBack, i18n }) => {
  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">{i18n.results}</h2>
      <p className="text-xl mb-4">
        {i18n.scoreFor} {exercise.title}: <span className="text-green-400">{score}%</span>
      </p>
      <p className="text-gray-400 mb-6">
        {score >= 80 ? i18n.feedbackExcellent : score >= 50 ? i18n.feedbackGood : i18n.feedbackImprove}
      </p>
      <button
        className="p-2 bg-green-600 rounded hover:bg-green-700"
        onClick={onBack}
      >
        {i18n.backToDashboard}
      </button>
    </div>
  );
};
