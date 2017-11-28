const express = require('express');
var Eventcard = require('../models/eventcard');
var User  = require('../models/user');
const Answer = require('../models/answer'); 
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
  console.log("postpost");
  var eventcard = new Eventcard({
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
  eventcard.user_id = req.user.id;
  await eventcard.save();
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
  const answers = await Answer.find({eventcard: eventcard.id}).populate('author');
  eventcard.numReads++;    // TODO: 동일한 사람이 본 경우에 Read가 증가하지 않도록???

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
  //eventcard.tags = req.body.tags.split(" ").map(e => e.trim());

  await eventcard.save();
  req.flash('success', 'Successfully updated');
  res.redirect('/eventcards');
}));

// 사용자 삭제
router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
  await Eventcard.findOneAndRemove({_id: req.params.id});
  req.flash('success', 'Successfully deleted');
  res.redirect('/eventcards');
}));

// // 이벤트 생성
// router.post('/', needAuth, catchErrors(async (req, res, next) => {
//   const user = req.user;
//   var eventcard = new Eventcard({
//     title: req.body.title,
//     author: user._id,
//     content: req.body.content,
//     //tags: req.body.tags.split(" ").map(e => e.trim()),
//   });
//   await eventcard.save();
//   req.flash('success', 'Successfully posted');
//   res.redirect('/eventcards');
// }));

router.post('/:id/answers', needAuth, catchErrors(async (req, res, next) => {
  const user = req.user;
  const eventcard = await Eventcard.findById(req.params.id);

  if (!eventcard) {
    req.flash('danger', 'Not exist event');
    return res.redirect('back');
  }
// 후기 남기기.
  var answer = new Answer({
    author: user._id,
    eventcard: eventcard._id,
    content: req.body.content
  });
  await answer.save();
  eventcard.numAnswers++;
  await question.save();
  
  req.flash('success', 'Successfully answered');
  res.redirect(`/eventcards/${req.params.id}`);
}));



module.exports = router;
