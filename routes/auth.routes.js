// routes/auth.routers.js

const { Router, query } = require('express');
const router = new Router();
const bcryptjs = require('bcryptjs');
const saltRounds = 10;
const { Mongoose } = require('mongoose');
const express = require('express');
const app = express();
const User = require('../models/User.model');
const BookModel = require('../models/Book.model');
const { find } = require('../models/Book.model');
//CONFIG CLAUDINARY
const fileUploader = require('../configs/cloudinary.config');

require('../configs/session.config')(app);

// SIGNUP

// Route to display the signup form to user
router.get('/signup', (req, res) => res.render('auth/signup'));

// Route to process form data
router.post('/signup', (req, res, next) => {
  const { username, email, password } = req.body;

  //empty form will show this messae
  if (!username || !email || !password) {
    res.render('auth/signup', {
      errorMessage:
        'All fields are mandatory. Please provide your username, email and password.'
    });
    return;
  }

  //make sure password are strong
  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!regex.test(password)) {
    res.status(500).render('auth/signup', {
      errorMessage:
        'Password must have at least 6 characteres and must contain at least one number, one lowercase and one uppercase letter.'
    });
    return;
  }
  bcryptjs
    .genSalt(saltRounds)
    .then((salt) => bcryptjs.hash(password, salt))
    .then((hashedPassword) => {
      return User.create({
        username,
        email,
        passwordHash: hashedPassword
      });
    })
    .then((userFromDB) => {
      console.log('Newly created user is: ', userFromDB);
      // REDIRECIONAMENTO APOS A CRIAÇÃO DO USUARIO PARA A PAGINA DO PERFIL***** ALTERAR
      res.redirect('/userProfile');
    })
    .catch((error) => {
      if (error instanceof Mongoose.Error.ValidationError) {
        res.status(500).render('auth/signup', { errorMessage: error.message });
      } else if (error.code === 11000) {
        res.status(500).render('auth/signup', {
          errorMessage:
            'Username and email need to be unique. Either username or email is already used'
        });
      } else {
        next(error);
      }
    });
});

// LOGIN

// route to display the login form to users
router.get('/login', (req, res) => {
  if (req.session.currentUser) {
    res.redirect('/userProfile');
  } else {
    res.render('auth/login');
  }
});
//login route to process form data
router.post('/login', (req, res, next) => {
  const { email, password } = req.body;

  if (email === '' || password === '') {
    res.render('auth/login', {
      errorMessage: 'Please enter both, email and password to login.'
    });
    return;
  }

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        // ALTERAR PATH DO LOGIN
        res.render('auth/login', {
          errorMessage: 'Email is not registered. Try with other email.'
        });
        return;
      }
      bcryptjs
        .compare(password, user.passwordHash)
        .then((success) => {
          if (success) {
            req.session.currentUser = user;
            return res.redirect('/userProfile');
          }
          //LTERAR PATH DO LOGIN
          return res.render('auth/login', {
            errorMessage: 'incorrect password.'
          });
        })
        .catch((err) => {
          throw new Error(err);
        });
    })
    .catch((error) => next(error));
});

// LOGOUT

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

router.get('/userProfile', (req, res) => {
  console.log('your session expires: ', req.session.cookie.expires);
  if (req.session.currentUser) {
    BookModel.find({ offering: req.session.currentUser._id })
      .then((response) => {
        return res.render('users/user-profile', {
          userInSession: req.session.currentUser,
          userBooks: response
        });
      })
      .catch((error) => {
        console.log(error);
      });
  } else {
    return res.redirect('/login');
  }
});

// GET route do delete user

router.get('/delete-user', (req, res, next) => {
  console.log(req.session.currentUser._id);
  User.findByIdAndRemove(req.session.currentUser._id, req.session.currentUser)
    .then((response) => {
      console.log(`${response} deleted.`);
      res.redirect('/');
    })
    .catch((error) => console.log(error));
});

//GET edit user details

router.get('/edit-user', (req, res, next) => {
  User.findById(req.session.currentUser._id)
    .then((response) => {
      res.render('../views/users/edit-user.hbs', {
        response,
        userInSession: req.session.currentUser
      });
    })
    .catch((error) => console.log(error));
});

//POST route to edit user details

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

router.post('/edit-user', fileUploader.single('image'), (req, res) => {
  console.log('teste3', req.file);
  const { name } = req.body;
  User.updateOne(
    { username: req.session.currentUser.username },
    {
      $set: {
        ...req.body,
        profileImage: req.file
          ? req.file.url
          : req.session.currentUser.profileImage
      }
    }
  )
    .then((response) => {
      User.findById(req.session.currentUser._id)
        .then((findResponse) => {
          req.session.currentUser = findResponse;
          console.log(req.session.currentUser);
          res.redirect('/userProfile');
        })
        .catch((error) => console.log(error));
    })
    .catch((error) => console.log(error));
});

module.exports = router;
