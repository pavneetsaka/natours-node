const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema({
    review: String,
    rating: {
        type: Number,
        required: [true, 'Please add ratings'],
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user']
    }
},{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

/* Query Middleware */
reviewSchema.pre(/^find/, function(next){
    this.populate({
        path: 'user',
        select: 'name'
    });
    /* populate({
        path: 'tour',
        select: 'name'
    }).  */
    next();
});

//Calculate a tour ratingAverage and ratingQuantity every time a review for a tour is added/updated/deleted
reviewSchema.statics.calcAverageRatings = async function(tourId){
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                noRatings: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    let no_rating = 0;
    let avg_rating = 4.5;
    if (stats.length > 0) {
        no_rating = stats[0].noRatings;
        avg_rating = stats[0].avgRating;
    }
    await Tour.findByIdAndUpdate(tourId, {
        ratingsQuantity: no_rating,
        ratingsAverage: avg_rating
    });
};
reviewSchema.post('save', function(){ //Used when creating a new review
    this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function(next){ //Used when updating/deleting a new review
    this.r = await this.findOne(); //this.r makes sure to pass the object from 'pre' to 'post' function by saving it as query variable
    next();
});
reviewSchema.post(/^findOneAnd/, async function(){
    // await this.findOne(); //does not work here, as query has been executed before 'post'
    await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;