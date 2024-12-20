const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const Booking = require('./../models/bookingModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.tourID);

    let successDevParam = `?alert=booking`;
    if (process.env.NODE_ENV === 'development') {
        successDevParam = `?tour=${req.params.tourID}&user=${req.user.id}&price=${tour.price}`;
    }
    const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/my-tours/${successDevParam}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourID,
        line_items: [{
            price_data: {
                currency: 'usd',
                product_data: {
                    name: `${tour.name} Tour`,
                    description: tour.summary,
                    images: [`https://www.natours.dev/img/tours/${tour.imageCover}`]
                },
                unit_amount: tour.price*100
            },
            quantity: 1
        }]
    });

    res.status(200).json({
        status: 'success',
        session
    });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
    // Temporary, as its not secure. Implemented webhook fror PROD
    const { tour, user, price } = req.query;
    
    if(!tour && !user && !price) return next();

    await Booking.create({tour, user, price});

    res.redirect(req.originalUrl.split('?')[0]);
});

//For PROD
exports.webhookCheckout = (req, res, next) => {
    const signature = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        createBookingCheckout_PROD(event.data.object)
    }

    res.status(200).json({received: true});
};
const createBookingCheckout_PROD = async (session) => {
    const tour = session.client_reference_id;
    const user = (await User.findOne({email: session.customer_email})).id;
    const price = (session.line_items[0].price_data.unit_amount/100);
    await Booking.create({tour, user, price});
}

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);