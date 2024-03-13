const express = require("express");
const ProjectController = require("../controller/project");
const ResourceController = require("../controller/resource");

const router = express.Router();

router.post("/create-project", ProjectController.createProject);
router.patch("/update-project", ProjectController.updateProject);
router.delete("/project/:id", ProjectController.deleteProject);
router.get("/projects", ProjectController.getProjects);
router.get("/project/:id", ProjectController.getProject);
router.get("/project/:id/resources", ProjectController.getProjectResources);



router.post("/create-resource", ResourceController.createResource);
router.patch("/update-resource", ResourceController.updateResource);
router.delete("/resource/:id", ResourceController.deleteResource);
router.get("/resources", ResourceController.getResources);
router.get("/resource/:id", ResourceController.getResource);

module.exports = router;