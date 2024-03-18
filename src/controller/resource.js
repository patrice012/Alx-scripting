const {
  resourceSchemaValidator,
  updateResourceSchemaValidator,
  findResourceSchemaValidator,
} = require("../db/validator");
const Resource = require("../db/resource.model");
const Project = require("../db/project.model");

class ResourceController {
  static async createResource(req, res) {
    try {
      const { error } = resourceSchemaValidator.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const projectId = await Project.findOne({
        name: req.body.project,
      }).select(["_id"]);
      console.log(projectId, "projectId");

      if (projectId) {
        req.body.projectId = projectId;
      }

      const { name, link, type, project } = req.body;

      const query = { name: name };
      const resourceData = { name, link, type, project, status: true };

      try {
        let resource = await Resource.findOne(query);

        if (!resource) {
          // Resource doesn't exist, create a new one
          resource = new Resource(resourceData);
          await resource.save();
        }

        console.log("Resource:", resource);
        const data = {
          payload: resource,
        };
        return res.status(201).json(data);
      } catch (err) {
        console.error(err);
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
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
