const jwt = require('jsonwebtoken');

const generateToken = (userId, email) => {
  const payload = { email, userId };

  const now = Math.floor(Date.now() / 1000); 
  const twoYearsInSeconds = 2 * 365 * 24 * 60 * 60; 
  const exp = now + twoYearsInSeconds;

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2y' }); 
  return token;
};

const userId = '67219a3afc514082f834ec3f';
const email = 'john.doe@example.com';
const token = generateToken(userId, email);
console.log('Generated Token:', token);



const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Unauthorized: Token has expired.' });
      }
      console.error('JWT Verification Error:', err.message);
      return res.status(401).json({ error: 'Unauthorized: Invalid token.' });
    }

    req.auth = decoded;
    next();
  });
};

module.exports = verifyToken;
