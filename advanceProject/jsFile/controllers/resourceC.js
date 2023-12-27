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
/////////////////

exports.addResource = (req, res) => {
    const { title, description, link, type } = req.body;
  
    if (!title || !link || !type) {
      return res.status(400).send('Please provide a title, link, and type for the educational resource.');
    }
  
    const sql = `INSERT INTO educational_resources (title, description, link, type) VALUES (?, ?, ?, ?)`;
    connection.query(sql, [title, description, link, type], (err, result) => {
      if (err) {
        console.error('Error adding educational resource:', err);
        return res.status(500).send('An error occurred while adding the educational resource.');
      }
  
      console.log('Educational resource added successfully.');
      res.status(201).json({ message: 'Educational resource added successfully.' });
    });
  };

  ///////////////////
  exports.getEducationalResources = (req, res) => {
    const sql = 'SELECT * FROM educational_resources';

    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Error retrieving educational resources:', err);
            return res.status(500).send('An error occurred while retrieving educational resources.');
        }

        res.status(200).json(result);
    });
};