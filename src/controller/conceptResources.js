const {
  conceptSchemaValidator,
  updateConceptSchemaValidator,
  findConceptSchemaValidator,
} = require("../db/validator");
const Concept = require("../db/concept.model");
const ConceptResource = require("../db/conceptResource.model");

class ConceptResourceController {
  static async createConceptResource(req, res) {
    try {
      // const { error } = conceptSchemaValidator.validate(req.body);
      // if (error) {
      //   return res.status(400).json({ error: error.details[0].message });
      // }

      const conceptId = await Concept.findOne({
        name: req.body.concept,
      }).select(["_id"]);
      console.log(conceptId, "conceptId");

      if (conceptId) {
        req.body.conceptId = conceptId;
      }

      const { name, link, type, concept, relatedLinks } = req.body;

      const query = { name: name };
      const conceptData = {
        name,
        link,
        type,
        concept,
        relatedLinks,
      };

      try {
        let conceptRs = await ConceptResource.findOne(query);

        if (!conceptRs) {
          // ConceptResource doesn't exist, create a new one
          conceptRs = new ConceptResource(conceptData);
          await conceptRs.save();
        } else {
          // ConceptResource exists, update the concept
          conceptRs = await ConceptResource.updateOne(query, conceptData);
        }

        console.log("ConceptRs:", conceptRs);
        const data = {
          payload: conceptRs,
        };
        return res.status(201).json(data);
      } catch (err) {
        console.error(err);
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async getConceptResources(req, res) {
    try {
      const concepts = await ConceptResource.find();
      const data = {
        payload: concepts,
        count: concepts.length,
      };
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getConceptResource(req, res) {
    try {
      // const { error } = findConceptSchemaValidator.validate(req.params);
      // if (error) {
      //   return res.status(400).json({ error: error.details[0].message });
      // }
      const concept = await ConceptResource.findById(req.params.id);
      if (!concept) {
        return res.status(404).json({ error: "ConceptResource not found" });
      }
      const data = {
        payload: concept,
      };
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateConceptResource(req, res) {
    try {
      // Extract target, id, and url from the request body
      const { target, id, url, ...data } = req.body;

      // Initialize updateData with the rest of the request body
      let updateData = { ...data };

      // Retrieve the current concept to get the current retryTimes value
      const aConcept = await ConceptResource.findById(id);
      if (!aConcept) {
        return res.status(404).json({ error: "ConceptResource not found" });
      }

      // Determine the new status and retryTimes based on the target value
      if (target === "success") {
        updateData.status = "SUCCESS";
        if (url) {
          updateData.$addToSet = { successUrl: url };
          updateData.$pull = { errorUrls: url };
        }
      } else if (target === "error") {
        updateData.status = "ERROR";
        if (url) {
          updateData.$addToSet = { errorUrls: url };
          updateData.$pull = { successUrl: url };
        }
        updateData.retryTimes = aConcept.retryTimes + 1;
      } else if (target === "pending") {
        updateData.status = "PENDING";
        updateData.retryTimes = 0;
      } else if (target === "retrying") {
        updateData.status = "RETRYING";
        updateData.retryTimes = aConcept.retryTimes + 1;
      }

      // Find the concept by ID and update it with the new data
      const concept = await ConceptResource.findByIdAndUpdate(id, updateData, {
        new: true,
      });
      if (!concept) {
        return res.status(404).json({ error: "ConceptResource not found" });
      }

      // Return the updated concept data
      res.status(200).json({ message: "ConceptResource updated", payload: concept });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteConceptResource(req, res) {
    try {
      // const { error } = findConceptSchemaValidator.validate(req.params);
      // if (error) {
      //   return res.status(400).json({ error: error.details[0].message });
      // }
      const concept = await ConceptResource.findByIdAndDelete(req.params.id);
      if (!concept) {
        return res.status(404).json({ error: "ConceptResource not found" });
      }
      const data = {
        payload: concept,
      };
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = ConceptResourceController;