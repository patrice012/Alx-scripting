const {
  resourceSchemaValidator,
  updateResourceSchemaValidator,
  findResourceSchemaValidator,
} = require("../db/validator");
const Resource = require("../db/model");

class ResourceController {
  static async createResource(req, res) {
    try {
      const { error } = resourceSchemaValidator.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }
      const resource = new Resource(req.body);
      await resource.save();
      const data = {
        payload: resource,
      };
      res.status(201).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getResources(req, res) {
    try {
      const resources = await Resource.find();
      const data = {
        payload: resources,
        count: resources.length,
      };
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getResource(req, res) {
    try {
      const { error } = findResourceSchemaValidator.validate(req.params);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }
      const resource = await Resource.findById(req.params.id);
      if (!resource) {
        return res.status(404).json({ error: "Resource not found" });
      }
      const data = {
        payload: resource,
      };
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateResource(req, res) {
    try {
      const { error } = updateResourceSchemaValidator.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }
      const resource = await Resource.findByIdAndUpdate(req.body.id, req.body, {
        new: true,
      });
      if (!resource) {
        return res.status(404).json({ error: "Resource not found" });
      }
      const data = {
        payload: resource,
      };
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteResource(req, res) {
    try {
      const { error } = findResourceSchemaValidator.validate(req.params);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }
      const resource = await Resource.findByIdAndDelete(req.params.id);
      if (!resource) {
        return res.status(404).json({ error: "Resource not found" });
      }
      const data = {
        payload: resource,
      };
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = ResourceController;
