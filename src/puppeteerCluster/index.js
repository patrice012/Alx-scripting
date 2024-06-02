const newCluster = require("./newCluster");

// base config
const { BASE_URL } = require("../config");

// auth
const loginProcess = require("../auth/auth");

// utils
const { loadCookies, saveCookies } = require("../utils/cookies");

const scrapData = async (cb) => {
  const cluster = await newCluster();

  let state = {
    error: false,
    links: [],
    conceptLinks: [],
    cookies: [],
  };

  let analytics = {
    totalLinks: [],
    totalConceptLinks: [],
  };

  let newCookies = null;
  // Visiting the home page and login if needed
  await cluster.queue(async ({ page }) => {
    const url = new URL(BASE_URL);

    // timeout configuration
    await page.setDefaultTimeout(150000); // 2min 30s
    await page.setDefaultNavigationTimeout(150000);

    try {
      state.cookies = loadCookies();

      // console.log(state.cookies, "state.cookies");

      if (!state.cookies) {
        // go to login page
        await page.goto(url, { waitUntil: "load" });

        // login
        await loginProcess(page);

        // get cookies
        let cookies = await page.cookies();
        state.cookies = cookies;

        // save cookies for the next time
        saveCookies(cookies);
      } else {
        let _cookies = state.cookies;
        // console.log(_cookies, "cookies");
        await page.setCookie(..._cookies);
        await page.goto(url, { waitUntil: "load" });
        // get cookies
        let cookies = await page.cookies();
        state.cookies = cookies;

        // save cookies for the next time
        saveCookies(cookies);
      }
    } catch (error) {
      state.error = error;
      console.log(error, "error");
    }

    state.cookies = await page.cookies();
    // console.log(state.cookies, "cookies saved");

    if (state.error) {
      console.log(state.error, "error");
      return;
    }

    newCookies = await cb(cluster, page);
  });

  await cluster.idle();
  await cluster.close();
  return newCookies;
};

module.exports = { scrapData };
