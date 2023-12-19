const { EMAIL, PASSWORD } = require("./config");
const login = async (page) => {
  const email = await page.$('input[id="user_email"]');

}
