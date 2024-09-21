// const fs = require('fs');
const Tour = require('./../models/tourModel');

/*---Exporting all API Filtering of data via dedicated class---*/
const ApiFiltering = require('./../utils/apiFiltering');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

/*const tours = JSON.parse(
	fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);*/

//Validation for Param method
/*exports.checkId = (req, res, next, val) => {
	const id = val*1; //To convert a integer looking string to int data type Eg: '5'*1 = 5
	const tour = tours.find(el => el.id === id);

	// if(id > tours.length){
	if(!tour){
		return res.status(404).json({
			status: 'fail',
			message: 'Invalid ID'
		});
	}
	next();
};*/

//Custom validation via middleware
exports.aliasTop5Tours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}

/*exports.checkBody = (req, res, next) => {
	//Check if request has name and price property
	const data = req.body;
	if(!data.name){
		return res.status(400).json({
			status: 'fail',
			message: 'Name param is required'
		});
	}
	else if(!data.price){
		return res.status(400).json({
			status: 'fail',
			message: 'Price param is required'
		});
	}
	next();
};*/

// exports.getAllTours = async (req, res) => {
//     try{
//         // const tours = await Tour.find();

//         // /*------ Filtering data based on request query ---------*/
//         // // 1st way - req.query returns query params in object form -> req.query = {duration: 5,difficuilty: 'easy'}
//         // // const tours = await Tour.find(req.query);

//         // // PS: There are a few predefined params that needs to be excluded before passing it to query for data filtering (Eg: page - for pagination)
//         // const queryObj = {...req.query}; // ... is use to destructure the object and {} again adds them to a new object. This we have to do because, in JS, when we assign a variable/object to another variable, it references and not gets defined as independent variable
//         // const excludedFields = ["page", "sort", "limit", "fields"];
//         // excludedFields.forEach(el => delete queryObj[el]);
//         // // const tours = await Tour.find(queryObj);

//         // // 2nd way
//         // // const tour = Tour.find().where('duration').equals('5').where('difficuilty').equals('easy');

//         // /* -------- Advance Filtering ---------- */
//         // //For writing conditional query in Mongo, syntax used is {duration: {$gte: 5}}. Operators are defined in a text format.
//         // //To achieve this, we can pass the operator in the query param like -> ?duration[gte]=5
//         // //This returns req.query as {duration: {gte: 5}}, as expected, except for the '$' before the operator
//         // let queryStr = JSON.stringify(queryObj);
//         // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
//         // // const tours = await Tour.find(JSON.parse(queryStr));
//         // let query = Tour.find(JSON.parse(queryStr));

//         // /* --------- Sorting Data ---------- */
//         // //PS: For defining the asc and desc order of sort, pass query param value as such
//         // //ASC -> ?sort=price
//         // //DESC -> ?sort=-price (Add '-' before the value)
//         // if(req.query.sort){
//         //     // query = query.sort(req.query.sort);

//         //     //For multiple value sorting, pass the values in query param as comma sepearted -> ?sort=price,ratingsAverage
//         //     //In Mongo, multiple sort value are accepted as -> query.sort('price ratingsAverage')
//         //     //To achieve this:
//         //     const sortByMiltiple = req.query.sort.split(',').join(' ');
//         //     query = query.sort(sortByMiltiple)
//         // }
//         // else{
//         //     query = query.sort('-createdAt');
//         // }

//         // /*----------- Field Limiting ------------ */
//         // if(req.query.fields){
//         //     //Pass fields in query param as comma sepearted -> ?fields=name,price,duration
//         //     //Syntax for field limiting in Mongo -> query.select(price name duration)
//         //     const fields = req.query.fields.split(',').join(' ');
//         //     query = query.select(fields);
//         // }
//         // else{
//         //     query = query.select('-__v'); //In select '-' excludes the column mentioned and returns reset of columns
//         // }

//         /* ------  Pagination and Limiting ------- */
//         //Pass fields in query param as -> ?page=2&limit=10
//         // const page = req.query.page * 1 || 1;
//         // const limit = req.query.limit * 1 || 100;
//         // const skipVal = (page - 1) * limit;

//         // query = query.skip(skipVal).limit(limit);

//         // //If case where user pass a page number with no records in data
//         // if(req.query.page){
//         //     const numTours = await Tour.countDocuments();
//         //     if(skipVal >= numTours) throw new Error('This page does not exists');
//         // }
//         // const tours = await query;

