const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');
const router = express.Router();

// router.param('id', tourController.checkId);

router.use('/:tourId/reviews', reviewRouter);

/*--- Route Alisaing ----*/
//Middleware as first arguments handles the query param defined by default, based on the alias purpose
router.route('/top-5-cheap-trips').get(tourController.aliasTop5Tours, tourController.getAllTours);

/*-- Aggregation pipeline --*/
router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-tour-plan/:year').get(authController.protect, authController.restrictTo('admin', 'lead-guide', 'guide'), tourController.getMonthlyPlan);

/* -- Geospatial functionallity -- */
router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin);
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
	.route('/')
	.get(tourController.getAllTours)
	.post(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.createTour);

router
	.route('/:id')
	.get(tourController.getTour)
	.patch(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.uploadTourImages, tourController.resizeTourImages, tourController.updateTour)
	.delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour);

module.exports = router;