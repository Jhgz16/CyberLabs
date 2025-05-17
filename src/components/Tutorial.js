const Tutorial = ({ onClose, i18n }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-lg">
        <h2 className="text-2xl font-bold mb-4">{i18n.tutorial}</h2>
        <p className="text-gray-400 mb-6">
          {i18n.tutorialContent}
        </p>
        <button
          className="p-2 bg-green-600 rounded hover:bg-green-700"
          onClick={onClose}
        >
          {i18n.close}
        </button>
      </div>
    </div>
  );
};
