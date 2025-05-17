try {
  const React = window.React;
  const ReactDOM = window.ReactDOM;

  ReactDOM.render(<App />, document.getElementById('root'));
} catch (e) {
  console.error('Failed to render React app:', e);
  document.getElementById('error').innerText = 'Failed to load app: ' + e.message;
  document.getElementById('error').classList.remove('hidden');
}
