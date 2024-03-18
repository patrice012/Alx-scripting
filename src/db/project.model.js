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
    status: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
