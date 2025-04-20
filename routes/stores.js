const express = require('express');
const router = express.Router();
const {
    getAllStores,
    createStore,
    updateStore,  // Added
    deleteStore   // Added
} = require('../controllers/storeController');

const {
    getProductsByStore,
    createProductForStore,
    updateProduct, // Added
    deleteProduct  // Added
} = require('../controllers/productController');



// GET all stores
router.get('/all', getAllStores);
router.post('/', createStore); // Added route


router.route('/:storeId')
    .put(updateStore)      // PUT /api/stores/:storeId
    .delete(deleteStore);


// GET products for a specific store
router.get('/:storeId/products', getProductsByStore);
router.post('/:storeId/products', createProductForStore); // Added route



router.route('/:storeId/products/:productId')
    .put(updateProduct)            // PUT /api/stores/:storeId/products/:productId
    .delete(deleteProduct);        // DELETE /api/stores/:storeId/products/:productId


    
module.exports = router;