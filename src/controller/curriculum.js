const Curriculum = require("../db/curriculum.model");
const { curriculumSchemaValidator } = require("../db/validator");

class CurriculumController {
  static async createCurriculum(req, res) {
    const { name, links } = req.body;

    // Validate the request body
    const { error } = curriculumSchemaValidator.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    try {
      let curriculum = await Curriculum.findOne({ name });
      if (!curriculum) {
        // Curriculum doesn't exist, create a new one
        curriculum = new Curriculum({ name, links});
        await curriculum.save();
      } else {
        // Ensure `links` is an array and merge without duplicates
        const newLinks = [...new Set([...curriculum.links, ...links])];

        // Only update and save if there are changes
        if (newLinks.length !== curriculum.links.length) {
          curriculum.links = newLinks;
          await curriculum.save();
        }
      }

      console.log("Curriculum:", curriculum);
      return res.status(201).json({ payload: curriculum });
    } catch (err) {
      console.error("Error creating or updating curriculum:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  static async updateCurriculum(req, res) {
    try {
      const { name, target } = req.body;
      let curriculum = await Curriculum.findOne({ name: name });

      if (!curriculum) {
        // Curriculum doesn't exist, create a new one
        return res.status(404).json({
          error: "Curriculum not found",
        });
      }
      if (target === "success") {
        curriculum.status = "SUCCESS";
      } else if (target === "error") {
        curriculum.status = "ERROR";
        curriculum.retryTimes = curriculum.retryTimes + 1;
      } else if (target === "pending") {
        curriculum.status = "PENDING";
        curriculum.retryTimes = 0;
      } else if (target === "retrying") {
        curriculum.status = "RETRYING";
        curriculum.retryTimes = curriculum.retryTimes + 1;
      }
      await curriculum.save();

      return res.json({ message: "Curriculum updated", payload: curriculum });
    } catch (e) {
      console.error("Error updating curriculum:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

module.exports = CurriculumController;
