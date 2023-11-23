const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Specify the destination for uploaded files
const bcrypt = require('bcrypt');
const app = express();
const axios = require('axios');
const port = 3099;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'advance',
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database: ' + err.stack);
    return;
  }
  console.log('Connected to the database successfully.');
});
///////////////////////////////////////////////////////////////




app.get('/', (req, res) => {
  res.send('Welcome page!');
});


//////////////////////////////////////////////////////////feature  2
app.post('/signup', async (req, res) => {
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
});


///////////////////////////////
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Search in the People table
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
              res.json({ message: 'Login successful', user: foundUser });
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
});



//////getting user profile
app.get('/profile/:userId', (req, res) => {
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
});

///////////////////////////////  updating user profile
app.put('/profile/:userId', (req, res) => {
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
});

/////////// Get interests of the user
app.get('/connectsame/:userId', (req, res) => {
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
});
/////////////////////////////////////////////researchers, scientists, and organizations
/////signUp for S,R,O
app.post('/signupforSRO', async (req, res) => {
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
});
/////////////////////////////////////////////////////////////////feature 1
//////////1-manual observations


const uuid = require('uuid'); 

app.post('/submit-data', (req, res) => {
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
});

//////////////////////////2-upload file

const fs = require('fs');

app.post('/submit-DATAFILE', (req, res) => {
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
});

///////////////////3-IoT sensors

app.post('/api/sensor-data', (req, res) => {
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
});





 
  /////////////////////////////////////////view data environmental_data
  app.get('/view-data', (req, res) => {
    const sql = 'SELECT * FROM environmental_data';
  
    connection.query(sql, (err, result) => {
      if (err) {
        console.error('Error retrieving environmental data:', err);
        return res.status(500).send('An error occurred while retrieving environmental data.');
      }
  
      res.status(200).json(result);
    });
  });

/////////////////////////////////////////////////////////////////////////////feature 4

app.post('/submit-environmental-report', (req, res) => {
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
});




app.get('/view-reports', (req, res) => {
  const sql = 'SELECT * FROM environmental_reports';

  connection.query(sql, (err, result) => {
      if (err) {
          console.error('Error retrieving environmental reports:', err);
          return res.status(500).send('An error occurred while retrieving environmental reports.');
      }

      res.status(200).json(result);
  });
});

////////////////////////////////////////////////////////////////////////////////////feature 6
// Add a new educational resource
app.post('/add-resource', (req, res) => {
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
});


//////Get all educational resources
app.get('/get-resources', (req, res) => {
  const sql = 'SELECT * FROM educational_resources';

  connection.query(sql, (err, result) => {
      if (err) {
          console.error('Error retrieving educational resources:', err);
          return res.status(500).send('An error occurred while retrieving educational resources.');
      }

      res.status(200).json(result);
  });
});
//////////////////////////////////////////////////////////////////////////////////feature 7 

app.get('/data-by-filter', (req, res) => {
  const { data_type, location } = req.query;

  let sql = 'SELECT * FROM environmental_data WHERE 1';

  if (data_type) {
    sql += ` AND data_type = '${data_type}'`;
  }

  if (location) {
    sql += ` AND LOWER(location) = LOWER('ramallah')`;
  }

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching data by filter:', err);
      return res.status(500).send('An error occurred while fetching data by filter.');
    }

    res.status(200).json(results);
  });
});






///////////////////////////////////upload file

//const fs = require('fs');
/*
app.post('/submit-dataaaa', (req, res) => {
  const { file } = req.body;

  if (!file) {
    return res.status(400).send('Please provide the file path.');
  }

  // Read file content
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).send('An error occurred while reading the file.');
    }

    // Process the file content as needed
    console.log('File content:', data);

    // Your logic to handle the file content...

    res.status(200).json({ message: 'File content processed successfully.' });
  });
});
*/
////////////////////


// OpenWeatherMap API Key
const OPENWEATHERMAP_API_KEY = 'a2abf72bcf09b99f3381196c8e75cfdb';

// External API Integration example
app.get('/external-data/:user_id', async (req, res) => {
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
});

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







////////////////





app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
