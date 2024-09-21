const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');

//Syntax: mongoose.Schema(Schema defination Obj, Schema Option Obj[optional])
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'], //Also validators
        unique: true,
        trim: true,
        maxlength: [40, 'A tour name must have less or equal to 40 characters'], //Validators
        minlength: [10, 'A tour name must have greater or equal to 10 characters'], //Validators
        // validate: [validator.isAlpha, 'Tour name must only contains characters'] //Using Validator.js plugin
    },
    slug: {
        type: String,
        unique: true
    },
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: "Difficulty can only be easy, medium or difficult"
        }
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Ratings must be 1 or greater'], //Validators
        max: [5, 'Ratings must be 5 or less'] //Validators
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount: {
        type: Number,
        validate: { //Custom validator
            //Only works for CREATE and SAVE mongoose method
            validator: function(val){
                //"this" here points to current document in the NEW document creation
                return val < this.price
            },
            message: 'Discounted price ({VALUE}) cannot be grater than tour price'
        }
    },
    summary: {
        type: String,
        trim: true,
        require: [true, 'A tour must have a summary']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        requried: [true, 'A tour must have a cover image']
    },
    images: {
        type: [String]
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false //Set this to false to exclude the column from all select query by default
    },
    startDates: [Date],
    secretTour:{
        type: Boolean,
        default: false
    }
},{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

/*Virtual Properties - Fields defined in Schema but not persisted/saved in DB => Eg: Converting miles or kms -> Here 'miles' is saved and convertion to 'kms' can be virtual property
Ps: Virtual property cannot be used to filter in query
*/
tourSchema.virtual('durationWeeks').get(function(){
    return this.duration / 7;
});

/*-- Mongoose - Document Middleware -> pre(), post() for save and create events only --*/
tourSchema.pre('save', function(next){
    this.slug = slugify(this.name, {lower: true}); //this - its the current document object that is going to be saved in MongoDB
    next();
});
/*tourSchema.post('save', function(doc, next){ //doc - the last saved doc (only available for post()), next - to execute the next inline middleware
    console.log(doc);
    next();
});*/

/* -- Query Middleware -> Executes before or after any query -- */
//tourSchema.pre('find', function(next){ //For single 'find' command
tourSchema.pre(/^find/, function(next){ //For all 'find' commands(find, findOne, findOneAndDelete etc) using regex
    this.find({secretTour: {$ne: true}});
    this.start = Date.now();
    next();
});
tourSchema.post(/^find/, function(docs, next){
    console.log(`Query took ${Date.now() - this.start} milliseconds`);
    next();
});

/* -- Aggregation Middleware -> Executes before or after an aggregation ('aggregate' mongoose command) -- */
tourSchema.pre('aggregate', function(next){
    this.pipeline().unshift({$match: {secretTour: {$ne: true}}}); //this.pipeline() give access to the aggregate array object defined for agrgegate function //unshift is use to add a value to array at the index 0, shift to add value to array at last place
    next();
});

const Tour = mongoose.model('Tour', tourSchema); //Naming convention to always use uppercase for model

module.exports = Tour;