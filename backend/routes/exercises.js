const router   = require('express').Router();
const auth     = require('../middleware/auth');
const Exercise = require('../models/Exercise');
const Day      = require('../models/Day');

// GET exercises for a day
router.get('/day/:dayId', auth, async (req, res) => {
  const day = await Day.findOne({ _id: req.params.dayId, user: req.userId });
  if (!day) return res.status(404).json({ message: 'Day not found' });
  const exercises = await Exercise.find({ day: req.params.dayId, user: req.userId }).sort('createdAt');
  res.json(exercises);
});

// GET all exercises (for progress page)
router.get('/all', auth, async (req, res) => {
  const exercises = await Exercise.find({ user: req.userId })
    .populate('day', 'name')
    .sort('-loggedAt');
  res.json(exercises);
});

// POST add exercise to a day
router.post('/', auth, async (req, res) => {
  try {
    const { dayId, name, sets, notes } = req.body;
    if (!dayId || !name) return res.status(400).json({ message: 'dayId and name required' });
    const day = await Day.findOne({ _id: dayId, user: req.userId });
    if (!day) return res.status(404).json({ message: 'Day not found' });
    const ex = await Exercise.create({
      user: req.userId,
      day: dayId,
      name,
      sets: sets || [],
      notes: notes || '',
    });
    res.status(201).json(ex);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update exercise
router.put('/:id', auth, async (req, res) => {
  const ex = await Exercise.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    { name: req.body.name, sets: req.body.sets, notes: req.body.notes },
    { new: true }
  );
  if (!ex) return res.status(404).json({ message: 'Not found' });
  res.json(ex);
});

// DELETE exercise
router.delete('/:id', auth, async (req, res) => {
  const ex = await Exercise.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!ex) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'Deleted' });
});

module.exports = router;
