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






exports.signup = async (req, res) => 
{
    const { username, email, password, location, phone, interests } = req.body;

    if (!username || !email || !password) {
      return res.status(400).send('Please provide all the required fields.');
    }
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const sql = `INSERT INTO users (username, email, password, location, phone, interests) VALUES (?, ?, ?, ?, ?, ?)`;
      connection.query(sql, [username, email, hashedPassword, location, phone, interests], (err, result) => {
        if (err) {
          console.error('Error registering user: ' + err.message);
          return res.status(500).send('An error occurred while registering the user.');
        }
  
        console.log('User registered successfully.');
        res.status(201).json({ message: 'User registered successfully.' });
      });
    } catch (error) {
      console.error('Error hashing password: ' + error.message);
      res.status(500).send('An error occurred while hashing the password.');
    }
}

exports.login = async (req, res) => {
    const { email, password } = req.body;
  connection.query(
    'SELECT * FROM People WHERE email = ?',
    [email],
    async (errorPeople, resultsPeople) => {
      if (errorPeople) {
        console.error('Error during login: ' + errorPeople.message);
        res.status(500).json({ message: 'Error during login' });
        return;
      }
      connection.query(
        'SELECT * FROM users WHERE email = ?',
        [email],
        async (errorUsers, resultsUsers) => {
          if (errorUsers) {
            console.error('Error during login: ' + errorUsers.message);
            res.status(500).json({ message: 'Error during login' });
            return;
          }
          const foundUser = resultsPeople.length > 0 ? resultsPeople[0] : resultsUsers[0];

          if (foundUser) {
            const passwordMatch = await bcrypt.compare(password, foundUser.password);

            if (passwordMatch) {
              const token = jwt.sign({ userId: foundUser.id }, 'your-secret-key', { expiresIn: '1h' });
              res.json({ message: 'Login successful', user: foundUser,Token :token });
            } else {
              res.status(401).json({ message: 'Incorrect password' });
            }
          } else {
            res.status(404).json({ message: 'User not found' });
          }
        }
      );
    }
  );
}


  exports.getProfile = (req, res) => 
  {
    const userId = req.params.userId;

  const sql = `SELECT * FROM users WHERE id = ?`;
  connection.query(sql, [userId], (err, result) => {
    if (err) {
      console.error('Error getting user profile: ' + err.message);
      return res.status(500).send('An error occurred while getting user profile.');
    }

    if (result.length === 0) {
      return res.status(404).send('User profile not found.');
    }

    const userProfile = result[0];
    res.status(200).json(userProfile);
  });
}
exports.updateProfile = (req, res) =>
 {
    const userId = req.params.userId;
    const updatedData = req.body;

    const sql = `UPDATE users SET ? WHERE id = ?`;

    connection.query(sql, [updatedData, userId], (err, result) => {
        if (err) {
            console.error('Error updating user profile: ' + err.message);
            return res.status(500).send('An error occurred while updating user profile.');
        }

        console.log('User profile updated successfully.');
        res.status(200).json({ message: 'User profile updated successfully.' });
    });
};

exports.connectSameInterests = (req, res) => {
    const userId = req.params.userId;
  
    const getUserInterestsSql = 'SELECT interests FROM users WHERE id = ?';
    connection.query(getUserInterestsSql, [userId], (getUserInterestsErr, userInterestsResult) => {
      if (getUserInterestsErr) {
        console.error('Error getting user interests: ' + getUserInterestsErr.message);
        return res.status(500).send('An error occurred while getting user interests.');
      }
  
      if (userInterestsResult.length === 0) {
        return res.status(404).send('User not found.');
      }
  
      const userInterests = userInterestsResult[0].interests;
  
      const findSimilarUsersSql = `SELECT * FROM users WHERE id != ? AND interests = ? LIMIT 5`;
      connection.query(findSimilarUsersSql, [userId, userInterests], (findUsersErr, similarUsersResult) => {
        if (findUsersErr) {
          console.error('Error connecting with other users: ' + findUsersErr.message);
          return res.status(500).send('An error occurred while connecting with other users.');
        }
  
        res.status(200).json(similarUsersResult);
      });
    });
  };

exports.signupForSRO = async (req, res) => {
  const { name, last_name, email, password, person_type } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  connection.query(
    'INSERT INTO People (name, last_name, email, password, person_type) VALUES (?, ?, ?, ?, ?)',
    [name, last_name || null, email, hashedPassword, person_type],
    (error, results) => {
      if (error) {
        console.error('Error during sign-up: ' + error.message);
        res.status(500).json({ message: 'Error during sign-up' });
        return;
      }

      res.json({ message: 'Sign-up successful' });
    }
  );
};

