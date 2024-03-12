// const fs = require('fs');
const Tour = require('./../models/tourModel');

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

exports.getAllTours = async (req, res) => {
    try{
        // const tours = await Tour.find();

        /*------ Filtering data based on request query ---------*/
        // 1st way - req.query returns query params in object form -> req.query = {duration: 5,difficuilty: 'easy'}
        // const tours = await Tour.find(req.query);

        // PS: There are a few predefined params that needs to be excluded before passing it to query for data filtering (Eg: page - for pagination)
        const queryObj = {...req.query}; // ... is use to destructure the object and {} again adds them to a new object. This we have to do because, in JS, when we assign a variable/object to another variable, it references and not gets defined as independent variable
        const excludedFields = ["page", "sort", "limit", "fields"];
        excludedFields.forEach(el => delete queryObj[el]);
        // const tours = await Tour.find(queryObj);

        // 2nd way
        // const tour = Tour.find().where('duration').equals('5').where('difficuilty').equals('easy');

        /* -------- Advance Filtering ---------- */
        //For writing conditional query in Mongo, syntax used is {duration: {$gte: 5}}. Operators are defined in a text format.
        //To achieve this, we can pass the operator in the query param like -> ?duration[gte]=5
        //This returns req.query as {duration: {gte: 5}}, as expected, except for the '$' before the operator
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        // const tours = await Tour.find(JSON.parse(queryStr));

        /* --------- Sorting Data ---------- */
        //PS: For defining the asc and desc order of sort, pass query param value as such
        //ASC -> ?sort=price
        //DESC -> ?sort=-price (Add '-' before the value)
        let query = Tour.find(JSON.parse(queryStr));
        if(req.query.sort){
            // query = query.sort(req.query.sort);

            //For multiple value sorting, pass the values in query param as comma sepearted -> ?sort=price,ratingsAverage
            //In Mongo, multiple sort value are accepted as -> query.sort('price ratingsAverage')
            //To achieve this:
            const sortByMiltiple = req.query.sort.split(',').join(' ');
            query = query.sort(sortByMiltiple)
        }

        /*----------- Field Limiting ------------ */
        if(req.query.fields){
            //Pass fields in query param as comma sepearted -> ?fields=name,price,duration
            //Syntax for field limiting in Mongo -> query.select(price name duration)
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);
        }
        else{
            query = query.select('-__v'); //In select '-' excludes the column mentioned and returns reset of columns
        }
        const tours = await query;

    	res.status(200).json({
    		status : 'success',
    		results: tours.length,
    		data: {
    			tours
    		}
    	});
    }
    catch(err){
        res.status(400).json({
            status: 'fail',
            message: err
        });
    }
};

exports.getTour = async (req, res) => {
	// const id = req.params.id*1; //To convert a integer looking string to int data type Eg: '5'*1 = 5
	/*const tour = tours.find(el => el.id === id);

	//validation handled via checkId()

	res.status(200).json({
		status: 'success',
		data: {
			tour
		}
	})*/

    /*--- Via Mongoose ----*/
    try{
        const tour = await Tour.findById(req.params.id); //findById() is a shorthand for findOne({_id: 4533})
        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        })
    }
    catch(err){
        res.status(400).json({
            status: 'fail',
            message: err
        })
    }
};

exports.createTour = async (req, res) => {
	/*const newId = tours[tours.length-1].id +1;
	const newTour = Object.assign({id: newId}, req.body);

	tours.push(newTour);

	fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
		res.status(201).json({
			status : 'success',
			data: {
				tour: newTour
			}
		});
	});*/

    /* ---- Via Mongoose ----*/
    try{
        // const newTour = new Tour({});
        // newTour.save();
        const newTour = await Tour.create(req.body)

        res.status(201).json({
            status : 'success',
            data: {
                tour: newTour
            }
        });
    }
    catch(err){
        res.status(400).json({
            status: 'fail',
            message: 'Invalid data sent.'
        })
    }
};

exports.updateTour = async (req, res) => {
    /* ---- Via Mongoose ----*/
    try{
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true, //Return updated document object
            runValidators: true //To run the schema validation for update command
        });
    	res.status(200).json({
    		status: 'success',
            message: 'Tour updated',
    		data: {
    			tour
    		}
    	});
    }
    catch(err){
        res.status(400).json({
            status: 'fail',
            message: err
        })
    }
};

exports.deleteTour = async (req, res) => {
    /*--- Via Mongoose ---*/
    try{
        await Tour.findByIdAndDelete(req.params.id);
    	res.status(204).json({
    		status: 'success',
    		data: null
    	});
    }
    catch(err){
        res.status(400).json({
            status: 'fail',
            message: err
        });
    }
};