const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    price: { // Store the price at the time of order
        type: Number,
        required: true,
    }
}, { _id: false }); // Don't create separate _id for subdocuments

const orderSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        trim: true,
    },
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'store',
        required: true,
    },
    items: [orderItemSchema], // Array of items in the order
    totalAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    orderDate: {
        type: Date,
        default: Date.now,
    },
    // status: { type: String, enum: ['Placed', 'Processing', 'Delivered', 'Cancelled'], default: 'Placed' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);