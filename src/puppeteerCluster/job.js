const foundationCurriculumScraping = require("./index");

const scrapingResources = async (req, res) => {
  try {
    res.status(200).json({ message: "Scraping resources start" });
    foundationCurriculumScraping();
  } catch (error) {
    return res.status(500).json({ message: "Scraping resources failed" });
  }
  // return res.status(200).json({ message: "Scraping resources completed" });
};

module.exports = scrapingResources;
