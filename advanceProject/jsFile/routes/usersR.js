const express = require('express');
const router = express.Router();
const authController = require('../controllers/usersC');

// Signup route
router.post('/signup', authController.signup);

// Login route
router.post('/login', authController.login);
// Route to get user profile
router.get('/profile/:userId', authController.getProfile);

// Route to update user profile
router.put('/profile/:userId', authController.updateProfile);

// Route to connect with users having similar interests
router.get('/connectsame/:userId', authController.connectSameInterests);

// Route for signing up( SRO )
router.post('/signupforSRO', authController.signupForSRO);

// Route for fetching external data
router.get('/external-data/:user_id', authController.getExternalData);
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Route for getting the most score user
router.get('/most-Score-user', authController.getMostScoreUser);

router.get('/score', authController.verifyToken, authController.getScore);

router.get('/search', authController.verifyToken, authController.searchUsers);




module.exports = router;
