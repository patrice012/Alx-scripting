const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const conceptResourceSchema = new Schema(
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

    concept: {
      type: String,
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

conceptResourceSchema.pre("save", function (next) {
  if (this.relatedLinks.length === 0) {
    this.status = "SUCCESS";
  } else {
    this.status = "PENDING";
  }
  next();
});

module.exports = mongoose.model("ConceptResource", conceptResourceSchema);
