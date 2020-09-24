const { response } = require('express');
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

router.get('/offering', (req, res, next) => {
  BookModel.find({ offering: { $in: req.session.currentUser._id } })
    .then((response) => {
      console.log(response);
      res.render('users/offering', { book: response });
    })
    .catch((error) => {
      console.log(error);
    });
});

router.get('/wishlist', (req, res, next) => {
  BookModel.find({ wishlist: { $in: req.session.currentUser._id } })
    .then((response) => {
      console.log(response);
      res.render('users/wishlist', { book: response });
    })
    .catch((error) => {
      console.log(error);
    });
});

router.get('/search', (req, res, next) => {
  books.search(req.query.search, (error, result) => {
    if (!error) {
      res.render('library', { result });
    } else {
      console.log(error);
    }
  });
});

//ROUTE TO ADD IN OFFERING BOOKS

router.post('/add-book/:id', (req, res, next) => {
  if (!req.session.currentUser) {
    res.redirect('/login');
  } else {
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
          .then((response) => res.redirect('/offering'))
          .catch((error) => console.log(error));
      } else {
        console.log(err);
      }
    });
  }
});

router.get('/remove-book', (req, res, next) => {
  BookModel.collection
    .deleteOne(req._id)
    .then((response) => {
      console.log(`${response} deleted.`);
      res.redirect('/offering');
    })
    .catch((error) => console.log(error));
});

//ROUTE TO WISHLIST

router.post('/add-wishlist/:id', (req, res, next) => {
  if (!req.session.currentUser) {
    res.redirect('/login');
  } else {
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
          wishlist: req.session.currentUser._id
        })
          .then((response) => res.redirect('/wishlist'))
          .catch((error) => console.log(error));
      } else {
        console.log(err);
      }
    });
  }
});

router.get('/remove-wishlist', (req, res, next) => {
  BookModel.collection
    .deleteOne(req._id)
    .then((response) => {
      console.log(`${response} deleted.`);
      res.redirect('./wishlist');
    })
    .catch((error) => console.log(error));
});

module.exports = router;
