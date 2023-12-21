const { EMAIL, PASSWORD } = require("../config");

const delay = { delay: 200 };

/* LOGIN PROCESS */
async function loginProcess(page) {
    const loginBox = await page.$('div[class="logged_out_form"]');
    if (loginBox) {
        /* fill email form */
        const emailInput = await page.$('input[id="user_email"]');
        await emailInput.type(EMAIL, delay);
        /* fill password */
        const pwdInput = await page.$('input[id="user_password"]');
        await pwdInput.type(PASSWORD, delay);
        /* check the remeneber me box */
        const rmb_me = await page.$('input[id="user_remember_me"]');
        await rmb_me.click();
        /* login btn click*/
        const loginBtn = await page.$('input[type="submit"]');
        await Promise.all([
            loginBtn.click(),
            page.waitForNavigation({ waitFor: "networkidle0" }),
        ]);
    }
}

module.exports = loginProcess;