//         //Here Tour.find() returns the cursor to the document in the mongoDB
//         //By defining all filtering inside a dedicated class
//         const feature = new ApiFiltering(Tour.find(), req.query)
//         .filter()
//         .sort()
//         .limitFields()
//         .paginate();
//         const tours = await feature.query;

//     	res.status(200).json({
//     		status : 'success',
//     		results: tours.length,
//     		data: {
//     			tours
//     		}
//     	});
//     }
//     catch(err){
//         res.status(400).json({
//             status: 'fail',
//             message: err
//         });
//     }
// };

//Optimized way with a global catch method provided by express - MongoDB
exports.getAllTours = catchAsync(async (req, res, next) => {
    //Here Tour.find() returns the cursor to the document in the mongoDB
    //By defining all filtering inside a dedicated class
    const feature = new ApiFiltering(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    const tours = await feature.query;

    res.status(200).json({
        status : 'success',
        results: tours.length,
        data: {
            tours
        }
    });
});

// exports.getTour = async (req, res) => {
// 	// const id = req.params.id*1; //To convert a integer looking string to int data type Eg: '5'*1 = 5
// 	/*const tour = tours.find(el => el.id === id);

// 	//validation handled via checkId()

// 	res.status(200).json({
// 		status: 'success',
// 		data: {
// 			tour
// 		}
// 	})*/

//     /*--- Via Mongoose ----*/
//     try{
//         const tour = await Tour.findById(req.params.id); //findById() is a shorthand for findOne({_id: 4533})
//         res.status(200).json({
//             status: 'success',
//             data: {
//                 tour
//             }
//         })
//     }
//     catch(err){
//         res.status(400).json({
//             status: 'fail',
//             message: err
//         })
//     }
// };

//Optimized way with a global catch method provided by express - MongoDB
exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.id); //findById() is a shorthand for findOne({_id: 4533})

    if(!tour){
        return next(new AppError('No tour found for this ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    })
});

// exports.createTour = async (req, res) => {
//     /* -------- File based --------- */
// 	/*const newId = tours[tours.length-1].id +1;
// 	const newTour = Object.assign({id: newId}, req.body);

// 	tours.push(newTour);

// 	fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
// 		res.status(201).json({
// 			status : 'success',
// 			data: {
// 				tour: newTour
// 			}
// 		});
// 	});*/

//     /* ---- Via Mongoose - MongoDB ----*/
//     try{
//         // const newTour = new Tour({});
//         // newTour.save();
//         const newTour = await Tour.create(req.body)

//         res.status(201).json({
//             status : 'success',
//             data: {
//                 tour: newTour
//             }
//         });
//     }
//     catch(err){
//         res.status(400).json({
//             status: 'fail',
//             message: err //Validator error message
//         })
//     }
// };

//Optimized way with a global catch method provided by express - MongoDB
exports.createTour = catchAsync(async (req, res, next) => {
    const newTour = await Tour.create(req.body)

    res.status(201).json({
        status : 'success',
        data: {
            tour: newTour
        }
    });
});

// exports.updateTour = async (req, res) => {
//     /* ---- Via Mongoose ----*/
//     try{
//         const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//             new: true, //Return updated document object
//             runValidators: true //To run the schema validation for update command
//         });
//     	res.status(200).json({
//     		status: 'success',
//             message: 'Tour updated',
//     		data: {
//     			tour
//     		}
//     	});
//     }
//     catch(err){
//         res.status(400).json({
//             status: 'fail',
//             message: err
//         })
//     }
// };

//Optimized way with a global catch method provided by express - MongoDB
exports.updateTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true, //Return updated document object
        runValidators: true //To run the schema validation for update command
    });

    if(!tour){
        return next(new AppError('No tour found for this ID', 404));
    }

    res.status(200).json({
        status: 'success',
        message: 'Tour updated',
        data: {
            tour
        }
    });
});

// exports.deleteTour = async (req, res) => {
//     /*--- Via Mongoose ---*/
//     try{
//         await Tour.findByIdAndDelete(req.params.id);
//     	res.status(204).json({
//     		status: 'success',
//     		data: null
//     	});
//     }
//     catch(err){
//         res.status(400).json({
//             status: 'fail',
//             message: err
//         });
//     }
// };

