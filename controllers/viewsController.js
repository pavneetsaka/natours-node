const Tour = require('./../models/tourModel');
const Booking = require('./../models/bookingModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
    const tours = await Tour.find();
    res.status(200).render('overview', {
		title: 'All tours',
        tours
	});
});

exports.getTourDetail = catchAsync(async (req, res, next) => {
    const slug = req.params.slug;
    const tour = await Tour.findOne({slug: slug}).populate({path: 'reviews', fields: 'review rating user'});
    /* if (!tour) {
        return next(new AppError('There is no tour with that name', 404));
    } */

    res.status(200).render('tour', {
        title: tour.name,
		tour
	});
});

exports.getMyTours = catchAsync(async (req, res, next) => {
    const bookings = await Booking.find({user: req.user.id});

    const tourIDs = bookings.map(el => el.tour);
    const tours = await Tour.find({ _id: {$in: tourIDs} });

    res.status(200).render('overview', {
        title: 'My Tours Bookings',
        tours
    });
});

/* --Login-- */
exports.getLoginForm = (req, res) => {
    res.status(200).render('login', {
        title: 'Log into your account'
    })
};

/* -- Profile/Accounts page -- */
exports.getProfile = (req, res) => {
    res.status(200).render('account', {
        title: 'My Profile'
    });
};