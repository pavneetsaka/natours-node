const express = require('express');
const router = express.Router();
const viewsController = require('./../controllers/viewsController');
const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');

router.use(viewsController.alerts);

router.get('/', authController.isLoggedIn, viewsController.getOverview);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTourDetail);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/my-profile', authController.protect, viewsController.getProfile);

if (process.env.NODE_ENV === 'development') {
    router.use(bookingController.createBookingCheckout);
}
router.get('/my-tours', authController.protect, viewsController.getMyTours);

module.exports = router;
