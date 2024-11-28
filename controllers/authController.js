const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/userModel');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    /* Set token in a secure cookie. Syntax: res.cookie(name, value, options) */
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
        httpOnly: true //Prevents client side JS from accessing the cookie
    };
    if(process.env.NODE_ENV === "production"){
        cookieOptions.secure = true; //Only works on HTTPS
    }
    res.cookie('jwt', token, cookieOptions);

    //Remove password from the response
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};

exports.signup = catchAsync(async(req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role
    });

    const url = `${req.protocol}://${req.get('host')}/my-profile`;
    await new Email(newUser, url).sendWelcome();

    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body

    // 1) Check if email and password exists in the request
    if(!email || !password){
        return next(new AppError('Please provide email and password', 400));
    }

    // 2) Check if user exists and password is correct
    const user = await User.findOne({email: email}).select('+password'); // '+' before field name is added for those field for which in the Schema the 'select attribute is set to false'

    if(!user || !(await user.correctPassword(password, user.password))){
        return next(new AppError('Incorrect credentials', 401));
    }

    // 3) If all ok, send token to client
    createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({
        status: 'success'
    });
}

/* Middleware authentication for requests using JWT token */
exports.protect = catchAsync(async (req, res, next) => {
    // 1) Get token and check if its there
    let token = '';
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    if(!token){
        return next(new AppError('You are not logged in, please login to get access', 401));
    }

    // 2) Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if(!currentUser){
        return next(new AppError('The user belonging to the token no longer exists', 401));
    }

    // 4) Check if user changed password after the token was issued
    if(currentUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError('User recently changed password, please login again', 401));
    }

    // Grant access to protected route
    req.user = currentUser; //Pass current in the request
    res.locals.user = currentUser; //Pass current user in views
    next();
});

/* Middleware only for rendered view pages */
exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            // 1) Verify token
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

            // 2) Check if user still exists
            const currentUser = await User.findById(decoded.id);
            if(!currentUser){
                return next();
            }

            // 3) Check if user changed password after the token was issued
            if(currentUser.changedPasswordAfter(decoded.iat)){
                return next();
            }

            // There is a Logged In user
            res.locals.user = currentUser; // res.locals passes the variable to all the .pug template
            return next();
        } catch (err) {
            return next();
        }
    }
    next();
};

/* Middleware authentication to restrict routes based on user role */
exports.restrictTo = (...roles) => { //...roles will convert n number of params to array
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You don not have the permission to perform this action', 403))
        }
        next();
    }
}

/* Password reseet module */
exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on email id
    const user = await User.findOne({email: req.body.email});
    if (!user) {
        return next(new AppError('No user found for the email address', 404));
    }

    // 2) Generate a random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
 
    // 3) Send it to users email
    try {
        const resetURL = `${req.protocol}//${req.get('host')}/api/v1/users/reset-password/${resetToken}`;
        /* const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfrim to: ${resetURL}\nIf you did't forgot the password, please ignore this email`;
        await sendEmail({
            email: user.email,
            subject: 'Your password reset link - Valid only for 10 mins',
            message: message
        }); */

        await new Email(user, resetURL).sendPasswordReset();
    } catch(err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave:  false });

        return next(new AppError('There was en error sending email, please try agin later', 500));
    }

    res.status(200).json({
        status: 'success',
        message: 'Reset password link sent to email'
    });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on the token
    const encryptedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({passwordResetToken: encryptedToken, passwordResetExpires: { $gt: Date.now() }});

    // 2) Set the new password, only if the token is not expired and there is a user
    if (!user) {
        return next(new AppError('Token is invalid or expired', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3) Update the passwordChangedAt property
    
    // 4) Log the user in, send JWT to client
    createSendToken(user, 200, res);
});

/* Update Password for logged in user */
exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) Get user from document
    const user = await User.findById(req.user.id).select('+password');
    
    // 2) Check if password in REQUEST is correct
    if (! (await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('Invalid credentials', 401));
    }

    // 3) If password is correct, update the password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // 4) Re-login the user with new password, send JWT
    createSendToken(user, 200, res);
});