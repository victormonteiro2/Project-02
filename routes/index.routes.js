const express = require('express');
// const { route } = require('../app');
const router = express.Router();
const books = require('google-books-search');

/* GET home page */
router.get('/', (req, res, next) => res.render('index'));

router.get('/search', (req, res, next) => {
  books.search(req.query.search, (error, result) => {
    if (!error) {
      res.render('../views/users/user-profile', { result });
      console.log(result[0]);
    } else {
      console.log(error);
    }
  });
  //   console.log(req.query.search);
});

module.exports = router;
