const express = require('express');
const router = express.Router();
const viewsController = require('./../controllers/viewsController');
const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');

router.get('/', bookingController.createBookingCheckout, authController.isLoggedIn, viewsController.getOverview);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTourDetail);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/my-profile', authController.protect, viewsController.getProfile);
router.get('/my-tours', authController.protect, viewsController.getMyTours);

module.exports = router;
