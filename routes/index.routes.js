const { response } = require('express');
const express = require('express');
// const { route } = require('../app');
const router = express.Router();
const books = require('google-books-search');
const { mongo } = require('mongoose');
const BookModel = require('../models/Book.model');
const UserModel = require('../models/User.model');
const { db } = require('../models/User.model');

/* GET home page */
router.get('/', (req, res, next) =>
  res.render('index', { userInSession: req.session.currentUser })
);

router.get('/library', (req, res) =>
  res.render('library', { userInSession: req.session.currentUser })
);

router.get('/search', (req, res, next) => {
  books.search(req.query.search, (error, result) => {
    if (!error) {
      const resultSize = result.length;
      res.render('library', {
        result,
        resultSize,
        userInSession: req.session.currentUser
      });
    } else {
      console.log(error);
    }
  });
});

router.get('/tradable', (req, res) => {
  if (!req.session.currentUser) {
    res.redirect('/login');
  } else {
    BookModel.find({ offering: { $ne: req.session.currentUser._id } })
      .then((response) => {
        console.log(response);
        res.render('tradable', {
          book: response,
          userInSession: req.session.currentUser
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }
});

router.get('/offering', (req, res, next) => {
  BookModel.find({ offering: { $in: req.session.currentUser._id } })
    .then((response) => {
      console.log(response);
      res.render('users/offering', {
        book: response,
        userInSession: req.session.currentUser
      });
    })
    .catch((error) => {
      console.log(error);
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
          .then((response) => res.redirect('/offering'), {
            userInSession: req.session.currentUser
          })
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
      res.redirect('/offering'), { userInSession: req.session.currentUser };
    })
    .catch((error) => console.log(error));
});

//ROUTE TO WISHLIST

router.get('/wishlist', (req, res, next) => {
  BookModel.find({ wishlist: { $in: req.session.currentUser._id } })
    .then((response) => {
      console.log(response);
      res.render('users/wishlist', {
        book: response,
        userInSession: req.session.currentUser
      });
    })
    .catch((error) => {
      console.log(error);
    });
});

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
          .then((response) => res.redirect('/wishlist'), {
            userInSession: req.session.currentUser
          })
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
      res.redirect('./wishlist'), { userInSession: req.session.currentUser };
    })
    .catch((error) => console.log(error));
});

// ROUTE TO TRADE BOOKS

router.get('/trade-book/:id', (req, res, next) => {
  if (!req.session.currentUser) {
    res.redirect('/login');
  } else {
    console.log('teste2', req.params.id);
    BookModel.updateOne(
      { offering: { $in: req.params.id } },
      { offering: [req.session.currentUser._id] }
    )
      .then((response) => {
        UserModel.updateOne({ _id: req.params.id }, { $inc: { score: 1 } })
          .then((scoreResponse) => {
            console.log('teste', scoreResponse);
            res.redirect('/tradable'),
              { userInSession: req.session.currentUser };
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((error) => {
        console.log(error);
      });
  }
});

module.exports = router;

// router.post('/edit-user', (req, res, next) => {
//   User.updateOne(
//     { username: req.session.currentUser.username },
//     { $set: req.body }
//   )
//     .then((response) => {
//       console.log(req.session.currentUser);
//       console.log(response);
//       User.findById(req.session.currentUser._id)
//         .then((findResponse) => {
//           req.session.currentUser = findResponse;
//           console.log(req.session.currentUser);
//           res.redirect('/userProfile');
//         })
//         .catch((error) => console.log(error));
//     })
//     .catch((error) => console.log(error));
// });
