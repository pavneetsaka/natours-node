const fs = require('fs');

const tours = JSON.parse(
	fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

//Validation for Param method
exports.checkId = (req, res, next, val) => {
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
};

//Custom validation via middleware
exports.checkBody = (req, res, next) => {
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
};

exports.getAllTours = (req, res) => {
	res.status(200).json({
		status : 'success',
		requestedAt: req.returnTime,
		results: tours.length,
		data: {
			tours
		}
	});
};

exports.getTour = (req, res) => {
	const id = req.params.id*1; //To convert a integer looking string to int data type Eg: '5'*1 = 5
	const tour = tours.find(el => el.id === id);

	//validation handled via checkId()

	res.status(200).json({
		status: 'success',
		data: {
			tour
		}
	})
};

exports.createTour = (req, res) => {
	const newId = tours[tours.length-1].id +1;
	const newTour = Object.assign({id: newId}, req.body);

	tours.push(newTour);

	fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
		res.status(201).json({
			status : 'success',
			data: {
				tour: newTour
			}
		});
	});
};

exports.updateTour = (req, res) => {
	const data = req.body;
	
	//validation handled via checkId()

	res.status(200).json({
		status: 'success',
		data: {
			tour: '<Updated tour here...>'
		}
	});
};

exports.deleteTour = (req, res) => {
	const data = req.body;
	
	//validation handled via checkId()

	res.status(204).json({
		status: 'success',
		data: null
	});
};