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

const sendErrorDev = (err, res) => {
	res.status(err.statusCode).json({
		status: err.status,
		error: err,
		message: err.message,
		stack: err.stack
	});
};

const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    } else {
        // Programming or other unknown error: don't leak error details
		// 1) Log error
        console.error('Error 💥', err);

		// 2) Send generic response
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!'
        });
    }
};

module.exports = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';
	
	if(process.env.NODE_ENV === 'development'){
		sendErrorDev(err, res);
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
		sendErrorProd(error, res);
	}
}
