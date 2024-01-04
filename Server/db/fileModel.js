const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({

  fileName: {
    type: String,
    required: true,
    unique: false,
  },

  fileType: {
    type: String,
    required: true,
    unique: false,
  },

  cid: {
    type: String,
    required: true,
    unique: true,
  },

  from: {
    type: String,
    required: true,
    unique: false,
  },

  to: {
    type: String,
    required: true,
    unique: false,
  },

  chunkCount : {
    type: Number,
    required: true,
    unique: false,
  },

  receiptSignature: {
    type: Array,
    required: false,
    unique: false,
  }

});

module.exports = mongoose.model.Files || mongoose.model("Files", FileSchema);
