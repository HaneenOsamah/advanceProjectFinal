const connection = require('../model/database');
/////////////////////////////////////////////////////////////////////

const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Specify the destination for uploaded files
const bcrypt = require('bcrypt');
const app = express();
const axios = require('axios');
const port = 3099;
const jwt = require('jsonwebtoken');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



exports.verifyToken = (req, res, next) => 
{
    const token = req.headers['authorization'];
  
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: Token is missing' });
    }
  
    jwt.verify(token, 'your-secret-key', (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
      }
  
      req.userId = decoded.userId;
      next();
    });
  };

exports.sendMessage = (req, res) => {
    const senderId = req.userId;
    const { receiverEmail, message } = req.body;
  
    // Check if the sender is logged in
    if (!senderId) {
      return res.status(401).json({ message: 'Unauthorized: Sender is not logged in' });
    }
  
    // Fetch the recipient's userId based on email
    const getRecipientQuery = 'SELECT id FROM users WHERE email = ?';
  
    connection.query(getRecipientQuery, [receiverEmail], (getRecipientError, recipientResult) => {
      if (getRecipientError) {
        console.error('Error fetching recipient details:', getRecipientError);
        res.status(500).json({ message: 'Internal Server Error' });
        return;
      }
  
      if (recipientResult.length === 0) {
        return res.status(404).json({ message: 'Recipient not found' });
      }
  
      const receiverId = recipientResult[0].id;
  
      // Insert the message into the database
      const insertMessageQuery = 'INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)';
  
      connection.query(insertMessageQuery, [senderId, receiverId, message], (insertError, insertResults) => {
        if (insertError) {
          console.error('Error inserting message:', insertError);
          res.status(500).json({ message: 'Internal Server Error' });
          return;
        }
  
        res.json({ message: 'Message sent successfully' });
      });
    });
  };



  exports.getReceivedMessages = (req, res) => {
    const receiverId = req.userId;
  
    if (!receiverId) {
      return res.status(401).json({ message: 'Unauthorized: Receiver is not logged in' });
    }
  
    const fetchMessagesQuery =
      'SELECT  messages.message, messages.sender_id ' +
      'FROM messages ' +
      'WHERE messages.receiver_id = ?';
  
    connection.query(fetchMessagesQuery, [receiverId], (fetchError, messages) => {
      if (fetchError) {
        console.error('Error fetching received messages:', fetchError);
        res.status(500).json({ message: 'Internal Server Error' });
        return;
      }
  
      const senderIds = messages.map(message => message.sender_id);
      const fetchSenderEmailsQuery = 'SELECT id, email FROM users WHERE id IN (?)';
  
      connection.query(fetchSenderEmailsQuery, [senderIds], (fetchEmailsError, senderEmails) => {
        if (fetchEmailsError) {
          console.error('Error fetching sender emails:', fetchEmailsError);
          res.status(500).json({ message: 'Internal Server Error' });
          return;
        }
  
        const messagesWithSenderEmails = messages.map(message => ({
          message: message.message,
          sender_email: senderEmails.find(user => user.id === message.sender_id)?.email || 'Unknown Sender'
        }));
  
        res.json(messagesWithSenderEmails);
      });
    });
  };