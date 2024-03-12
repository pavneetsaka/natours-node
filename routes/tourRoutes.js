const express = require('express');
const tourCountroller = require('./../controllers/tourController');
const router = express.Router();

// router.param('id', tourCountroller.checkId);

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