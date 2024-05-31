const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const curriculumSchema = new Schema(
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

module.exports = mongoose.model("Curriculum", curriculumSchema);
