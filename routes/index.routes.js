const express = require('express');
// const { route } = require('../app');
const router = express.Router();
const books = require('google-books-search');

/* GET home page */
router.get('/', (req, res, next) => res.render('index'));

router.get('/search', (req, res, next) => {
  books.search(req.query.search, (error, result) => {
    if (!error) {
      console.log(result);
    } else {
      console.log(error);
    }
  });
  //   console.log(req.query.search);
});

module.exports = router;
