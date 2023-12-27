const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messagesC');


//Send messages
router.post('/send-message', messageController.verifyToken, messageController.sendMessage);
//get received message
router.get('/received-messages', messageController.verifyToken, messageController.getReceivedMessages);



module.exports = router;