//Optimized way with a global catch method provided by express - MongoDB
exports.deleteTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id);

    if(!tour){
        return next(new AppError('No tour found for this ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});

/* ------ Aggregation Pipeline ------ */
// This is use to perform db actions like join, group
// exports.getTourStats = async (req, res) => {
//     try{
//         const stats = await Tour.aggregate([
//             {
//                 $match: {ratingsAverage: {$gte: 4.5}}
//             }, {
//                 $group: {
//                     _id: '$difficulty', //This field is use to group the results based on value passed. NULL here returns result in one object. '$difficulty' returns 3 object of results for each difficulty value (easy, medium, difficult)
//                     totalTours: {$sum: 1},
//                     totalRatings: {$sum: '$ratingsQuantity'},
//                     avgRatings: {$avg: '$ratingsAverage'},
//                     avgPrice: {$avg: '$price'},
//                     minPrice: {$min: '$price'},
//                     maxPrice: {$max: '$price'},
//                 }
//             }, {
//                 // All stages defined after $group will only filter/sort data from the $group requested fields
//                 $sort: {
//                     avgPrice: 1
//                 }
//             }, /*{
//                 $match: {_id: {$ne: 'easy'}}
//             }*/
//         ]);

//         res.status(200).json({
//             status: 'success',
//             data: {stats}
//         });
//     }
//     catch(err){
//         res.status(400).json({
//             status: 'fail',
//             message: err
//         });
//     }
// }

//Optimized way with a global catch method provided by express - MongoDB
exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: {ratingsAverage: {$gte: 4.5}}
        }, {
            $group: {
                _id: '$difficulty', //This field is use to group the results based on value passed. NULL here returns result in one object. '$difficulty' returns 3 object of results for each difficulty value (easy, medium, difficult)
                totalTours: {$sum: 1},
                totalRatings: {$sum: '$ratingsQuantity'},
                avgRatings: {$avg: '$ratingsAverage'},
                avgPrice: {$avg: '$price'},
                minPrice: {$min: '$price'},
                maxPrice: {$max: '$price'},
            }
        }, {
            // All stages defined after $group will only filter/sort data from the $group requested fields
            $sort: {
                avgPrice: 1
            }
        }, /*{
            $match: {_id: {$ne: 'easy'}}
        }*/
    ]);

    res.status(200).json({
        status: 'success',
        data: {stats}
    });
});

/* ------ Aggregation Pipeline - Unwinding and Projecting ------ */
// exports.getMonthlyPlan = async (req, res) => {
//     try{
//         const year = req.params.year * 1; //* 1 is to convert from string to int
//         const plan = await Tour.aggregate([
//             {
//                 //Desconstructs the array field from the document and outputs one document for each array value
//                 $unwind: '$startDates'
//             },
//             {
//                 $match: {
//                     startDates: {
//                         $gte: new Date(`${year}-01-01`),
//                         $lte: new Date(`${year}-12-31`),
//                     }
//                 }
//             },
//             {
//                 $group:{
//                     _id: {$month: '$startDates'}, //_id field is use to identify the one column which we will group by from
//                     // year: {$push: {$year: '$startDates'}},
//                     tours: {$push: '$name'},
//                     totalTours: {$sum: 1}
//                 }
//             },
//             {
//                 $addFields: {month: '$_id'} //addFields is use to add a new object key. Syntax: {newName: '$columnName'}
//             },
//             {
//                 $project: {_id: 0} //project can be used to hide/show a key (0: hide, 1: show)
//             },
//             {
//                 $sort: {
//                     totalTours: -1
//                 }
//             }
//         ]);

//         res.status(200).json({
//             status: 'success',
//             data: {plan}
//         });
//     }
//     catch(err){
//         res.status(400).json({
//             status: 'fail',
//             message: err
//         });
//     }
// }

//Optimized way with a global catch method provided by express - MongoDB
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1; //* 1 is to convert from string to int
    const plan = await Tour.aggregate([
        {
            //Desconstructs the array field from the document and outputs one document for each array value
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`),
                }
            }
        },
        {
            $group:{
                _id: {$month: '$startDates'}, //_id field is use to identify the one column which we will group by from
                // year: {$push: {$year: '$startDates'}},
                tours: {$push: '$name'},
                totalTours: {$sum: 1}
            }
        },
        {
            $addFields: {month: '$_id'} //addFields is use to add a new object key. Syntax: {newName: '$columnName'}
        },
        {
            $project: {_id: 0} //project can be used to hide/show a key (0: hide, 1: show)
        },
        {
            $sort: {
                totalTours: -1
            }
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: {plan}
    });
});