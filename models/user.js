const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');


var schema = new Schema({
  // 이름
  name: {type: String, required: true, trim: true},
  // 이메일
  email: {type: String, required: true, index: true, unique: true, trim: true},
  // 비밀번호
  password: {type: String},
  // 페이스북 정보
  facebook: {id: String, token: String, photo: String},
  // 만든 날짜
  createdAt: {type: Date, default: Date.now}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});

// 비밀번호 넣어줌
schema.methods.generateHash = function(password) {
  return bcrypt.hash(password, 10); // return Promise
};

// 비밀번호가 같은지 확인
schema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password); // return Promise
};

schema.plugin(mongoosePaginate);
var User = mongoose.model('User', schema);

module.exports = User;