const router = require('express').Router();
const jwt    = require('jsonwebtoken');
const User   = require('../models/User');

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields required' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password });
    res.status(201).json({ token: sign(user._id), name: user.name });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(400).json({ message: 'Invalid email or password' });
    res.json({ token: sign(user._id), name: user.name });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
