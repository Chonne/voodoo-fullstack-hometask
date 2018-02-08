const express = require('express');
const router = express.Router();
const dataParser = require('./data-parser');

/* GET filtered and processed data. */
router.get('/data', function(req, res, next) {
  // todo: send the response here, don't pass it to dataParser
  dataParser(req.query, res);
  // res.send('ok');
});

module.exports = router;
