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

      const { name, link, type, project, relatedLinks } = req.body;

      const query = { name: name };
      const resourceData = {
        name,
        link,
        type,
        project,
        relatedLinks,
      };

      try {
        let resource = await Resource.findOne(query);

        if (!resource) {
          // Resource doesn't exist, create a new one
          resource = new Resource(resourceData);
          await resource.save();
        } else {
          // Resource exists, update the resource
          resource = await Resource.updateOne(query, resourceData);
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
      // Extract target, id, and url from the request body
      const { target, id, url, ...data } = req.body;

      // Initialize updateData with the rest of the request body
      let updateData = { ...data };

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
      } else if (target === "pending") {
        updateData.status = "PENDING";
        updateData.retryTimes = 0;
      } else if (target === "retrying") {
        updateData.status = "RETRYING";
        // Retrieve the current resource to get the current retryTimes value
        const resource = await Resource.findById(id);
        if (!resource) {
          return res.status(404).json({ error: "Resource not found" });
        }
        updateData.retryTimes = resource.retryTimes + 1;
      }

      // Find the resource by ID and update it with the new data
      const resource = await Resource.findByIdAndUpdate(id, updateData, {
        new: true,
      });
      if (!resource) {
        return res.status(404).json({ error: "Resource not found" });
      }

      // Return the updated resource data
      res.status(200).json({ message: "Resource updated", payload: resource });
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
