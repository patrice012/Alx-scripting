const Curriculum = require("../db/curriculum.model");
const { curriculumSchemaValidator } = require("../db/validator");

class CurriculumController {
  static async createCurriculum(req, res) {
    try {
      const { error } = curriculumSchemaValidator.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { name, links } = req.body;

      const query = { name: name };
      const curriculumData = { name, links, status: true };

      try {
        let curriculum = await Curriculum.findOne(query);

        if (!curriculum) {
          // Curriculum doesn't exist, create a new one
          curriculum = new Curriculum(curriculumData);
          await curriculum.save();
        } else {
          // Curriculum exists, update the curriculum
          curriculum = await Curriculum.updateOne(query, curriculumData);
        }

        console.log("Curriculum:", curriculum);
        const data = {
          payload: curriculum,
        };
        return res.status(201).json(data);
      } catch (err) {
        console.error(err);
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = CurriculumController;
