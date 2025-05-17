import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Exercise from './components/Exercise';
import Tutorial from './components/Tutorial';
import Feedback from './components/Feedback';
import exercisesData from './assets/data/exercises.json';
import en from './assets/data/i18n/en.json';
import es from './assets/data/i18n/es.json';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8">
          <h1 className="text-2xl font-bold text-red-500">Error Loading App</h1>
          <p>{this.state.error?.message || 'Unknown error'}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  const [lang, setLang] = useState('en');
  const [i18n, setI18n] = useState(en);
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentExercise, setCurrentExercise] = useState(null);
  const [scores, setScores] = useState({});
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    setI18n(lang === 'en' ? en : es);
  }, [lang]);

  const handleExerciseSelect = (exerciseId) => {
    const exercise = exercisesData.find(ex => ex.id === exerciseId);
    if (exercise) {
      setCurrentExercise(exercise);
      setCurrentView('exercise');
    }
  };

  const handleSubmit = (exerciseId, userAnswers) => {
    const exercise = exercisesData.find(ex => ex.id === exerciseId);
    let score = 0;
    exercise.questions.forEach((q, i) => {
      if (q.correctAnswer === userAnswers[i]) score += 100 / exercise.questions.length;
    });
    setScores({ ...scores, [exerciseId]: score });
    setCurrentView('feedback');
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex">
        <aside className="w-64 bg-gray-800 p-4">
          <h1 className="text-2xl font-bold mb-4">{i18n.title || 'Cybersecurity Lab'}</h1>
          <select
            className="mb-4 p-2 bg-gray-700 rounded"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
          >
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
          <button
            className="w-full p-2 bg-green-600 rounded hover:bg-green-700"
            onClick={() => setCurrentView('dashboard')}
          >
            {i18n.dashboard || 'Dashboard'}
          </button>
          <button
            className="w-full p-2 mt-2 bg-gray-600 rounded hover:bg-gray-700"
            onClick={() => setShowTutorial(true)}
          >
            {i18n.tutorial || 'Tutorial'}
          </button>
        </aside>
        <main className="flex-1 p-8">
          {currentView === 'dashboard' && (
            <Dashboard
              exercises={exercisesData}
              scores={scores}
              onSelect={handleExerciseSelect}
              i18n={i18n}
            />
          )}
          {currentView === 'exercise' && currentExercise && (
            <Exercise
              exercise={currentExercise}
              onSubmit={handleSubmit}
              i18n={i18n}
            />
          )}
          {currentView === 'feedback' && currentExercise && (
            <Feedback
              exercise={currentExercise}
              score={scores[currentExercise.id]}
              onBack={() => setCurrentView('dashboard')}
              i18n={i18n}
            />
          )}
          {showTutorial && (
            <Tutorial onClose={() => setShowTutorial(false)} i18n={i18n} />
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default App;