const mongoose = require('mongoose');

const setSchema = new mongoose.Schema({
  reps:   { type: Number, default: 0 },
  weight: { type: Number, default: 0 },
}, { _id: false });

const exerciseSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  day:      { type: mongoose.Schema.Types.ObjectId, ref: 'Day',  required: true },
  name:     { type: String, required: true, trim: true },
  sets:     [setSchema],
  notes:    { type: String, default: '' },
  loggedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Exercise', exerciseSchema);
