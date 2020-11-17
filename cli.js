const fs = require('fs');

const createBadges = require('./core');
const badges = require('./manifest.json');

(async() => {
  try {
    fs.rmSync('./badges', { recursive: true, force: true });

    for (const badge of badges) {
      await createBadges(badge);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})()
