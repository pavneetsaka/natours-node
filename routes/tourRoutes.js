const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const router = express.Router();

// router.param('id', tourController.checkId);

/*--- Route Alisaing ----*/
//Middleware as first arguments handles the query param defined by default, based on the alias purpose
router.route('/top-5-cheap-trips').get(tourController.aliasTop5Tours, tourController.getAllTours);

/*-- Aggregation pipeline --*/
router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-tour-plan/:year').get(tourController.getMonthlyPlan);

router
	.route('/')
	.get(authController.protect, tourController.getAllTours)
	.post(tourController.createTour);

router
	.route('/:id')
	.get(tourController.getTour)
	.patch(tourController.updateTour)
	.delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour);

module.exports = router;