async function removeUnwantedTags(projectPage) {
  try {
    await projectPage.evaluate(() => {
      let sidebar = document.querySelector("div[class*='sidebar']");
      sidebar.style.display = "None";
      sidebar.style.visibility = "hidden";
      sidebar.style.width = "0px";

      let seachBtn = document.querySelector("[id='search-button']");
      seachBtn.style.display = "None";
      seachBtn.style.visibility = "hidden";
      seachBtn.style.width = "0px";
    });

    await projectPage.$eval('iframe[id="launcher"]', (helpBtn) => {
      helpBtn.style.display = "None";
    });
  } catch (error) {
    /* handle error */
  }
}

module.exports = removeUnwantedTags;
