const express = require("express");
const ProjectController = require("../controller/project");
const ResourceController = require("../controller/resource");
const CurriculumController = require("../controller/curriculum");
const ConceptController = require("../controller/concept");
const ConceptResourceController = require("../controller/conceptResources");

const router = express.Router();

// project
router.post("/project", ProjectController.createProject);
router.post("/project/update", ProjectController.updateProject);
router.delete("/project/:id", ProjectController.deleteProject);
router.get("/projects", ProjectController.getProjects);
router.get("/project/:id", ProjectController.getProject);
router.get("/project/:id/resources", ProjectController.getProjectResources);

// resource
router.post("/resource", ResourceController.createResource);
router.post("/resource/update", ResourceController.updateResource);
router.delete("/resource/:id", ResourceController.deleteResource);
router.get("/resources", ResourceController.getResources);
router.get("/resource/:id", ResourceController.getResource);

// curriculum
router.post("/curriculum", CurriculumController.createCurriculum);
router.post("/curriculum/update", CurriculumController.updateCurriculum);

// concept
router.post("/concept", ConceptController.createConcept);
router.post("/concept/update", ConceptController.updateConcept);

// concept resources
router.post("/conceptRs", ConceptResourceController.createConceptResource);
router.post(
  "/conceptRs/update",
  ConceptResourceController.updateConceptResource
);
router.delete(
  "/conceptRs/:id",
  ConceptResourceController.deleteConceptResource
);
router.get("/conceptRs", ConceptResourceController.getConceptResources);
router.get("/conceptRs/:id", ConceptResourceController.getConceptResource);

module.exports = router;
