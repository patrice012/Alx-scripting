// const fs = require("fs");
const fs = require("node:fs");
// const fs = require("fs").promises;
const path = require("node:path");
// Root path
const { ROOT } = require("../config");
// process file path
let _filePath = path.normalize(`${ROOT}/cookies.json`);

// utils
const { createFileIFNotExists } = require("./files");

const saveCookies = (cookies) => {
  let filePath = _filePath;
  try {
    fs.writeFileSync(filePath, JSON.stringify(cookies, null, 2));
    console.log("Cookies saved successfully!");
  } catch (error) {
    console.log(error);
  }
};

const loadCookies = () => {
  let filePath = _filePath;
  let cookies = [];
  try {
    createFileIFNotExists(filePath);
    //load cookies
    cookies = fs.readFileSync(filePath, "utf8");
    return cookies;
  } catch (error) {
    console.log(error);
  }
  // return cookies;
};

module.exports = { saveCookies, loadCookies };
