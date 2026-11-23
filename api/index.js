// Vercel serverless entry point: export the Express app (server.js only
// listens when run directly with `node server.js`).
const app = require('../server');

module.exports = app;
