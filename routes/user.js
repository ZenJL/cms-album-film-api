const router = require('express').Router();
const {check, validationResult} = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// model
const User = require('../model/User');

// @route   POST /api/user
// @desc    Register user
// @access  Public
router.post('/register', 
  check('firstName', 'FirstName is required').not().isEmpty(),
  check('lastName', 'LastName is required').not().isEmpty(),
  check('email', 'Email must be correctd format').not().isEmpty().isEmail(),
  check('password', 'Password is required').not().isEmpty()

, async(req, res) => {
  // validator fields
  const errors = validationResult(req);
  // console.log('errors: ', errors);
  if(!errors.isEmpty()) {
    return res.status(404).json({errors: errors.array()})
  }

  // check email exist
  const emailExist = await User.findOne({email: req.body.email})
  if(emailExist) {
      return res.status(400).json({
          message: `Email already exists`,
          isSuccess: false,
      })
  }
  
  // hash pass
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  // creat new user
  const user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: hashPassword,
  });

  try {
    await user.save();
    res.status(200).json({
      message: 'Register successfully',
      isSuccess : true,
    })
  } catch(err) {
    res.status(500).json({
      message: 'Sever Error',
      isSuccess: false
    })
  }
});


// @route   POST /api/user/login
// @desc    Login user
// @access  Public
router.post('/login', 
  check('email', 'Email must be correctd format').not().isEmpty().isEmail(),
  check('password', 'Password is required').not().isEmpty()

, async(req, res) => {
  // validator fields
  const errors = validationResult(req);
  // console.log('errors: ', errors);
  if(!errors.isEmpty()) {
    return res.status(404).json({errors: errors.array()})
  }

  // validate email
  const user = await User.findOne({email: req.body.email})
  if(!user) {
    return res.status(400).json({
        message: `Email or password incorrect`,
        isSuccess: false,
    })
  }
  // validate password
  const password = await bcrypt.compare(req.body.password, user.password);
  if(!password) {
    return res.status(400).json({
        message: `Email or password incorrect`,
        isSuccess: false,
    })
  }

  // create & assign access token
  const payload = {
    user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
    }
  }
  jwt.sign(
    payload,
    process.env.TOKEN_SECRET,
    {expiresIn: 36000},
    (err, token) => {
        if(err) throw err;
        res.header('x-auth-token', token).json({
            token,
            message: `Login successful!`,
            isSuccess: true,
        })
    }
  )
})

module.exports = router;