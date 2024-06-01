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
      type: String,
      default: "PENDING",
      enum: ["PENDING", "ERROR", "SUCCESS", "RETRYING"],
    },
    retryTimes: {
      type: Number,
      default: 0,
    },
    project: {
      type: String,
      required: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },
    relatedLinks: {
      type: Array,
    },
    errorUrls: {
      type: Array,
    },
    successUrl: {
      type: Array,
    },
  },
  { timestamps: true }
);

resoureSchema.pre("save", function (next) {
  if (this.relatedLinks.length === 0) {
    this.status = "SUCCESS";
  } else {
    this.status = "PENDING";
  }
  next();
});

module.exports = mongoose.model("Resource", resoureSchema);
