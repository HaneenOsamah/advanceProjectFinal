const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const admin = require('firebase-admin');
const path = require('path');

const app = express();
const port = 3087;

app.use(bodyParser.json());

const serviceAccountPath = path.join(__dirname, 'credentials', 'notification-82742-firebase-adminsdk-qpym5-4c6ecb1097.json');
const serviceAccount = require(serviceAccountPath);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://notification-82742-default-rtdb.firebaseio.com',
});

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',  
  database: 'advance',
});


db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

app.post('/api/send-notification', (req, res) => {
  const message = req.body.message || 'Default notification message';
  sendPushNotificationToAllUsers(message);
  res.json({ success: true, message: 'Push notification sent to all users.' });
});

const checkEnvironmentalData = () => {
  const alertThresholds = {
    'air quality': { min: 10, max: 50 },
    'temperature': { min: 0, max: 25 },
    'humidity': { min: 30, max: 60 },
    'water quality': { min: 60, max: 80 },
    'biodiversity metrics': { min: 50, max: 70 },
   
  };

  const query = `
    SELECT *
    FROM environmental_data
    WHERE (
      (data_type = 'air quality' AND (value < ${alertThresholds['air quality'].min} OR value > ${alertThresholds['air quality'].max})) OR
      (data_type = 'temperature' AND (value < ${alertThresholds['temperature'].min} OR value > ${alertThresholds['temperature'].max})) OR
      (data_type = 'humidity' AND (value < ${alertThresholds['humidity'].min} OR value > ${alertThresholds['humidity'].max})) OR
      (data_type = 'water quality' AND (value < ${alertThresholds['water quality'].min} OR value > ${alertThresholds['water quality'].max})) OR
      (data_type = 'biodiversity metrics' AND (value < ${alertThresholds['biodiversity metrics'].min} OR value > ${alertThresholds['biodiversity metrics'].max}))
      -- Add more conditions for additional data types
    );
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error querying environmental data:', err);
    } else {
      results.forEach((data) => {
        sendPushNotificationToAllUsers(`${data.data_type} exceeds threshold at ${data.location}`);
      });
    }
  });
};

const sendPushNotificationToAllUsers = (message) => {
  const payload = {
    notification: {
      title: 'Environmental Alert',
      body: message,
    },
  };

  const getUsersQuery = `SELECT * FROM users`;

  db.query(getUsersQuery, (err, users) => {
    if (err) {
      console.error('Error querying users:', err);
    } else {
      users.forEach((user) => {
        const userTopic = `user_${user.id}`;
        admin.messaging().sendToTopic(userTopic, payload)
          .then((response) => {
            console.log(`Push notification sent to user ${user.id}:`, response);
          })
          .catch((error) => {
            console.error(`Error sending push notification to user ${user.id}:`, error);
          });
      });
    }
  });
};

setInterval(checkEnvironmentalData, 3600000); 

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});