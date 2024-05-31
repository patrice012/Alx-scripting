// env variable
const { EMAIL, PASSWORD } = require("../../config");

//utils
const { sleep } = require("../../utils/sleep");

// type effect delay
const delay = { delay: 200 };

/* LOGIN PROCESS */

// async function loginProcess(page) {
//   try {
//     const loginBox = await page.$("div.logged_out_form");
//     if (loginBox) {
//       console.log("Starting login process...");

//       // Fill email form
//       const emailInput = await page.$("input#user_email");
//       if (emailInput) {
//         await emailInput.type(EMAIL, { delay });
//         console.log("Email entered");
//         await sleep();
//       } else {
//         throw new Error("Email input not found");
//       }

//       // Fill password
//       const pwdInput = await page.$("input#user_password");
//       if (pwdInput) {
//         await pwdInput.type(PASSWORD, { delay });
//         console.log("Password entered");
//         await sleep();
//       } else {
//         throw new Error("Password input not found");
//       }

//       // Check the "Remember me" box
//       const rememberMeCheckbox = await page.$("input#user_remember_me");
//       if (rememberMeCheckbox) {
//         await rememberMeCheckbox.click();
//         console.log("Remember me box checked");
//       } else {
//         throw new Error("Remember me checkbox not found");
//       }

//       // Click the login button
//       const loginBtn = await page.$('input[type="submit"]');
//       if (loginBtn) {
//         await Promise.all([
//           loginBtn.click(),
//           page.waitForNavigation({ waitUntil: "networkidle0", timeout: 60000 }),
//         ]);
//         console.log("Login button clicked");
//       } else {
//         throw new Error("Login button not found");
//       }

//       return true;
//     } else {
//       console.log("Login box not found. User might already be logged in.");
//       return false;
//     }
//   } catch (error) {
//     console.error("An error occurred during the login process:", error);
//     return false;
//   }
// }

async function loginProcess(page) {
  try {
    await page.waitForSelector("div.logged_out_form", {
      visible: true,
    });
    const loginBox = await page.$("div.logged_out_form");
    if (loginBox) {
      console.log("Starting login process...");

      // Fill email form
      await page.waitForSelector("input#user_email", {
        visible: true,
      });
      const emailInput = await page.$("input#user_email");
      if (emailInput) {
        await emailInput.type(EMAIL, { delay });
        console.log("Email entered");
        await sleep();
      } else {
        throw new Error("Email input not found");
      }

      // Fill password
      await page.waitForSelector("input#user_password", {
        visible: true,
      });
      const pwdInput = await page.$("input#user_password");
      if (pwdInput) {
        await pwdInput.type(PASSWORD, { delay });
        console.log("Password entered");
        await sleep();
      } else {
        throw new Error("Password input not found");
      }

      // Check the "Remember me" box
      await page.waitForSelector("input#user_remember_me", {
        visible: true,
      });
      const rememberMeCheckbox = await page.$("input#user_remember_me");
      if (rememberMeCheckbox) {
        await rememberMeCheckbox.click();
        console.log("Remember me box checked");
      } else {
        throw new Error("Remember me checkbox not found");
      }

      // Click the login button
      await page.waitForSelector('input[type="submit"]', {
        visible: true,
      });
      const loginBtn = await page.$('input[type="submit"]');
      if (loginBtn) {
        await Promise.all([
          // loginBtn.click(),
          page.waitForNavigation({
            waitUntil: "domcontentloaded",
            timeout: 60000,
          }),
          loginBtn.click(),
        ]);
        console.log("Login button clicked");
      } else {
        throw new Error("Login button not found");
      }

      return true;
    } else {
      console.log("Login box not found. User might already be logged in.");
      return false;
    }
  } catch (error) {
    console.error("An error occurred during the login process:", error);

    // Handle specific known errors
    if (error.message.includes("Navigating frame was detached")) {
      console.error("Frame was detached, retrying login process...");
      await page.reload({ waitUntil: "networkidle0" });
      return loginProcess(page);
    }

    return false;
  }
}

module.exports = loginProcess;
