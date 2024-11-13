const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

exports.getMe = (req, res, next) => {
	req.params.id = req.user.id;
	next();
};

const filterObj = (obj, ...allowedFields) => {
	const newObj = {};
	Object.keys(obj).forEach(el => {
		if(allowedFields.includes(el)) newObj[el] = obj[el];
	});
	return newObj;
};

/* Update the user info - except for password */
exports.updateMe = catchAsync(async (req, res, next) => {
	// 1) Create error if user POSTs password data
	if(req.body.password || req.body.passwordConfirm) {
		return next(new AppError('This route is not for password updates.', 400));
	}

	// 2) Update user document
	const filteredBody = filterObj(req.body, 'name', 'email');
	const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
		new: true,
		runValidators: true
	});

	res.status(200).json({
		status: 'success',
		message: 'User updated successfully',
		data: {
			user: updatedUser
		}
	});
});

exports.deleteMe = catchAsync(async (req, res, next) => {
	await User.findByIdAndUpdate(req.user.id, { active: false });

	res.status(204).json({
		status: 'success',
		message: 'User deleted successfully'
	});
});

exports.createUser = (req, res) => {
	res.status(500).json({
		status: 'error',
		message: 'This route is not yet defined!'
	});
};

/* exports.getAllUsers = catchAsync(async (req, res) => {
	const users = await User.find();
	res.status(200).json({
		status: 'success',
		data: {
			users
		}
	});
}); */
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User); //Do NOT update passwords using this
exports.deleteUser = factory.deleteOne(User);
