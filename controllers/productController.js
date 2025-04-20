const Product = require('../models/product');
const Store = require('../models/store'); // Need to check if store exists
const mongoose = require('mongoose'); // Required for ObjectId validation

// @desc    Get products by store ID
// @route   GET /api/stores/:storeId/products
// @access  Public
exports.getProductsByStore = async (req, res) => {
    try {
        const products = await Product.find({ store: req.params.storeId });
        if (!products) {
            return res.status(404).json({ msg: 'No products found for this store' });
        }
        res.json(products);
    } catch (err) {
        console.error(err.message);
        // Handle potential invalid ObjectId format for storeId
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Store not found' });
        }
        res.status(500).send('Server Error');
    }
};

exports.createProductForStore = async (req, res) => {
    const { name, price } = req.body;
    const { storeId } = req.params;

     if (!name || price === undefined) {
        return res.status(400).json({ msg: 'Please provide name and price for the product' });
    }
     if (price < 0) {
        return res.status(400).json({ msg: 'Price cannot be negative' });
     }

    try {
        // 1. Check if the store exists
        const store = await Store.findById(storeId);
        if (!store) {
            return res.status(404).json({ msg: 'Store not found' });
        }

        // 2. Create the new product linked to the store
        const newProduct = new Product({
            name,
            price,
            store: storeId, // Link to the store using the ID from params
        });

        await newProduct.save();
        res.status(201).json(newProduct);

    } catch (err) {
        console.error(err.message);
         if (err.name === 'ValidationError') {
             return res.status(400).json({ msg: 'Validation Error', errors: err.errors });
        }
        // Handle potential invalid ObjectId format for storeId
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Store not found (invalid ID format)' });
        }
        res.status(500).send('Server Error');
    }
};

exports.updateProduct = async (req, res) => {
    const { storeId, productId } = req.params;
    const { name, price } = req.body;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(storeId) || !mongoose.Types.ObjectId.isValid(productId)) {
         return res.status(404).json({ msg: 'Invalid Store or Product ID format' });
    }

    // Build product object
    const productFields = {};
    if (name) productFields.name = name;
    if (price !== undefined) {
        if (price < 0) return res.status(400).json({ msg: 'Price cannot be negative' });
        productFields.price = price;
    }

    if (Object.keys(productFields).length === 0) {
         return res.status(400).json({ msg: 'Please provide name or price to update' });
    }

    try {
        // Find the product first to verify ownership
        let product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        // IMPORTANT: Check if the product belongs to the specified store
        if (product.store.toString() !== storeId) {
             return res.status(403).json({ msg: 'Forbidden: Product does not belong to this store' });
             // Or return 404 for obfuscation: return res.status(404).json({ msg: 'Product not found in this store' });
        }

        // Update the product
         product = await Product.findByIdAndUpdate(
            productId,
            { $set: productFields },
            { new: true, runValidators: true }
        );

        res.json(product);

    } catch (err) {
        console.error(err.message);
         if (err.name === 'ValidationError') {
             return res.status(400).json({ msg: 'Validation Error', errors: err.errors });
        }
        res.status(500).send('Server Error');
    }
};


// @desc    Delete a product
// @route   DELETE /api/stores/:storeId/products/:productId
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
    const { storeId, productId } = req.params;

     // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(storeId) || !mongoose.Types.ObjectId.isValid(productId)) {
         return res.status(404).json({ msg: 'Invalid Store or Product ID format' });
    }

    try {
         // Find the product first to verify ownership
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        // IMPORTANT: Check if the product belongs to the specified store
        if (product.store.toString() !== storeId) {
             return res.status(403).json({ msg: 'Forbidden: Product does not belong to this store' });
             // Or return 404: return res.status(404).json({ msg: 'Product not found in this store' });
        }

        // Delete the product
        await Product.findByIdAndDelete(productId);
        // Or: await product.deleteOne();

        res.json({ msg: `Product '${product.name}' deleted successfully` });

        // Note: Deleting a product generally does not affect existing orders,
        // as orders should capture the state at the time of purchase.

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
