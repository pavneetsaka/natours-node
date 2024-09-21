const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Invalid email id entered']
    },
    photo: String,
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 8,
        select: false // this field will not be called in select query'
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Confirm password is required'],
        minlength: 8,
        validate: {
            //Only works for CREATE and SAVE mongoose method
            validator: function(val){
                //"this" here points to current document in the NEW document creation
                return val === this.password
            },
            message: 'Password and confirm password does not match'
        }
    },
    passwordChangedAt: Date
});

userSchema.pre('save', async function(next){
    // Only run this functiona when password field is modified
    if(!this.isModified('password')) return next();

    // Hash the password with the cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // Delete passwordConfirm field to aoid persisting it into DB
    this.passwordConfirm = undefined;
    next();
});

//Instance method
userSchema.methods.correctPassword = async (reqPassword, userPassword) => {
    return await bcrypt.compare(reqPassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};

const User = mongoose.model('User', userSchema); //Naming convention to always use uppercase for model

module.exports = User;