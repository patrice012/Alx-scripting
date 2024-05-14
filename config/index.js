const dotenv = require("dotenv");
dotenv.config();

// file path: utils/cookies.js
const _filePath = __dirname;
const path = require("node:path");

// environment variables
const BASE_URL = process.env.BASE_URL;
const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;
const API_URL = process.env.API_URL;


// browser configuration
const broswerView = {
  headless: false, //new,
  defaultViewport: null,
  args: ["--start-maximized"],
};

// pdf route folder
const PDF_ROUTE='pdf'

// process file path
let normalizePath = path.normalize(_filePath);
let _dirname = path.dirname(normalizePath);

module.exports = {
  BASE_URL,
  EMAIL,
  PASSWORD,
  API_URL,
  broswerView,
  ROOT: _dirname,
  PDF_ROUTE,
};
