const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const ApiFiltering = require('./../utils/apiFiltering');

exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if(!doc){
        return next(new AppError('No document found for this ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true, //Return updated document object
        runValidators: true //To run the schema validation for update command
    });

    if(!doc){
        return next(new AppError('No document found for this ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    });
});

exports.createOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body)

    res.status(201).json({
        status : 'success',
        data: {
            data: doc
        }
    });
});

exports.getOne = (Model, populateOptions) => catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) {
        query.populate(populateOptions);
    }
    const doc = await query;

    if(!doc){
        return next(new AppError('No document found for this ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    })
});

exports.getAll = Model => catchAsync(async (req, res, next) => {
    //Hack for nested GET reviews by tour route
    let filter = {};
    if(req.params.tourId) filter = { tour: req.params.tourId };

    const feature = new ApiFiltering(Model.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    // const doc = await feature.query.explain(); //explain() is used to elaborate the query executed
    const doc = await feature.query;

    // res.status(200).json({
    res.status(200).json({
        status : 'success',
        results: doc.length,
        data: {
            data: doc
        }
    });
});