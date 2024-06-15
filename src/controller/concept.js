const Concept = require("../db/concept.model");

class ConceptController {
  static async createConcept(req, res) {
    const { name, links } = req.body;

    // Validate the request body
    // const { error } = curriculumSchemaValidator.validate(req.body);
    // if (error) {
    //   return res.status(400).json({ error: error.details[0].message });
    // }

    try {
      let concept = await Concept.findOne({ name });
      if (!concept) {
        // Concept doesn't exist, create a new one
        concept = new Concept({ name, links });
        await concept.save();
      } else {
        // Ensure `links` is an array and merge without duplicates
        const newLinks = [...new Set([...concept.links, ...links])];

        // Only update and save if there are changes
        if (newLinks.length !== concept.links.length) {
          concept.links = newLinks;
          await concept.save();
        }
      }

      console.log("Concept:", concept);
      return res.status(201).json({ payload: concept });
    } catch (err) {
      console.error("Error creating or updating concept:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  static async updateConcept(req, res) {
    try {
      const { name, target } = req.body;
      let concept = await Concept.findOne({ name: name });

      if (!concept) {
        // Concept doesn't exist, create a new one
        return res.status(404).json({
          error: "Concept not found",
        });
      }
      if (target === "success") {
        concept.status = "SUCCESS";
      } else if (target === "error") {
        concept.status = "ERROR";
        concept.retryTimes = concept.retryTimes + 1;
      } else if (target === "pending") {
        concept.status = "PENDING";
        concept.retryTimes = 0;
      } else if (target === "retrying") {
        concept.status = "RETRYING";
        concept.retryTimes = concept.retryTimes + 1;
      }
      await concept.save();

      return res.json({ message: "Concept updated", payload: concept });
    } catch (e) {
      console.error("Error updating concept:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

module.exports = ConceptController;
