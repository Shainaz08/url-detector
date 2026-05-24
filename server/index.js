const express = require('express');
const cors = require('cors');
require('dotenv').config();

const analyzeRoute = require('./routes/analyze');

const app = express();
app.use(cors({
  origin: ['https://url-detector-ten.vercel.app', 'http://localhost:5173', 'http://localhost:5174']
}));app.use(express.json());

app.use('/api', analyzeRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
