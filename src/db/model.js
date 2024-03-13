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
    description: {
      type: String,
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

const resoureSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    default: false,
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: "Project",
  },
});

module.exports = mongoose.model("Resource", resoureSchema);
