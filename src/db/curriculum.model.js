const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const curriculumSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    status: {
      type: Boolean,
      default: false,
    },
    links: {
      type: Array,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Curriculum", curriculumSchema);
