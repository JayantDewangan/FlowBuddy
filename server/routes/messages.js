const express = require('express');
const router = express.Router();
const { 
  sendMessage, 
  getChatHistory, 
  getConversations, 
  getIncomingMessages,
  markAsRead 
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', sendMessage);
router.get('/history/:partnerId', getChatHistory);
router.get('/conversations', getConversations);
router.get('/incoming', getIncomingMessages);
router.patch('/:id', markAsRead);

module.exports = router;
