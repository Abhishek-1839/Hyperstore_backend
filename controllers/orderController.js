const Order = require('../models/order');
const Product = require('../models/product'); // To validate product IDs and prices
const Store = require('../models/store'); // To validate store ID
const mongoose = require('mongoose');



// @desc    Create new order
// @route   POST /api/orders
// @access  Public
exports.createOrder = async (req, res) => {
    console.log('Received /api/orders POST request body:', JSON.stringify(req.body, null, 2));

    const { userName, storeId, items, totalAmount } = req.body;

    if (!userName || !storeId || !items || !Array.isArray(items) || items.length === 0 ) {  
        // || totalAmount === undefined || totalAmount < 0
        console.error('Order validation failed:', { userName, storeId, items_type: typeof items, items_isArray: Array.isArray(items), items_length: items?.length, totalAmount });
        let errorMsg = 'Please provide all required fields: userName, storeId, a non-empty items array, and a valid totalAmount.';
        if (items && !Array.isArray(items)) {
            errorMsg = 'Validation Error: The "items" field must be an array.';
        } else if (items && items.length === 0) {
             errorMsg = 'Validation Error: The "items" array cannot be empty.';
        }
        return res.status(400).json({ msg: errorMsg });
    }
     // Validate Store ID format early
     if (!mongoose.Types.ObjectId.isValid(storeId)) {
        return res.status(400).json({ msg: 'Invalid Store ID format' });
    }


    try {
        // Validate Store existence (optional but good practice)
        const storeExists = await Store.findById(storeId);
        if (!storeExists) {
            return res.status(404).json({ msg: 'Store not found' });
        }

        // More robust validation (optional):
        // 1. Verify product IDs exist and belong to the specified store.
        // 2. Recalculate total amount on the backend to prevent tampering.
        // For simplicity, we'll trust the frontend calculation for now, but store the individual prices.
        const orderItems = items.map(item => {
            // Check the structure of each item coming from the frontend
            if (!item || !item.product || !item.product._id || !item.product.price === undefined || item.quantity === undefined || item.quantity <= 0) {
                console.error('Invalid item structure in order:', item);
                // Throw error to be caught by the main catch block
                throw new Error(`Invalid item structure/quantity found in order: ${JSON.stringify(item)}`);
            }
            // Validate Product ID format
             if (!mongoose.Types.ObjectId.isValid(item.product._id)) {
                throw new Error(`Invalid Product ID format in order item: ${item.product._id}`);
            }

            return {
                product: item.product._id,    // Use the _id from the nested product object
                quantity: parseInt(item.quantity, 10), // Ensure quantity is an integer
                price: item.product.price     // Use the price from the nested product object
            };
        });

        const calculatedTotal = orderItems.reduce((sum, item) => {
            // We stored price in orderItems, use it
            return sum + (item.price * item.quantity);
       }, 0);

       // Be lenient with small floating point differences if necessary, or compare strictly
       if (Math.abs(calculatedTotal - totalAmount) > 0.01) { // Allow for small diffs
            console.warn(`Total amount mismatch. Frontend: ${totalAmount}, Backend calculated: ${calculatedTotal}. Using backend calculated total.`);
            // Decide: reject or use backend total? Let's use backend total for robustness.
            // return res.status(400).json({ msg: `Total amount mismatch. Expected ${calculatedTotal}` });
       }

        const newOrder = new Order({
            userName,
            store: storeId,
            items: orderItems,
            totalAmount: calculatedTotal // Use backend calculated total
        });

        const order = await newOrder.save();
        console.log('Order saved successfully:', order._id);
        res.status(201).json(order);

    } catch (err) {
        console.error(err.message);
         // Handle potential validation errors or invalid ObjectIds
        if (err.name === 'ValidationError') {
             return res.status(400).json({ msg: 'Validation Error', errors: err.errors });
        }
        if (err.kind === 'ObjectId') {
             return res.status(404).json({ msg: 'Invalid Store or Product ID' });
        }
        res.status(500).send('Server Error');
    }
};