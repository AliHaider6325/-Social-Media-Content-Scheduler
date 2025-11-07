// const User = require('../models/User');
// const jwt = require('jsonwebtoken');

// exports.register = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;
//     const existing = await User.findOne({ email });

//     if (existing) return res.status(400).json({ message: 'Email already registered' });

//     const user = await User.create({ email, password });

//     res.status(201).json({ message: 'User registered successfully' });
//   } catch (err) { next(err); }
// };

// exports.login = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: 'Invalid credentials' });

//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

//     const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
//       expiresIn: process.env.JWT_EXPIRES_IN || '7d'
//     });

//     res.json({ token });
//   } catch (err) { next(err); }
// };

// exports.logout = async (req, res) => {
//   // client will remove token
//   res.json({ message: 'Logged out successfully' });
// };
