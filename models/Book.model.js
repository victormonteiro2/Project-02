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
    thumbnail: String,
    offering: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    available: [{ type: Schema.Types.ObjectId, ref: 'User' }]
  },
  {
    timestamps: true
  }
);

module.exports = model('Book', bookSchema);
