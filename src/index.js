const express = require('express');
const helmet = require('helmet');

// The API's version
const VERSION = '1.0';
const NAME = 'Lester';
// This either uses the port assigned by Heroku or sets the port to 5000.
const PORT = process.env.PORT || 5000;
// See the README for directions on how to bind the key as an env variable on your machine.

// Set up the express app
const app = express();

// Add helmet security.
app.use(helmet());
app.use(require('./routes.js'));

app.listen(PORT, () => {
  // Confirms successful server start.
  console.log('\x1b[7m', `${NAME}(v${VERSION}) has started.`, '\x1b[0m');
  console.log(`${NAME} is now accepting requests on port: ${PORT}`);
});

module.exports.VERSION = VERSION;
module.exports.PORT = PORT;
module.exports.NAME = NAME;
