const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',  // اسم المستخدم الافتراضي لـ XAMPP
  password: '',  // كلمة المرور الافتراضية لـ XAMPP
  database: 'advance',
});

connection.connect((err) => {
  if (err) {
    console.error('خطأ في الاتصال بقاعدة البيانات: ' + err.stack);
    return;
  }
  console.log('done');
});

// قم بإجراء استعلامات SQL هنا

connection.end((err) => {
  if (err) {
    console.error('خطأ في إنهاء الاتصال: ' + err.stack);
    return;
  }
  console.log('done2');
});
