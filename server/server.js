require('dotenv').config();

const express   = require('express');
const cors      = require('cors');
const connectDB = require('./db');
const routes    = require('./routes');

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api', routes);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Portfolio API server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
