const Joi = require("@hapi/joi");

const projectSchemaValidator = Joi.object({
  name: Joi.string().required(),
  curriculum: Joi.string().required(),
  resources: Joi.array().required(),
  projectLink: Joi.string(),
  dirName: Joi.string(),
  conceptPageName: Joi.string(),
});

const updateProjectSchemaValidator = Joi.object({
  resources: Joi.array(),
  // status: Joi.boolean(),
  id: Joi.string().required(),
});

const findProjectSchemaValidator = Joi.object({
  id: Joi.string().required(),
});

const resourceSchemaValidator = Joi.object({
  name: Joi.string().required(),
  link: Joi.string().required(),
  type: Joi.string().required(),
  // status: Joi.boolean(),
  project: Joi.string().required(),
  relatedLinks: Joi.array(),
});

const updateResourceSchemaValidator = Joi.object({
  // status: Joi.boolean(),
  id: Joi.string().required(),
});

const findResourceSchemaValidator = Joi.object({
  id: Joi.string().required(),
});

const curriculumSchemaValidator = Joi.object({
  name: Joi.string().required(),
  links: Joi.array().required(),
});

module.exports = {
  projectSchemaValidator,
  resourceSchemaValidator,
  updateProjectSchemaValidator,
  updateResourceSchemaValidator,
  findProjectSchemaValidator,
  findResourceSchemaValidator,
  curriculumSchemaValidator,
};
