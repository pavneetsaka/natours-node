//Expres auto identifies if a middleware is a error handling middleware and only calls it when there's an error when instead of 3, 4 params are passed ro the function -> Starting with 'err'

const AppError = require("./../utils/appError");

const handleCastErrorDB = err => {
	const message = `Invalid ${err.path}: ${err.value}.`;
	return new AppError(message, 400);
};

const duplicateFieldsDB = err => {
	const errMsg = err.errmsg || err.message;
	const value = errMsg.match(/(["'])(\\?.)*?\1/)[0];
	const message = `Duplicate field value: ${value}. Please use another value.`;
	return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
	const errors = Object.values(err.errors).map(el => el.message);
	const message = `Invalid input data. ${errors.join('. ')}`;
	return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Invaid token, please login again', 401);

const handleJWTExpireError = () => new AppError('Token expired, please login again', 401);

const sendErrorDev = (err, req, res) => {
	// A) FOR API
	if (req.originalUrl.startsWith('/api')) {
		res.status(err.statusCode).json({
			status: err.status,
			error: err,
			message: err.message,
			stack: err.stack
		});
	}
	// B) FOR Rendered website
	console.error('Error 💥', err);
	res.status(err.statusCode).render('error', {
		title: 'Something went wrong!',
		msg: err.message
	});
};

const sendErrorProd = (err, req, res) => {
	// A) FOR API
	if (req.originalUrl.startsWith('/api')) {
		// Operational, trusted error: send message to client
		if (err.isOperational) {
			return res.status(err.statusCode).json({
				status: err.status,
				message: err.message
			});
		}
		// Programming or other unknown error: don't leak error details
		// 1) Log error
		console.error('Error 💥', err);
		// 2) Send generic response
		return res.status(500).json({
			status: 'error',
			message: 'Something went very wrong!'
		});
	}

	// B) FOR Rendered Website
	if (err.isOperational) {
		return res.status(err.statusCode).render('error', {
			title: 'Something went wrong!',
			msg: err.message
		});
	}
	// Programming or other unknown error: don't leak error details
	// 1) Log error
	console.error('Error 💥', err);
	// 2) Send generic response
	return res.status(err.statusCode).render('error', {
		title: 'Something went wrong!',
		msg: 'Please try again later.'
	});
};

module.exports = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';
	
	if(process.env.NODE_ENV === 'development'){
		sendErrorDev(err, req, res);
	} else {
		let error = {...err, name: err.name, message: err.message};
		if(error.name === "CastError"){
			error = handleCastErrorDB(error);
		}
		if(error.code === 11000){
			error = duplicateFieldsDB(error);
		}
		if(error.name === "ValidationError"){
			error = handleValidationErrorDB(error);
		}
		if(error.name === "JsonWebTokenError"){
			error = handleJWTError();
		}
		if(error.name === "TokenExpiredError"){
			error = handleJWTExpireError();
		}
		sendErrorProd(error, req, res);
	}
}
