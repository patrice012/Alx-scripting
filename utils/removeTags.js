async function removeUnwantedTags(projectPage) {
  try {
    // disable unwanted elements
    await projectPage.$eval('div[class*="sidebar"]', (sidebar) => {
      sidebar.style.display = "None";
      sidebar.style.visibility = "hidden";
      sidebar.style.width = "0px";
    });
    await projectPage.$eval('button[id="search-button"]', (searchBtn) => {
      searchBtn.style.display = "None";
    });
    await projectPage.$eval('iframe[id="launcher"]', (helpBtn) => {
      helpBtn.style.display = "None";
    });
  } catch (error) {
    /* handle error */
  }
}

module.exports = removeUnwantedTags;
