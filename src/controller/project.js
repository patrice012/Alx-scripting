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
      const query = { name: name };
      const projectData = {
        name,
        curriculum,
        resources,
        status: true,
        projectLink,
        conceptPageName,
        dirName,
      };

      const curriculumId = await Curriculum.findOne({
        name: curriculum,
      }).select(["_id"]);

      if (curriculumId) {
        projectData["curriculumId"] = curriculumId;
      }

      let project = await Project.findOne(query);

      if (!project) {
        // Project doesn't exist, create a new one
        project = new Project(projectData);
        await project.save();
      } else {
        // Project exists, update the project
        project = await Project.updateOne(query, projectData);
      }

      // console.log("Project:", project);
      const data = {
        payload: project,
      };
      res.status(201).json(data);

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getProjects(req, res) {
    try {
      const projects = await Project.find();
      const data = {
        payload: projects,
        count: projects.length,
      };
      res.status(200).json(data);
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
      const data = {
        payload: project,
      };
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateProject(req, res) {
    try {
      const { error } = updateProjectSchemaValidator.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }
      const project = await Project.findByIdAndUpdate(req.body.id, req.body, {
        new: true,
      });
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      const data = {
        payload: project,
      };
      res.status(200).json(data);
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
      const data = {
        payload: project,
      };
      res.status(200).json(data);
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
      const data = {
        payload: project.resources,
      };
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = ProjectController;
