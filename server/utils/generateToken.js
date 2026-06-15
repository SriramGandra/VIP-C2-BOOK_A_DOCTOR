const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'bookadoctorsupersecretkey12345', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

module.exports = generateToken;
