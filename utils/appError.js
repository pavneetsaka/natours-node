//Custom error class which extends Express Error class
class AppError extends Error {
    constructor(message, statusCode) {
        super(message); //To call the parent class constructor

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
