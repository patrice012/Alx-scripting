const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ConceptSchema = new Schema(
  {
    name: {
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

    links: {
      type: Array,
      required: true,
    },
  },
  { timestamps: true }
);

ConceptSchema.pre("save", function (next) {
  if (this.links.length === 0) {
    this.status = "SUCCESS";
  } else {
    this.status = "PENDING";
  }
  next();
});

module.exports = mongoose.model("Concept", ConceptSchema);
