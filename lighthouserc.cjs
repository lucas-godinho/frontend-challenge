module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run preview -- --host 127.0.0.1',
      startServerReadyPattern: 'Local:',
      startServerReadyTimeout: 30000,
      url: ['http://127.0.0.1:4173/', 'http://127.0.0.1:4173/nft/orbital-01'],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        chromeFlags: '--no-sandbox --disable-dev-shm-usage --disable-extensions',
      },
    },
    assert: { preset: 'lighthouse:recommended' },
    upload: { target: 'filesystem', outputDir: './artifacts/lighthouse/desktop' },
  },
}
