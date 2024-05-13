const {
  foundationScrapingHelper,
  specialisationScrapingHelper,
  scrapingResourcesHelper,
} = require("./scrapingHelpers");

const runTestScript = async (req, res) => {
  try {
    console.log("test script start");
    await foundationScrapingHelper();
    // await specialisationScrapingHelper();
    await scrapingResourcesHelper();
    console.log("test script end");
  } catch (error) {
    console.log("test script error");
    console.log(error);
    res.send(error);
  }
};

module.exports = runTestScript;
