const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/usersR');
const daataRoutes = require('./routes/dataR');
const messageRoutes = require('./routes/messagesR');
const repooRoutes = require('./routes/reportsR');
const rseorRoutes = require('./routes/resourceR');
const app = express();
const port = 3099;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/auth', authRoutes);
app.use('/datta', daataRoutes);
app.use('/message', messageRoutes);
app.use('/report', repooRoutes);
app.use('/resourse', rseorRoutes);


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
