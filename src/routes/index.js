const express = require("express");
const ProjectController = require("../controller/project");
const ResourceController = require("../controller/resource");
const CurriculumController = require("../controller/curriculum");

const router = express.Router();

router.post("/project", ProjectController.createProject);
router.post("/project/update", ProjectController.updateProject);
router.delete("/project/:id", ProjectController.deleteProject);
router.get("/projects", ProjectController.getProjects);
router.get("/project/:id", ProjectController.getProject);
router.get("/project/:id/resources", ProjectController.getProjectResources);

router.post("/resource", ResourceController.createResource);
router.post("/resource/update", ResourceController.updateResource);
router.delete("/resource/:id", ResourceController.deleteResource);
router.get("/resources", ResourceController.getResources);
router.get("/resource/:id", ResourceController.getResource);

router.post("/curriculum", CurriculumController.createCurriculum);
router.post("/curriculum/update", CurriculumController.updateCurriculum);

module.exports = router;
