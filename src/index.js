console.log('index.js loaded');
try {
  const React = window.React;
  const ReactDOM = window.ReactDOM;
  console.log('React and ReactDOM loaded:', React, ReactDOM);

  // Function to transpile and load a script dynamically
  function loadAndTranspileScript(src) {
    return fetch(src)
      .then(response => {
        if (!response.ok) throw new Error(`Failed to fetch ${src}: ${response.status}`);
        return response.text();
      })
      .then(code => {
        const transpiled = Babel.transform(code, { presets: ['react'] }).code;
        const script = document.createElement('script');
        script.textContent = transpiled;
        document.head.appendChild(script);
        console.log(`${src} loaded and transpiled successfully`);
        return new Promise(resolve => setTimeout(resolve, 0)); // Allow script to execute
      })
      .catch(err => {
        console.error(`Failed to transpile/load script: ${src}`, err);
        throw err;
      });
  }

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

  // Scripts and JSON files to load
  const scripts = [
    './src/App.js',
    './src/components/Dashboard.js',
    './src/components/Exercise.js',
    './src/components/Feedback.js',
    './src/components/Tutorial.js'
  ];
  const jsonFiles = [
    './src/assets/data/exercises.json',
    './src/assets/data/i18n/en.json',
    './src/assets/data/i18n/es.json'
  ];

  // Load all scripts and JSON files
  Promise.all([...scripts.map(src => loadAndTranspileScript(src)), ...jsonFiles.map(src => loadJson(src))])
    .then(results => {
      console.log('All scripts and JSON loaded');
      // Assign JSON data to global variables
      window.exercisesData = results[scripts.length];
      window.en = results[scripts.length + 1];
      window.es = results[scripts.length + 2];

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
      console.error('Script/JSON loading failed:', err);
      document.getElementById('error').innerText = 'Failed to load app: ' + err.message;
      document.getElementById('error').classList.remove('hidden');
    });
} catch (e) {
  console.error('Failed to render React app:', e);
  document.getElementById('error').innerText = 'Failed to load app: ' + e.message;
  document.getElementById('error').classList.remove('hidden');
}
