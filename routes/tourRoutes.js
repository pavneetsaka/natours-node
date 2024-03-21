const express = require('express');
const tourCountroller = require('./../controllers/tourController');
const router = express.Router();

// router.param('id', tourCountroller.checkId);

/*--- Route Alisaing ----*/
//Middleware as first arguments handles the query param defined by default, based on the alias purpose
router.route('/top-5-cheap-trips').get(tourCountroller.aliasTop5Tours, tourCountroller.getAllTours);

/*-- Aggregation pipeline --*/
router.route('/tour-stats').get(tourCountroller.getTourStats);
router.route('/monthly-tour-plan/:year').get(tourCountroller.getMonthlyPlan);

router
	.route('/')
	.get(tourCountroller.getAllTours)
	.post(tourCountroller.createTour);

router
	.route('/:id')
	.get(tourCountroller.getTour)
	.patch(tourCountroller.updateTour)
	.delete(tourCountroller.deleteTour);

module.exports = router;