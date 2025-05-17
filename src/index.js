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
    const [currentExercise, setCurrentExercise] = useState(null);
    const [scores, setScores] = useState({});
    const [showTutorial, setShowTutorial] = useState(false);

    useEffect(function() {
      setI18n(lang === 'en' ? window.en : window.es);
    }, [lang]);

    function handleExerciseSelect(exerciseId) {
      const exercise = window.exercisesData.find(function(ex) { return ex.id === exerciseId; });
      if (exercise) {
        setCurrentExercise(exercise);
        setCurrentView('exercise');
      }
    }

    function handleSubmit(exerciseId, userAnswers) {
      const exercise = window.exercisesData.find(function(ex) { return ex.id === exerciseId; });
      let score = 0;
      exercise.questions.forEach(function(q, i) {
        if (q.correctAnswer === userAnswers[i]) score += 100 / exercise.questions.length;
      });
      setScores(function(prev) { return { ...prev, [exerciseId]: score }; });
      setCurrentView('feedback');
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
        React.createElement('div', { className: 'min-h-screen flex' },
          React.createElement('aside', { className: 'w-64 bg-gray-800 p-4' },
            React.createElement('h1', { className: 'text-2xl font-bold mb-4' }, i18n.title || 'Cybersecurity Lab'),
            React.createElement('select', {
              className: 'mb-4 p-2 bg-gray-700 rounded',
              value: lang,
              onChange: function(e) { setLang(e.target.value); }
            },
              React.createElement('option', { value: 'en' }, 'English'),
              React.createElement('option', { value: 'es' }, 'Español')
            ),
            React.createElement('button', {
              className: 'w-full p-2 bg-green-600 rounded hover:bg-green-700',
              onClick: function() { setCurrentView('dashboard'); }
            }, i18n.dashboard || 'Dashboard'),
            React.createElement('button', {
              className: 'w-full p-2 mt-2 bg-gray-600 rounded hover:bg-gray-700',
              onClick: function() { setShowTutorial(true); }
            }, i18n.tutorial || 'Tutorial')
          ),
          React.createElement('main', { className: 'flex-1 p-8' },
            currentView === 'dashboard' && React.createElement(Dashboard, {
              exercises: window.exercisesData,
              scores: scores,
              onSelect: handleExerciseSelect,
              i18n: i18n
            }),
            currentView === 'exercise' && currentExercise && React.createElement(Exercise, {
              exercise: currentExercise,
              onSubmit: handleSubmit,
              i18n: i18n
            }),
            currentView === 'feedback' && currentExercise && React.createElement(Feedback, {
              exercise: currentExercise,
              score: scores[currentExercise.id],
              onBack: function() { setCurrentView('dashboard'); },
              i18n: i18n
            }),
            showTutorial && React.createElement(Tutorial, {
              onClose: function() { setShowTutorial(false); },
              i18n: i18n
            })
          )
        )
      )
    );
  };

  const Dashboard = function(props) {
    const exercises = props.exercises || [];
    const scores = props.scores || {};
    const onSelect = props.onSelect;
    const i18n = props.i18n || {};

    return React.createElement('div', null,
      React.createElement('h2', { className: 'text-3xl font-bold mb-6' }, i18n.dashboard || 'Dashboard'),
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' },
        exercises.map(function(exercise) {
          return React.createElement('div', {
            key: exercise.id,
            className: 'bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700 cursor-pointer',
            onClick: function() { onSelect(exercise.id); },
            role: 'button',
            'aria-label': `${i18n.start || 'Start'} ${exercise.title}`
          },
            React.createElement('h3', { className: 'text-xl font-semibold mb-2' }, exercise.title),
            React.createElement('p', { className: 'text-gray-400 mb-4' }, exercise.description),
            React.createElement('p', { className: 'text-green-400' },
              i18n.score || 'Score', ': ',
              scores[exercise.id] ? `${scores[exercise.id]}%` : 'Not attempted'
            )
          );
        })
      )
    );
  };

  const Exercise = function(props) {
    const exercise = props.exercise;
    const onSubmit = props.onSubmit;
    const i18n = props.i18n || {};
    const [answers, setAnswers] = useState(new Array(exercise.questions.length).fill(''));

    function handleAnswerChange(index, value) {
      const newAnswers = [...answers];
      newAnswers[index] = value;
      setAnswers(newAnswers);
    }

    function handleSubmit() {
      onSubmit(exercise.id, answers);
    }

    return React.createElement('div', { className: 'bg-gray-800 p-8 rounded-lg shadow-lg' },
      React.createElement('h2', { className: 'text-2xl font-bold mb-4' }, exercise.title),
      React.createElement('p', { className: 'text-gray-400 mb-6' }, exercise.description),
      exercise.questions.map(function(question, index) {
        return React.createElement('div', { key: index, className: 'mb-6' },
          React.createElement('p', { className: 'text-lg mb-2' }, question.text),
          question.options.map(function(option, optIndex) {
            return React.createElement('label', { key: optIndex, className: 'block mb-2' },
              React.createElement('input', {
                type: 'radio',
                name: `question-${index}`,
                value: option,
                checked: answers[index] === option,
                onChange: function() { handleAnswerChange(index, option); },
                className: 'mr-2'
              }),
              option
            );
          })
        );
      }),
      React.createElement('button', {
        className: 'p-2 bg-green-600 rounded hover:bg-green-700',
        onClick: handleSubmit,
        disabled: answers.some(function(a) { return !a; })
      }, i18n.submit || 'Submit')
    );
  };

  const Feedback = function(props) {
    const exercise = props.exercise;
    const score = props.score;
    const onBack = props.onBack;
    const i18n = props.i18n || {};

    return React.createElement('div', { className: 'bg-gray-800 p-8 rounded-lg shadow-lg' },
      React.createElement('h2', { className: 'text-2xl font-bold mb-4' }, i18n.results || 'Results'),
      React.createElement('p', { className: 'text-xl mb-4' },
        i18n.scoreFor || 'Score for', ' ', exercise.title, ': ',
        React.createElement('span', { className: 'text-green-400' }, score, '%')
      ),
      React.createElement('p', { className: 'text-gray-400 mb-6' },
        score >= 80 ? (i18n.feedbackExcellent || 'Excellent!') :
        score >= 50 ? (i18n.feedbackGood || 'Good job!') :
        (i18n.feedbackImprove || 'Needs improvement.')
      ),
      React.createElement('button', {
        className: 'p-2 bg-green-600 rounded hover:bg-green-700',
        onClick: onBack
      }, i18n.backToDashboard || 'Back to Dashboard')
    );
  };

  const Tutorial = function(props) {
    const onClose = props.onClose;
    const i18n = props.i18n || {};

    return React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center' },
      React.createElement('div', { className: 'bg-gray-800 p-8 rounded-lg shadow-lg max-w-lg' },
        React.createElement('h2', { className: 'text-2xl font-bold mb-4' }, i18n.tutorial || 'Tutorial'),
        React.createElement('p', { className: 'text-gray-400 mb-6' }, i18n.tutorialContent || 'Welcome to the Cybersecurity Lab...'),
        React.createElement('button', {
          className: 'p-2 bg-green-600 rounded hover:bg-green-700',
          onClick: onClose
        }, i18n.close || 'Close')
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
      window.exercisesData = results[0];
      window.en = results[1];
      window.es = results[2];

      // Check if data is loaded
      if (!window.exercisesData || !window.en || !window.es) {
        throw new Error('Required data (exercisesData, en, es) not loaded');
      }

      console.log('Rendering App...');
      ReactDOM.render(React.createElement(App), document.getElementById('root'));
      console.log('App rendered');
    })
    .catch(err => {
      console.error('JSON loading failed:', err);
      document.getElementById('error').innerText = 'Failed to load app data: ' + err.message;
      document.getElementById('error').classList.remove('hidden');
    });
} catch (e) {
  console.error('Failed to render React app:', e);
  document.getElementById('error').innerText = 'Failed to load app: ' + e.message;
  document.getElementById('error').classList.remove('hidden');
}
