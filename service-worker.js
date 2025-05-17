const CACHE_NAME = 'cyberlab-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/styles.css',
  '/src/index.js',
  '/src/App.js',
  '/src/components/Dashboard.js',
  '/src/components/Exercise.js',
  '/src/components/Feedback.js',
  '/src/components/Tutorial.js',
  '/src/assets/data/exercises.json',
  '/src/assets/data/i18n/en.json',
  '/src/assets/data/i18n/es.json',
  '/favicon.ico',
  '/manifest.json',
  'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css',
  'https://cdn.jsdelivr.net/npm/react@17.0.2/umd/react.development.js',
  'https://cdn.jsdelivr.net/npm/react-dom@17.0.2/umd/react-dom.development.js',
  'https://cdn.jsdelivr.net/npm/@babel/standalone@7.24.7/babel.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.error('Cache open failed:', err))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request).catch(err => {
        console.error('Fetch failed:', err);
        return new Response('Offline', { status: 503 });
      }))
  );
});