const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
const multer = require('multer'); // Tp habdle file uplod in expressjs
const sharp = require('sharp'); // Image procssing library

/* //To upload image directly to the storage disk
	const multerStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'public/img/users');
	},
	filename: (req, file, cb) => {
		const ext = file.mimetype.split('/')[1]; //Extension
		cb(null, `user-${req.user.id}-${Date.now()}.${ext}`); //Custom file name -> user-userid-timestanp.extension
	}
}); */
const multerStorage = multer.memoryStorage(); // To save/hold image in memory as buffer. Disk storage of file is managed here by sharp library

const multerFilter = (req, file, cb) => {
	if (file.mimetype.startsWith('image')) {
		cb(null, true);
	} else {
		cb(new AppError('Not an image, please upload only image type', 400), false);
	}
};

const upload = multer({
	storage: multerStorage,
	fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo'); //Using multer, upload.single(File-FormFieldName) is a middleware to upload img to defined destination 

//Resize user upload photo using sharp library
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
	if (!req.file) return next();

	req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

	await sharp(req.file.buffer)
		.resize(500, 500)
		.toFormat('jpeg')
		.jpeg({quality: 90})
		.toFile(`public/img/users/${req.file.filename}`);

	next();
});

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
	if (req.file) filteredBody.photo = req.file.filename;
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
