require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../frontend')));

app.use('/api/auth',      require('./routes/auth'));
app.use('/api/days',      require('./routes/days'));
app.use('/api/exercises', require('./routes/exercises'));

app.get('*', (req, res) =>
res.sendFile(path.join(__dirname, '../../frontend/index.html'))
);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 Server → http://localhost:${process.env.PORT || 5000}`)
    );
  })
  .catch(err => console.error('MongoDB error:', err));
