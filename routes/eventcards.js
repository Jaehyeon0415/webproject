const express = require('express');
var Eventcard = require('../models/eventcard');
var User  = require('../models/user');
const Answer = require('../models/answer');
const Register = require('../models/register');
const catchErrors = require('../lib/async-error');
var formidable = require('formidable');
var bodyParser = require('body-parser');

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));

// 나중에 정보 수정
// var AWS = require('aws-sdk');
// AWS.config.region = 'ap-northeast-2';

// AWS.config.update({
//     accessKeyId: "AKIAJ2PHON3I3WMHN2VQ",
//     secretAccessKey: "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",
//     region: 'ap-northeast-2'
// });

// 동일한 코드가 users.js에도 있습니다.
function needAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash('danger', 'Please signin first.');
    res.redirect('/signin');
  }
}

/* GET questions listing. */
// event들이 나오는 페이지.
router.get('/', catchErrors(async (req, res, next) => {
  var eventcards = await Eventcard.find({})
  console.log(eventcards)
  res.render('eventcards/index', {eventcards : eventcards});
}));

// 이벤트 작성
router.get('/new', needAuth, (req, res, next) => {
  res.render('eventcards/new', {eventcard: {}});
});

// 이벤트 post
router.post('/save',needAuth,catchErrors(async (req , res ,next) =>{
  //console.log("postpost");
  var eventcard = new Eventcard({
    //author: req.user.id,
    title : req.body.title,
    content1 : req.body.content1,
    group_name : req.body.group_name,
    content2 : req.body.content2,
    date : req.body.date,
    start_time : req.body.start_time,
    finish_time : req.body.finish_time,
    locate : req.body.locate,
    img : req.body.img
  });
  eventcard.author = req.user.id;
  await eventcard.save();
  req.flash('success', 'Successfully updated');
  res.redirect('/');
 }));

// 이벤트 편집
router.get('/:id/edit', needAuth, catchErrors(async (req, res, next) => {
  const eventcard = await Eventcard.findById(req.params.id);
  res.render('eventcards/edit', {eventcard: eventcard});
}));

// 이벤트 세부 정보
router.get('/:id', catchErrors(async (req, res, next) => {
  const eventcard = await Eventcard.findById(req.params.id).populate('author');
  const answers = await Answer.find({eventcard_id : eventcard._id}).populate('author');

  await eventcard.save();
  res.render('eventcards/show', {eventcard: eventcard, answers: answers});
}));

// 
router.put('/:id', catchErrors(async (req, res, next) => {
  const eventcard = await Eventcard.findById(req.params.id);

  if (!eventcard) {
    req.flash('danger', 'Not exist question');
    return res.redirect('back');
  }
  eventcard.title = req.body.title;
  eventcard.content = req.body.content;
  

  await eventcard.save();
  req.flash('success', 'Successfully updated');
  res.redirect('/eventcards');
}));

// 이벤트 삭제
router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
  
  var eventcard = await Eventcard.findById(req.params.id);
  await Answer.findOneAndRemove({author : eventcard._id});
  await eventcard.remove();
  req.flash('success', 'Successfully deleted');
  res.redirect('/eventcards');
}));

// 이벤트 참가
router.post('/:id', needAuth, catchErrors(async (req,res,next) => {
  const user = req.user;
  const eventcard = await Eventcard.findById(req.params.id);

  if (!eventcard){
    req.flash('danger', 'Not exist event');
    return res.redirect('back');
  }
  
  // var register = await Register.findOne({author:register._id});
  //   console.log('!!!@!@!@!@!@', register);
  //   if (register){
  //     req.flash('danger', 'Already register.');
  //     return res.redirect('back');
  // }
  var register = new Register({
    author: user,
    eventcard: eventcard.id,
  });
  await register.save();
  req.flash('success', 'Successfully register');
  res.redirect('back');
}));

router.post('/', catchErrors(async (req, res, next) => {
  
  var err = validateForm(req.body, {needPassword: true});
  
  if (err) {
    req.flash('danger', err);
    return res.redirect('back');
  }
  var user = await User.findOne({email: req.body.email});
  console.log('USER???', user);
  if (user) {
    req.flash('danger', 'Email address already exists.');
    return res.redirect('back');
  }
  user = new User({
    name: req.body.name,
    email: req.body.email,
  });
  
  await user.save();
  req.flash('success', 'Registered successfully. Please sign in.');
  res.redirect('/');
}));

// 후기 남기기
router.post('/:id/answers', needAuth, catchErrors(async (req, res, next) => {
  const user = req.user;
  const eventcard = await Eventcard.findById(req.params.id);

  if (!eventcard) {
    req.flash('danger', 'Not exist event');
    return res.redirect('back');
  }

  var answer = new Answer({
    author: user,
    eventcard_id: eventcard.id,
    content: req.body.content
  });
  await answer.save();
  req.flash('success', 'Successfully answered');
  res.redirect('back');
}));



module.exports = router;
