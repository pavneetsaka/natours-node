const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp'); //Http paramater pollution
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError'); //Custom error class
const globalErrorHandler = require('./controllers/errorController'); //Custom error handling middleware function
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

/* View template - PUG */
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

/* Global Middlewares */
app.use(express.static(path.join(__dirname, 'public'))); //To public folder so static/view files can access assets

//Set security HTTP headers
app.use(helmet({ contentSecurityPolicy: {  useDefaults: true, directives: { 'script-src': ["'self'", "https://unpkg.com"] } } })); //Using Helmet package to set security HTTP headers

//Development logging
if(process.env.NODE_ENV === 'development'){
	app.use(morgan('dev'));
}

//Limit requests from same IP - Usefule to prevent brute force attacks and DDoS attacks
const limiter = rateLimit({
	max: 100,
	windowMs: 60 * 60 * 1000, //In 1 hour (set in milliseconds)
	message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

//Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); //Limits the body size to 10kb
app.use(cookieParser()); //Cookie parser

//Data sanitization against NoSQL query injection
app.use(mongoSanitize());

//Data sanitization against XSS
app.use(xss());

//Prevents parameter pollution
app.use(hpp({
	//Whitelist certain parameter to avoid error
	whitelist: [
		'duration',
		'ratingsQuantity',
		'ratingsAverage',
		'maxGroupSize',
		'difficulty',
		'price'
	]
}));

/*---Custom Middleware---*/
/* app.use((req, res, next) => {
	console.log('Hello from the middleware!');
	next();
}); */

//Middleware to add time to response
app.use((req, res, next) => {
	req.returnTime = new Date().toISOString();
	next();
});
/*---Custom Middleware---*/

//Routes
/* -- View Routes -- */
app.use('/', viewRouter);

/* -- API Routes -- */
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

//Middleware to handle error -> In this case route error with custom message 
//all() -> includes get(), post(), delete(), update() & * means all url slugs
//Adding this handler here, below our routes defination, automatically catches the error because if a valid route was called it would have been handled above in Routes defination
app.all('*', (req, res, next) => {
	/* res.status(404).json({
		status: 'fail',
		message: `Can't find the ${req.originalUrl} on this server!`
	}); */

	//new Error creates a error object for express to note and identify
	/* const error = new Error(`Can't find the ${req.originalUrl} on this server!`);
	error.status = 'fail';
	error.statusCode = 404; 
	next(error); */

	next(new AppError(`Can't find the ${req.originalUrl} on this server!`, 404));
});

//Global error handling middleware
app.use(globalErrorHandler);

//Server start/listen
module.exports = app;