const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContentSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: false
  }
});

module.exports = Content = mongoose.model('content', ContentSchema);