var express = require('express');
var router = express.Router();
const catchErrors = require('../lib/async-error');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

/*
router.get('/', catchErrors(async (req, res, next) => {
  const cards = await Question.find({});
  console.log(cards);
  res.render("index", {cards : cards});
}));
*/

module.exports = router;
