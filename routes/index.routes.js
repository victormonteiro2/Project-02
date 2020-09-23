const express = require('express');
// const { route } = require('../app');
const router = express.Router();
const books = require('google-books-search');
const { mongo } = require('mongoose');
const BookModel = require('../models/Book.model');
const { db } = require('../models/User.model');

/* GET home page */
router.get('/', (req, res, next) => res.render('index'));

router.get('/library', (req, res) => res.render('library'));

router.get('/available', (req, res, next) => {
  BookModel.find()
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
    });
  res.render('users/available');
});

// router.post('/available', (req, res, next) => {
//   db.collection.insert();
// });

router.get('/search', (req, res, next) => {
  books.search(req.query.search, (error, result) => {
    if (!error) {
      res.render('library', { result });
      console.log(result[0]);
    } else {
      console.log(error);
    }
  });
  //   console.log(req.query.search);
});

router.post('/add-book/:id', (req, res, next) => {
  console.log('TESTE', req.session);
  books.lookup(req.params.id, (err, result) => {
    if (!err) {
      BookModel.create({
        title: result.title,
        subtitle: result.subtitle,
        authors: result.authors,
        description: result.description,
        categories: result.categories,
        id: result.id,
        thumbnail: result.thumbnail,
        offering: req.session.currentUser._id
      })
        .then((response) => res.redirect('/available'))
        .catch((error) => console.log(error));
    } else {
      console.log(err);
    }
  });
});

module.exports = router;
