const dotenv = require("dotenv");
dotenv.config();

// file path: utils/cookies.js
const _filePath = __dirname;
const path = require("node:path");

const BASE_URL = process.env.BASE_URL;
const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;

const broswerView = {
  headless: false, //new,
  defaultViewport: null,
  args: ["--start-maximized"],
};

const PDF_ROUTE='pdf'

// process file path
let normalizePath = path.normalize(_filePath);
let _dirname = path.dirname(normalizePath);

module.exports = {
  BASE_URL,
  EMAIL,
  PASSWORD,
  broswerView,
  ROOT: _dirname,
  PDF_ROUTE,
};
