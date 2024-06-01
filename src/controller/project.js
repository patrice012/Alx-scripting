const {
  projectSchemaValidator,
  updateProjectSchemaValidator,
  findProjectSchemaValidator,
} = require("../db/validator");
const Project = require("../db/project.model");
const Curriculum = require("../db/curriculum.model");

class ProjectController {
  static async createProject(req, res) {
    try {
      const { error } = projectSchemaValidator.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const {
        name,
        curriculum,
        resources,
        projectLink,
        dirName,
        conceptPageName,
      } = req.body;

      const query = { name };
      const projectData = {
        name,
        curriculum,
        resources,
        projectLink,
        conceptPageName,
        dirName,
      };

      const curriculumDoc = await Curriculum.findOne({
        name: curriculum,
      }).select("_id");
      if (curriculumDoc) {
        projectData.curriculumId = curriculumDoc._id;
      }

      let project = await Project.findOne(query);

      if (!project) {
        project = new Project(projectData);
        await project.save();
      } else {
        project = await Project.updateOne(query, projectData);
      }

      res.status(201).json({ payload: project });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getProjects(req, res) {
    try {
      const projects = await Project.find();
      res.status(200).json({ payload: projects, count: projects.length });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getProject(req, res) {
    try {
      const { error } = findProjectSchemaValidator.validate(req.params);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const project = await Project.findById(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.status(200).json({ payload: project });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateProject(req, res) {
    try {
      // Validate the request body
      // const { error } = updateProjectSchemaValidator.validate(req.body);
      // if (error) {
      //   return res.status(400).json({ error: error.details[0].message });
      // }

      // Extract target, id, and url from the request body
      const { target, id, url, ...data } = req.body;

      // Initialize updateData with the rest of the request body
      let updateData = { ...data };

      // Retrieve the current project to get the current retryTimes value
      const aProject = await Project.findById(id);
      if (!aProject) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Determine the new status and retryTimes based on the target value
      if (target === "success") {
        updateData.status = "SUCCESS";
        if (url) {
          updateData.$addToSet = { successUrl: url };
          updateData.$pull = { errorUrls: url };
          //$addToSet ensures that the URL is added only if it doesn't already exist in the array.
          //$pull removes the URL from the opposite array if it exists there.
        }
      } else if (target === "error") {
        updateData.status = "ERROR";
        if (url) {
          updateData.$addToSet = { errorUrls: url };
          updateData.$pull = { successUrl: url };
        }
        updateData.retryTimes = aProject.retryTimes + 1;
      } else if (target === "pending") {
        updateData.status = "PENDING";
        updateData.retryTimes = 0;
      } else if (target === "retrying") {
        updateData.status = "RETRYING";
        updateData.retryTimes = aProject.retryTimes + 1;
      }

      // Find the project by ID and update it with the new data
      const project = await Project.findByIdAndUpdate(id, updateData, {
        new: true,
      });
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Return the updated project data
      res.status(200).json({ message: "Project updated", payload: project });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteProject(req, res) {
    try {
      const { error } = findProjectSchemaValidator.validate(req.params);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const project = await Project.findByIdAndDelete(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.status(200).json({ payload: project });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getProjectResources(req, res) {
    try {
      const { error } = findProjectSchemaValidator.validate(req.params);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const project = await Project.findById(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.status(200).json({ payload: project.resources });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = ProjectController;
