const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    // Reference to the store this product belongs to
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'store', // Links to the Store model
        required: true,
    },
    // Add category (Fruit/Vegetable) if needed
    // category: { type: String, enum: ['Fruit', 'Vegetable'], required: false }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);