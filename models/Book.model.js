// const { triggerAsyncId } = require('async_hooks');
// const { truncate } = require('fs');
// User model here

const { Schema, model } = require('mongoose');

const bookSchema = new Schema(
  {
    title: String,
    subtitle: String,
    authors: [String],
    description: String,
    categories: [String],
    id: String,
    thumbnail: String
  },
  {
    timestamps: true
  }
);

module.exports = model('Book', bookSchema);
