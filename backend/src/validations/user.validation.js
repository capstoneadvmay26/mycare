// Validates registration payload fields before passing data to the controller
const validateRegister = (req, res, next) => {
  const { name, email, password, otp } = req.body;

  if (!name || !email || !password || !otp) {
    return res.status(400).json({ message: 'Name, email, password, and OTP are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }

  next();
};

// Validates login payload fields
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
};