const router   = require('express').Router();
const auth     = require('../middleware/auth');
const Day      = require('../models/Day');
const Exercise = require('../models/Exercise');

// GET all days for user
router.get('/', auth, async (req, res) => {
  const days = await Day.find({ user: req.userId }).sort('order');
  res.json(days);
});

// POST create day
router.post('/', auth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name required' });
    const count = await Day.countDocuments({ user: req.userId });
    const day = await Day.create({ user: req.userId, name, order: count });
    res.status(201).json(day);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT rename day
router.put('/:id', auth, async (req, res) => {
  const day = await Day.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    { name: req.body.name },
    { new: true }
  );
  if (!day) return res.status(404).json({ message: 'Not found' });
  res.json(day);
});

// DELETE day + its exercises
router.delete('/:id', auth, async (req, res) => {
  const day = await Day.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!day) return res.status(404).json({ message: 'Not found' });
  await Exercise.deleteMany({ day: req.params.id });
  res.json({ message: 'Deleted' });
});

module.exports = router;
