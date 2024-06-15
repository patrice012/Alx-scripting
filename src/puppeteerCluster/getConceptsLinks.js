const Concept = require("../db/concept.model");

const getConceptLinks = async () => {
  try {
    const pendingConcepts = await Concept.find({
      retryTimes: { $lt: 5 },
    })
      .select({
        retryTimes: 1,
        _id: 1,
        links: 1,
        name: 1,
      })
      .lean(true);

    return pendingConcepts;
  } catch (error) {
    console.log(error);
  }
};

module.exports = getConceptLinks;
