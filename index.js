const bodyParser = require('body-parser');
const config = require('config');
const express = require('express');
const morgan = require('morgan');

const isProduction = (process.env.NODE_ENV === 'production');

// Creation and configuration of express server
let app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Add API routes
require('./api/routes')(app);

app.use(express.static(__dirname + '/public'));

app.get("*", function(req, res) {
  res.sendFile(__dirname + '/app/index.html')
});

const port = config.get('server.port');

app.listen(port, function(error) {
  if (error) {
    console.error(error);
  } else {
    console.info("==> API server listening on port %s", port);
  }
});

if (process.pid) {
  console.log('This process is your pid ' + process.pid);
}