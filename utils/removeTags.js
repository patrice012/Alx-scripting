async function removeUnwantedTags(projectPage) {
    try {
        // disable unwanted elements
        await projectPage.$eval(
            'div[class="hidden-xs navigation sidebar"]',
            (sidebar) => {
                sidebar.style.display = "None";
            }
        );
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


module.exports = removeUnwantedTags