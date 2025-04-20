const express = require ("express");
const bodyparser =require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require('./config/db');


const cors = require("cors");
dotenv.config();


const app = express();
app.use(express.json({ extended: false }));
app.use(cors());
app.use(bodyparser.json());
const port = 3000;
app.get('/api', (req, res) => res.send('API Running')); // Simple check
app.use('/api/stores', require('./routes/stores'));
app.use('/api/orders', require('./routes/order'));
// app.use('/api/products', require('./routes/products'));
connectDB();
app.listen(port, (err) => {
  if (!err) {
    console.log(`Server is running on port ${port}`);
  } else {
    console.error("Error starting server:", err);
  }
});