const OPENWEATHERMAP_API_KEY = 'a2abf72bcf09b99f3381196c8e75cfdb';

exports.getExternalData = async (req, res) => {
    const userId = req.params.user_id;

    // Fetch user location based on user_id
    const getUserLocationSql = 'SELECT location FROM users WHERE id = ?';
    connection.query(getUserLocationSql, [userId], async (getUserLocationErr, userLocationResult) => {
      if (getUserLocationErr) {
        console.error('Error getting user location: ' + getUserLocationErr.message);
        return res.status(500).send('An error occurred while getting user location.');
      }
  
      if (userLocationResult.length === 0) {
        return res.status(404).send('User not found.');
      }
  
      const userLocation = userLocationResult[0].location;
  
      // Use the user location to fetch external data (replace this with your actual logic)
      try {
        const externalData = await fetchWeatherData(userLocation);
        res.status(200).json(externalData);
      } catch (error) {
        res.status(500).json({ error: 'Error fetching external data' });
      }
    });
  };
  
  // Example function to fetch weather data based on location
  async function fetchWeatherData(location) {
    try {
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${OPENWEATHERMAP_API_KEY}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching weather data:', error.message);
      throw error;
    }
  }
  /////////////////////////////////////////////////////////////////////////
  exports.getMostScoreUser = (req, res) => {
    // Find the most frequent user_id in the environmental_data table
    const mostFrequentUserQuery =
      'SELECT user_id, COUNT(user_id) AS userCount FROM environmental_data GROUP BY user_id ORDER BY userCount DESC LIMIT 1';
  
    connection.query(mostFrequentUserQuery, (queryError, queryResults) => {
      if (queryError) {
        console.error('Error finding most frequent user:', queryError);
        res.status(500).json({ message: 'Internal Server Error' });
        return;
      }
  
      if (queryResults.length === 0) {
        res.json({ message: 'No data available' });
        return;
      }
      const searchedUserId = queryResults[0].user_id;
  
      // Fetch the user's username based on the provided id
      const searchUserQuery = 'SELECT username FROM users WHERE id = ?';
  
      connection.query(searchUserQuery, [searchedUserId], (searchUserError, user) => {
        if (searchUserError) {
          console.error('Error searching for user:', searchUserError);
          res.status(500).json({ message: 'Internal Server Error' });
          return;
        }
  
        if (user.length === 0) {
          res.status(404).json({ message: 'User not found' });
          return;
        }
        const mostFrequentUser = {
          username: user[0].username,
          userScore: queryResults[0].userCount,
        };
        res.json(mostFrequentUser);
      });
    });
  };
  
  exports.verifyToken = (req, res, next) => {
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
  
  exports.getScore = (req, res) => {
    const userId = req.userId;
  
    const countUserAppearancesQuery =
      'SELECT COUNT(*) AS userAppearances FROM environmental_data WHERE user_id = ?';
  
    connection.query(countUserAppearancesQuery, [userId], (countError, countResults) => {
      if (countError) {
        console.error('Error counting user appearances:', countError);
        res.status(500).json({ message: 'Internal Server Error' });
        return;
      }
  
      const userScore = countResults[0].userAppearances;
  
      res.json({ userScore });
    });
  };
///////////////////////////////////////////////
  exports.searchUsers = (req, res) => {
    const userId = req.userId;
  
    // Fetch the user's location and interests
    const getUserQuery = 'SELECT location, interests FROM users WHERE id = ?';
  
    connection.query(getUserQuery, [userId], (getUserError, getUserResults) => {
      if (getUserError) {
        console.error('Error fetching user details:', getUserError);
        res.status(500).json({ message: 'Internal Server Error' });
        return;
      }
  
      if (getUserResults.length === 0) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
  
      const { location, interests } = getUserResults[0];
  
      const searchUsersQuery =
        'SELECT * FROM users WHERE id != ? AND (location = ? OR interests = ?)';
  
      connection.query(searchUsersQuery, [userId, location, interests], (searchUsersError, matchingUsers) => {
        if (searchUsersError) {
          console.error('Error searching matching users:', searchUsersError);
          res.status(500).json({ message: 'Internal Server Error' });
          return;
        }
  
        const formattedUsers = matchingUsers.map(user => ({
          email: user.email,
          username: user.username,
          location: user.location,
          interests: user.interests
        }));
  
        res.json(formattedUsers);
      });
    });
  };
 

 