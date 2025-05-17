const { useState } = window.React;

const Exercise = ({ exercise, onSubmit, i18n }) => {
  const [answers, setAnswers] = useState(new Array(exercise.questions.length).fill(''));

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    onSubmit(exercise.id, answers);
  };

  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">{exercise.title}</h2>
      <p className="text-gray-400 mb-6">{exercise.description}</p>
      {exercise.questions.map((question, index) => (
        <div key={index} className="mb-6">
          <p className="text-lg mb-2">{question.text}</p>
          {question.options.map((option, optIndex) => (
            <label key={optIndex} className="block mb-2">
              <input
                type="radio"
                name={`question-${index}`}
                value={option}
                checked={answers[index] === option}
                onChange={() => handleAnswerChange(index, option)}
                className="mr-2"
              />
              {option}
            </label>
          ))}
        </div>
      ))}
      <button
        className="p-2 bg-green-600 rounded hover:bg-green-700"
        onClick={handleSubmit}
        disabled={answers.some(a => !a)}
      >
        {i18n.submit}
      </button>
    </div>
  );
};
