const Dashboard = ({ exercises, scores, onSelect, i18n }) => {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">{i18n.dashboard}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exercises.map((exercise) => (
          <div
            key={exercise.id}
            className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700 cursor-pointer"
            onClick={() => onSelect(exercise.id)}
            role="button"
            aria-label={`${i18n.start} ${exercise.title}`}
          >
            <h3 className="text-xl font-semibold mb-2">{exercise.title}</h3>
            <p className="text-gray-400 mb-4">{exercise.description}</p>
            <p className="text-green-400">
              {i18n.score}: {scores[exercise.id] ? `${scores[exercise.id]}%` : 'Not attempted'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
