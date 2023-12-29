// file path: utils/cookies.js
const _filePath = `${__dirname}/cookies.json`;
// const fs = require("fs");
const fs = require("fs").promises;
// utils
const { createFileIFNotExists } = require("./files");

const saveCookies = async (cookies) => {
  let filePath = _filePath;
  return (async () => {
    try {
      await fs.writeFile(filePath, JSON.stringify(cookies, null, 2));
      console.log("Cookies saved successfully!");
    } catch (error) {
      console.log(error);
    }
  })();
};

const loadCookies = async () => {
  let filePath = _filePath;
  return (async () => {
    let cookies = {};
    try {
      createFileIFNotExists(filePath);
      //load cookies
      const cookiesString = await fs.readFile(filePath, "utf8");
      cookies = JSON.parse(cookiesString);
    } catch (error) {
      // console.log(error);
    } finally {
      return cookies;
    }
  })();
};

module.exports = { saveCookies, loadCookies };
