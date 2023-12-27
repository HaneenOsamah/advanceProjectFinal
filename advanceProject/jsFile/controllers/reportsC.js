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

////////////////
exports.submitEnvironmentalReport = (req, res) => {
    const { userId, issueType, description, location } = req.body;
  
    if (!userId || !issueType || !description || !location) {
      return res.status(400).send('Please provide all the required fields.');
    }
  
    const sql = `INSERT INTO environmental_reports (user_id, issue_type, description, location) VALUES (?, ?, ?, ?)`;
    connection.query(sql, [userId, issueType, description, location], (err, result) => {
      if (err) {
        console.error('Error submitting environmental report:', err);
        return res.status(500).send('An error occurred while submitting environmental report.');
      }
  
      console.log('Environmental report submitted successfully.');
      res.status(201).json({ message: 'Environmental report submitted successfully.' });
    });
  };
  ///////////////////////
  exports.viewReports = (req, res) => {
    const sql = 'SELECT * FROM environmental_reports';
  
    connection.query(sql, (err, result) => {
      if (err) {
        console.error('Error retrieving environmental reports:', err);
        return res.status(500).send('An error occurred while retrieving environmental reports.');
      }
  
      res.status(200).json(result);
    });
  };