import jwt from 'jsonwebtoken';

// Short-lived tokens (1 day) minimise exposure window if a token is stolen.
// For longer sessions, implement a refresh-token mechanism.
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '1d',
  });
};

export default generateToken;
