const express = require('express');
const router = express.Router();
const User = require('../models/user');
const expressValidator = require('express-validator');
const passport = require('passport');

const { buildCheckFunction } = require('express-validator/check');
const checkBodyAndQuery = buildCheckFunction(['body', 'query']);



module.exports = router;
