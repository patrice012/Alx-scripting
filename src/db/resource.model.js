const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const resoureSchema = new Schema(
  {
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
      type: String,
      required: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Resource", resoureSchema);
