console.log('index.js loaded');
try {
  const React = window.React;
  const ReactDOM = window.ReactDOM;
  console.log('React and ReactDOM loaded:', React, ReactDOM);

  // Function to load a script dynamically and return a Promise
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.type = 'text/javascript';
      script.async = false;
      script.onload = () => {
        console.log(`${src} loaded successfully`);
        resolve();
      };
      script.onerror = () => {
        console.error(`Failed to load script: ${src}`);
        reject(new Error(`Failed to load ${src}`));
      };
      document.head.appendChild(script);
    });
  }

  // List of scripts to load
  const scripts = [
    './src/App.js',
    './src/components/Dashboard.js',
    './src/components/Exercise.js',
    './src/components/Feedback.js',
    './src/components/Tutorial.js',
    './src/assets/data/exercises.json',
    './src/assets/data/i18n/en.json',
    './src/assets/data/i18n/es.json'
  ];

  // Load all scripts sequentially
  Promise.all(scripts.map(src => loadScript(src)))
    .then(() => {
      console.log('All scripts loaded');
      // Check if all required components are defined
      const requiredComponents = ['App', 'Dashboard', 'Exercise', 'Feedback', 'Tutorial'];
      const missingComponents = requiredComponents.filter(comp => !window[comp]);
      if (missingComponents.length > 0) {
        throw new Error(`Missing components: ${missingComponents.join(', ')}`);
      }

      // Check if data is loaded
      if (!window.exercisesData || !window.en || !window.es) {
        throw new Error('Required data (exercisesData, en, es) not loaded');
      }

      console.log('Rendering App...');
      ReactDOM.render(React.createElement(window.App), document.getElementById('root'));
      console.log('App rendered');
    })
    .catch(err => {
      console.error('Script loading failed:', err);
      document.getElementById('error').innerText = 'Failed to load app scripts: ' + err.message;
      document.getElementById('error').classList.remove('hidden');
    });
} catch (e) {
  console.error('Failed to render React app:', e);
  document.getElementById('error').innerText = 'Failed to load app: ' + e.message;
  document.getElementById('error').classList.remove('hidden');
}
