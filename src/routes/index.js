const express = require("express");
const ProjectController = require("../controller/project");
const ResourceController = require("../controller/resource");
const CurriculumController = require("../controller/curriculum");

const router = express.Router();

router.post("/project", ProjectController.createProject);
router.patch("/project", ProjectController.updateProject);
router.delete("/project/:id", ProjectController.deleteProject);
router.get("/projects", ProjectController.getProjects);
router.get("/project/:id", ProjectController.getProject);
router.get("/project/:id/resources", ProjectController.getProjectResources);

router.post("/resource", ResourceController.createResource);
router.patch("/resource", ResourceController.updateResource);
router.delete("/resource/:id", ResourceController.deleteResource);
router.get("/resources", ResourceController.getResources);
router.get("/resource/:id", ResourceController.getResource);


router.post("/curriculum", CurriculumController.createCurriculum);

module.exports = router;
