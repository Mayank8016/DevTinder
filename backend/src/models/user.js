const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const fail = (msg) => { throw new Error(msg); };

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true, minLength: 2, maxLength: 50 },
    lastName: { type: String, trim: true, maxLength: 50, default: '' },
    emailId: {
      type: String, lowercase: true, required: true, unique: true, trim: true,
      validate: (v) => validator.isEmail(v) || fail('Invalid email: ' + v),
    },
    password: { type: String, required: true, select: false },
    photoURL: {
      type: String, default: '',
      validate: (v) => !v || validator.isURL(v) || fail('Invalid photo URL'),
    },
    gender: { type: String, enum: { values: ['male', 'female', 'others'], message: '{VALUE} is not a valid gender' } },
    age: { type: Number, min: 18, max: 75 },
    about: { type: String, maxLength: 300, default: 'Dev is in search for someone here' },
    skills: {
      type: [String], default: [],
      validate: (v) => v.length <= 10 || fail('Max 10 skills allowed'),
    },
    isBot: { type: Boolean, default: false },
    botPersona: { type: String, select: false },
  },
  { timestamps: true }
);

userSchema.methods.getJWT = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};
userSchema.methods.validatePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};
userSchema.methods.toSafe = function () {
  const o = this.toObject();
  delete o.password;
  delete o.__v;
  return o;
};

module.exports = mongoose.model('User', userSchema);
