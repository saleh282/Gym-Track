const mongoose = require('mongoose');

const daySchema = new mongoose.Schema({
  user:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:  { type: String, required: true, trim: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Day', daySchema);
