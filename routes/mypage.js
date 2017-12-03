var express = require('express');
var User = require('../models/user');
var Eventcard = require('../models/eventcard');
const catchErrors = require('../lib/async-error');

var router = express.Router();


function needAuth(req, res, next) {
    if (req.isAuthenticated()) {
      next();
    } else {
      req.flash('danger', 'Please signin first.');
      res.redirect('/signin');
    }
}

// mypage index페이지
router.get('/', needAuth , catchErrors(async (req, res, next) => {
    eventcards = await Eventcard.find({ author :  req.user.id });
    res.render('users/mypage');
}));

module.exports = router;