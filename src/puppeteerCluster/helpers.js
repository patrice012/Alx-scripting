// specialisation and foundation curriculum scraping
const getCurriculumnTypes = async (page) => {
  // select the cursus type
  await page.waitForSelector("#student-switch-curriculum-dropdown", {
    visible: true,
  });

  const cursusTypeBox = await page.$("#student-switch-curriculum-dropdown");
  await cursusTypeBox.click();

  console.log("cursusTypeBox clicked", cursusTypeBox);

  const curriculumDropdownItems = await page.$$(
    'ul[aria-labelledby="student-switch-curriculum-dropdown"] li'
  );

  // console.log(curriculumDropdownItems, "curriculumDropdownItems");
  return curriculumDropdownItems;
};

//  for specialisation and foundation links
const getSpecialisationsLinks = async (page) => {
  // for specialisation page
  await page.waitForSelector('a[data-target="#period_scores_modal_17"]', {
    visible: true,
  });
  const specialisationModalBox = await page.$(
    'a[data-target="#period_scores_modal_17"]'
  );
  await specialisationModalBox.click();
  console.log("specialisationModalBox clicked");

  // get specialisation links
  const data = await page.$$eval('table[class="table"]', (table) => {
    let specialisationTable = table[0];
    let links = Array.from(specialisationTable.querySelectorAll("a"));
    let specialisationLinks = links
      .filter((link) => link.href && link.href.trim() !== "")
      .map((link) => link.href);
    let names = links.map((link) => link.innerText.trim());
    return { specialisationLinks, names };
  });

  return data;
};

const getFoundationLinks = async (page) => {
  // for fondation page
  await page.waitForSelector('a[data-target="#period_scores_modal_1"]', {
    visible: true,
  });
  const fondationModalBox = await page.$(
    'a[data-target="#period_scores_modal_1"]'
  );
  await fondationModalBox.click();
  console.log("fondationModalBox clicked");

  // get fondation links
  const data = await page.$$eval('table[class="table"]', (table) => {
    let foundationTable = table[1];
    let links = Array.from(foundationTable.querySelectorAll("a"));
    let foundationLinks = links
      .filter((link) => link.href && link.href.trim() !== "")
      .map((link) => link.href);
    let names = links.map((link) => link.innerText.trim());
    return { foundationLinks, names };
  });

  return data;
};

const getConceptLinks = async (page) => {
  try {
    // for fondation page
    await page.waitForSelector(".list-group", {
      visible: true,
    });

    // get fondation links
    const data = await page.$eval(".list-group", (box) => {
      let links = Array.from(box?.querySelectorAll("a"));
      let conceptLinks = links.filter(
        (link) => link.href && link.href.trim() !== ""
      );

      let linkObject = conceptLinks.map((link) => {
        return {
          href: link.href,
          name: link.innerText.trim(),
        };
      });
      return linkObject;
    });

    return data;
  } catch (error) {
    console.log(error, "error");
  }
};

module.exports = {
  getCurriculumnTypes,
  getSpecialisationsLinks,
  getFoundationLinks,
  getConceptLinks,
};
