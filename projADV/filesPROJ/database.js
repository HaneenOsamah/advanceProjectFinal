const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', 
  database: 'advance',
});

connection.connect((err) => {
  if (err) {
    console.error('   error : ' + err.stack);
    return;
  }
  console.log('done');
});


connection.end((err) => {
  if (err) {
    console.error('   error: ' + err.stack);
    return;
  }
  console.log('done2');
});
