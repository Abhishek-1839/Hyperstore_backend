const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    location: {
        type: String,
        required: true,
        trim: true,
    },
    // We can add more details later like opening hours, coordinates etc.
}, { timestamps: true }); // Adds createdAt and updatedAt automatically

module.exports = mongoose.model('Store', storeSchema);