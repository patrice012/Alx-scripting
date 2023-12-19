const dotenv = require("dotenv");
dotenv.config();

const BASE_URL = process.env.BASE_URL;
const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;

module.exports = { BASE_URL, EMAIL, PASSWORD };
