# Cybersecurity Virtual Lab

A web-based virtual lab for cybersecurity exercises tailored for uniformed personnel, hosted on GitHub Pages.

## Directory Structure
```
cybersecurity-lab/
├── index.html
├── manifest.json
├── favicon.ico
├── service-worker.js
├── .nojekyll
├── build.sh
├── package.json
├── .gitignore
├── README.md
├── src/
│   ├── styles.css
│   ├── index.js
│   ├── App.js
│   ├── components/
│   │   ├── Dashboard.js
│   │   ├── Exercise.js
│   │   ├── Feedback.js
│   │   └── Tutorial.js
│   └── assets/
│       └── data/
│           ├── exercises.json
│           ├── i18n/
│           │   ├── en.json
│           │   └── es.json
└── dist/ (created after build)
```

## Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/cybersecurity-lab.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run locally:
   ```bash
   npm start
   ```
4. Build for production:
   ```bash
   npm run build
   ```
5. Serve locally for testing:
   ```bash
   npm run serve
   ```

## Deployment to GitHub Pages
1. Install `gh-pages`:
   ```bash
   npm install --save-dev gh-pages
   ```
2. Build and deploy:
   ```bash
   chmod +x build.sh
   ./build.sh
   ```
3. Enable GitHub Pages in repository settings, selecting the `gh-pages` branch.
4. Access the lab at `https://<your-username>.github.io/cybersecurity-lab`.

## Troubleshooting
- **404 Errors**: Ensure all files are in the correct paths as per the directory structure. Verify paths in `index.html` and `service-worker.js`.
- **MIME Type Error**: Use `npm start` or `npm run serve` for local testing. Avoid opening `index.html` directly in the browser.
- **Blank Page**: Check the browser console (F12) for errors. Ensure the service worker registers successfully and React loads.
- **Service Worker Failure**: Clear browser cache or disable the service worker temporarily by commenting out the registration in `index.html` (lines 63-72) for testing.

## Maintenance
- Add new exercises in `src/assets/data/exercises.json`.
- Update translations in `src/assets/data/i18n/`.
- Ensure CDN dependencies are up-to-date.

## License
MIT