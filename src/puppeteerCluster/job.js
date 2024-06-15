const {
  foundationScrapingHelper,
  specialisationScrapingHelper,
  scrapingResourcesHelper,
  scrapingConceptsHelper,
} = require("./scrapingHelpers");

const scrapingFoundationResources = async (req, res) => {
  try {
    res.status(200).json({ message: "Scraping foundation resources start" });
    await foundationScrapingHelper();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Scraping resources failed" });
  }
};

const scrapingSpecialisationResources = async (req, res) => {
  try {
    res
      .status(200)
      .json({ message: "Scraping specialisation resources start" });
    await specialisationScrapingHelper();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Scraping resources failed" });
  }
};

const scrapingResources = async (req, res) => {
  try {
    res.status(200).json({ message: "Scraping additionals resources start" });
    await scrapingResourcesHelper();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Scraping resources failed" });
  }
};

const scrapingConcepts = async (req, res) => {
  try {
    res.status(200).json({ message: "Scraping additionals concepts start" });
    await scrapingConceptsHelper();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Scraping resources failed" });
  }
};

module.exports = {
  scrapingFoundationResources,
  scrapingSpecialisationResources,
  scrapingResources,
  scrapingConcepts,
};
