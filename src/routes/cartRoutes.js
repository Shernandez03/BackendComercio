const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

router.get('/:userId?', cartController.getCart);
router.post('/add', cartController.addItem);
router.put('/update', cartController.updateQuantity);
router.delete('/remove/:productId', cartController.removeItem);
router.delete('/clear/:userId?', cartController.clearCart);

module.exports = router;
