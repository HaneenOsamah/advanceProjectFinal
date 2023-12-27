
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
const fs = require('fs');
const uuid = require('uuid');

exports.submitData = (req, res) => {
    const { data_type, value, location, user_id } = req.body;

    if (!data_type || !value || !location || !user_id) {
        return res.status(400).send('Please provide all the required fields.');
    }

    const sensor_id = uuid.v4();

    const sql = `INSERT INTO environmental_data (sensor_id, data_type, value, location, user_id) VALUES (?, ?, ?, ?, ?)`;
    connection.query(sql, [sensor_id, data_type, value, location, user_id], (err, result) => {
        if (err) {
            console.error('Error submitting environmental data:', err);
            return res.status(500).send('An error occurred while submitting environmental data.');
        }

        console.log('Environmental data submitted successfully.');
        res.status(201).json({ message: 'Environmental data submitted successfully.' });
    });
};



///////////
exports.submitFileData = (req, res) => {
    const { file } = req.body;

    if (!file) {
        return res.status(400).send('Please provide the file path.');
    }

    fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send('An error occurred while reading the file.');
        }

        console.log('File content:', data);

        let jsonData;
        try {
            jsonData = JSON.parse(data);
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            return res.status(500).send('Error parsing JSON data.');
        }

        const { sensor_id, data_type, value, location, user_id } = jsonData;

        const insertQuery = 'INSERT INTO environmental_data (sensor_id, data_type, value, location, user_id) VALUES (?, ?, ?, ?, ?)';
        const values = [sensor_id, data_type, value, location, user_id];

        connection.query(insertQuery, values, (insertError, result) => {
            if (insertError) {
                console.error('Error inserting data:', insertError);
                return res.status(500).json({ error: 'Error inserting data into the database.' });
            }

            console.log('Data inserted successfully.');
            res.status(201).json({ message: 'Data inserted successfully', data: { id: result.insertId } });
        });
    });
};
  ///////////
  exports.submitSensorData = (req, res) => {
    const { sensor_id, data_type, value, location, user_id } = req.body;
  
    if (!sensor_id || !data_type || !value || !location || !user_id) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    const timestamp = new Date().toISOString();
  
    const insertQuery = 'INSERT INTO environmental_data (sensor_id, data_type, value, timestamp, location, user_id) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [sensor_id, data_type, value, timestamp, location, user_id];
  
    connection.query(insertQuery, values, (err, result) => {
      if (err) {
        console.error('Error inserting data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        console.log('Data inserted successfully');
        res.status(201).json({ message: 'Data inserted successfully', data: { id: result.insertId } });
      }
    });
  };

  ///////////////
  exports.viewEnvironmentalData = (req, res) => {
    const sql = 'SELECT * FROM environmental_data';
  
    connection.query(sql, (err, result) => {
      if (err) {
        console.error('Error retrieving environmental data:', err);
        return res.status(500).send('An error occurred while retrieving environmental data.');
      }
  
      res.status(200).json(result);
    });
  };

  

//////////////////////////
exports.getDataByFilter = (req, res) => {
    const { data_type, location } = req.query;

    let sql = 'SELECT * FROM environmental_data WHERE 1';

    if (data_type) {
        sql += ` AND data_type = '${data_type}'`;
    }

    if (location) {
        sql += ` AND LOWER(location) = LOWER('${location}')`;
    }

    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching data by filter:', err);
            return res.status(500).send('An error occurred while fetching data by filter.');
        }

        res.status(200).json(results);
    });
};

////////////////

