const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError'); //Custom error class
const globalErrorHandler = require('./controllers/errorController'); //Custom error handling middleware function
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//Middlewares
if(process.env.NODE_ENV === 'development'){
	app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

/*---Custom Middleware---*/
/* app.use((req, res, next) => {
	console.log('Hello from the middleware!');
	next();
}); */

app.use((req, res, next) => {
	req.returnTime = new Date().toISOString();
	next();
});
/*---Custom Middleware---*/

//Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

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