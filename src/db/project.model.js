const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const projectSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    curriculum: {
      type: String,
      required: true,
    },
    curriculumId: {
      type: Schema.Types.ObjectId,
      ref: "Curriculum",
    },
    scrapeDate: {
      type: Date,
      default: Date.now,
    },
    resources: {
      type: Array,
      required: true,
    },
    projectLink: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      default: false,
    },
    dirName: {
      type: String,
    },
    conceptPageName: {
      type: String,
    },
  },
  { timestamps: true }
);

// add index on curriculum field
projectSchema.index({ curriculum: 1, name: 1 });

module.exports = mongoose.model("Project", projectSchema);
