const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Import routes
// app.use('/api/stores', require('./routes/storeRoutes'));
// app.use('/api/products', require('./routes/productRoutes'));
// app.use('/api/orders', require('./routes/orderRoutes'));

mongoose.connect('your-mongodb-connection-string')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

app.listen(5000, () => console.log('Server running on port 5000'));