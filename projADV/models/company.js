

const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  company_phone: String,
  company_name: String,
  official_email: String,
  password: String,
});

module.exports = mongoose.model('Company', companySchema);
