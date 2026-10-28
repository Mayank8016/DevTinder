const validator = require('validator');

const validateSignupData = (req) => {
  const { firstName, emailId, password } = req.body;
  if (!firstName || firstName.trim().length < 2) throw new Error('Enter a valid first name');
  if (!emailId || !validator.isEmail(emailId)) throw new Error('Enter a valid Email ID');
  if (!password || !validator.isStrongPassword(password))
    throw new Error('Password must be 8+ chars with upper, lower, number and symbol');
};

const EDITABLE = ['firstName', 'lastName', 'photoURL', 'gender', 'age', 'about', 'skills'];
const validateEditProfile = (req) => Object.keys(req.body).every((k) => EDITABLE.includes(k));

module.exports = { validateSignupData, validateEditProfile };
