const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

var schema = new Schema({
  // 작성자
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  // 제목
  title: {type: String, trim: true, required: true},
  // 상세 설명
  content1: {type: String, trim: true, required: true},
  //등록 조직 이름
  group_name: {type: String, trim: true, required: true},
  // 등록 조직 설명
  content2: {type: String, trim: true},
  // 날짜
  date: {type: String, trim: true, required: true},
  // 시작 시간
  start_time: {type: String, trim: true, required: true},
  // 끝나는 시간
  finish_time: {type: String, trim: true, required: true},
  // 장소
  locate:{type: String, trim: true, required: true},
  tags: [String],
  // 이미지
  img: [String],

  numLikes: {type: Number, default: 0},
  numAnswers: {type: Number, default: 0},
  numReads: {type: Number, default: 0},
  
  // 작성 시간
  createdAt: {type: Date, default: Date.now}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});
schema.plugin(mongoosePaginate);
var Eventcard = mongoose.model('Eventcard', schema);

module.exports = Eventcard;
