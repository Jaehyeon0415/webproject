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

// 수정하는 페이지
router.get('/:id/edit', needAuth ,catchErrors(async (req, res, next) => {
  console.log(req.params.id);
  const eventcard = await Eventcard.findById(req.params.id);
  res.render("eventcards/edit",{eventcard : eventcard});      
}));

// 수정한 것을 바꾸주는 페이지
router.put('/:id', needAuth ,catchErrors( async (req,res, next) => {
  const eventcard = await Eventcard.findById(req.params.id);

  eventcard.title = req.body.title,
  eventcard.content1 = req.body.content1,
  eventcard.group_name = req.body.group_name,
  eventcard.content2 = req.body.content2,
  eventcard.date = req.body.date,
  eventcard.start_time = req.body.start_time,
  eventcard.finish_time = req.body.finish_time,
  eventcard.locate = req.body.locate,
  eventcard.img = req.body.img

  await eventcard.save();
  req.flash('success','Success update.');
  res.redirect('/mypage');
}));

// eventcard의 정보를 지움 
router.delete('/:id' , needAuth ,catchErrors( async (req,res, next) =>{
  // 후기 댓글을 지움
  //await After.find({room_id : req.params.id}).remove();  
 
  var eventcard = await Eventcard.findById(req.params.id);

  Eventcard.findOneAndRemove({_id: req.params.id}, function(err) {
      if (err) {
        return next(err);
      }
      req.flash('success', 'Delete eventcard.');
      res.redirect('/mypage');
  });
}));
module.exports = router;