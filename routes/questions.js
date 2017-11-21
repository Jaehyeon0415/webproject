const express = require('express');
const Question = require('../models/question');
const Answer = require('../models/answer'); 
const catchErrors = require('../lib/async-error');

const router = express.Router();

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
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  var query = {};
  const term = req.query.term;
  if (term) {
    query = {$or: [
      {title: {'$regex': term, '$options': 'i'}},
      {content: {'$regex': term, '$options': 'i'}}
    ]};
  }
  const questions = await Question.paginate(query, {
    sort: {createdAt: -1}, 
    populate: 'author', 
    page: page, limit: limit
  });
  res.render('questions/index', {questions: questions, term: term, query: req.query});
}));

// 이벤트 작성
router.get('/new', needAuth, (req, res, next) => {
  res.render('questions/new', {question: {}});
});

// 이벤트 post
router.post('/save',needAuth,catchErrors(async (req , res ,next) =>{
  // 이미지를 console.log로 출력해본다
  var user_obj = await User.findById(req.user.id);
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files){
      console.log(files);
      // var url;
      // const S3_Bucket = 'jibang';
      // const img_name = files.roomimg.name;
      const UserId = req.user.id;

      // if(img_name != ''){
      //     // 이미지 업로드
      //     var s3 = new AWS.S3();
      //     var params = {
      //          Bucket: S3_Bucket,
      //          Key:img_name,
      //          ACL:'public-read',
      //          Body: require('fs').createReadStream(files.roomimg.path)
      //     }
      //     s3.upload(params, function(err, data){
      //          var result='';
      //          if(err)
      //             // result = 'Fail';
      //             console.log(err);
      //          else
      //             console.log(data);
      //     });
      //     // 업로드 된 이미지 URL가지고 오기
      //     url = `https://${S3_Bucket}.s3.amazonaws.com/${img_name}`;    
      // }else{
      //     url = "#";
      // }
      
      // 방 내용 디비에 업로드
      User.findById(UserId, function(err,user){
          var newQuestion = Question({
              author:user_obj,
              title:fields.title,
              content1:fields.content1,
              group_name:fields.group_name,
              content2:fields.content2,
              date:fields.date,
              locate:fields.locate,
              img:url,
              //img_key:img_name
          });
         
      
          newQuestion.save(function(err) {
              if (err) {
                  return next(err);
              } else {
                  res.redirect('/');
              }
          });
      });
  });
}));
// 회원정보 수정
router.get('/:id/edit', needAuth, catchErrors(async (req, res, next) => {
  const question = await Question.findById(req.params.id);
  res.render('questions/edit', {question: question});
}));

// 후기 작성
router.get('/:id', catchErrors(async (req, res, next) => {
  const question = await Question.findById(req.params.id).populate('author');
  const answers = await Answer.find({question: question.id}).populate('author');
  question.numReads++;    // TODO: 동일한 사람이 본 경우에 Read가 증가하지 않도록???

  await question.save();
  res.render('questions/show', {question: question, answers: answers});
}));

// 
router.put('/:id', catchErrors(async (req, res, next) => {
  const question = await Question.findById(req.params.id);

  if (!question) {
    req.flash('danger', 'Not exist question');
    return res.redirect('back');
  }
  question.title = req.body.title;
  question.content = req.body.content;
  question.tags = req.body.tags.split(" ").map(e => e.trim());

  await question.save();
  req.flash('success', 'Successfully updated');
  res.redirect('/questions');
}));

// 사용자 삭제
router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
  await Question.findOneAndRemove({_id: req.params.id});
  req.flash('success', 'Successfully deleted');
  res.redirect('/questions');
}));

// 이벤트 생성
router.post('/', needAuth, catchErrors(async (req, res, next) => {
  const user = req.user;
  var question = new Question({
    title: req.body.title,
    author: user._id,
    content: req.body.content,
    tags: req.body.tags.split(" ").map(e => e.trim()),
  });
  await question.save();
  req.flash('success', 'Successfully posted');
  res.redirect('/questions');
}));

router.post('/:id/answers', needAuth, catchErrors(async (req, res, next) => {
  const user = req.user;
  const question = await Question.findById(req.params.id);

  if (!question) {
    req.flash('danger', 'Not exist question');
    return res.redirect('back');
  }
// 후기 남기기.
  var answer = new Answer({
    author: user._id,
    question: question._id,
    content: req.body.content
  });
  await answer.save();
  question.numAnswers++;
  await question.save();
  
  req.flash('success', 'Successfully answered');
  res.redirect(`/questions/${req.params.id}`);
}));



module.exports = router;
