const Store = require('../models/store');
const Product = require('../models/product'); // Needed if deleting a store requires deleting its products
const mongoose = require('mongoose'); // Required for ObjectId validation


// @desc    Get all stores
// @route   GET /api/stores
// @access  Public
exports.getAllStores = async (req, res) => {
    try {
        const stores = await Store.find();
        res.json(stores);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.createStore = async (req, res) => {
    const { name, location } = req.body;

    if (!name || !location) {
        return res.status(400).json({ msg: 'Please provide name and location for the store' });
    }

    try {
        // Optional: Check if store with the same name/location already exists
        let store = await Store.findOne({ name, location });
        if (store) {
            return res.status(400).json({ msg: 'Store already exists with this name and location' });
        }

        store = new Store({
            name,
            location,
        });

        await store.save();
        res.status(201).json(store);

    } catch (err) {
        console.error(err.message);
         if (err.name === 'ValidationError') {
             return res.status(400).json({ msg: 'Validation Error', errors: err.errors });
        }
        res.status(500).send('Server Error');
    }
};


exports.updateStore = async (req, res) => {
    const { name, location } = req.body;
    const { storeId } = req.params;

    // Basic validation for ObjectId
    if (!mongoose.Types.ObjectId.isValid(storeId)) {
        return res.status(404).json({ msg: 'Store not found (invalid ID format)' });
    }

    // Build store object based on fields submitted
    const storeFields = {};
    if (name) storeFields.name = name;
    if (location) storeFields.location = location;

    if (Object.keys(storeFields).length === 0) {
         return res.status(400).json({ msg: 'Please provide name or location to update' });
    }

    try {
        let store = await Store.findById(storeId);

        if (!store) {
            return res.status(404).json({ msg: 'Store not found' });
        }

        // Update using findByIdAndUpdate for atomicity and returning updated doc
        store = await Store.findByIdAndUpdate(
            storeId,
            { $set: storeFields },
            { new: true, runValidators: true } // Return updated doc, run schema validators
        );

        res.json(store);

    } catch (err) {
        console.error(err.message);
         if (err.name === 'ValidationError') {
             return res.status(400).json({ msg: 'Validation Error', errors: err.errors });
        }
        res.status(500).send('Server Error');
    }
};

// @desc    Delete a store and its associated products
// @route   DELETE /api/stores/:storeId
// @access  Private/Admin
exports.deleteStore = async (req, res) => {
     const { storeId } = req.params;

     // Basic validation for ObjectId
    if (!mongoose.Types.ObjectId.isValid(storeId)) {
        return res.status(404).json({ msg: 'Store not found (invalid ID format)' });
    }

    try {
        const store = await Store.findById(storeId);

        if (!store) {
            return res.status(404).json({ msg: 'Store not found' });
        }

        // Strategy: Delete associated products before deleting the store
        const deleteResult = await Product.deleteMany({ store: storeId });
        console.log(`Deleted ${deleteResult.deletedCount} products associated with store ${storeId}`);

        // Now delete the store itself
        await Store.findByIdAndDelete(storeId);
        // Or: await store.deleteOne(); // If using the store object fetched earlier

        res.json({ msg: `Store '${store.name}' and ${deleteResult.deletedCount} associated products deleted successfully` });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};