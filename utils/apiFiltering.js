const Tour = require('./../models/tourModel');
class ApiFiltering{
    constructor(query, queryString){
        this.query = query;
        this.queryString = queryString;
    }

    filter(){
        /*------ Filtering data based on request query ---------*/
        // 1st way - req.query returns query params in object form -> req.query = {duration: 5,difficuilty: 'easy'}
        // const tours = await Tour.find(req.query);

        // PS: There are a few predefined params that needs to be excluded before passing it to query for data filtering (Eg: page - for pagination)
        const queryObj = {...this.queryString}; // ... is use to destructure the object and {} again adds them to a new object. This we have to do because, in JS, when we assign a variable/object to another variable, it references and not gets defined as independent variable
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
        // let query = Tour.find(JSON.parse(queryStr));
        this.query = this.query.find(JSON.parse(queryStr));

        return this; //Returns the entire object class for chaining other functions
    }

    sort(){
        /* --------- Sorting Data ---------- */
        //PS: For defining the asc and desc order of sort, pass query param value as such
        //ASC -> ?sort=price
        //DESC -> ?sort=-price (Add '-' before the value)
        if(this.queryString.sort){
            // query = query.sort(this.queryString.sort);

            //For multiple value sorting, pass the values in query param as comma sepearted -> ?sort=price,ratingsAverage
            //In Mongo, multiple sort value are accepted as -> query.sort('price ratingsAverage')
            //To achieve this:
            const sortByMiltiple = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortByMiltiple)
        }
        else{
            this.query = this.query.sort('-createdAt');
        }

        return this; //Returns the entire object class for chaining other functions
    }

    limitFields(){
        /*----------- Field Limiting ------------ */
        if(this.queryString.fields){
            //Pass fields in query param as comma sepearted -> ?fields=name,price,duration
            //Syntax for field limiting in Mongo -> query.select(price name duration)
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        }
        else{
            this.query = this.query.select('-__v'); //In select '-' excludes the column mentioned and returns reset of columns
        }

        return this; //Returns the entire object class for chaining other functions
    }

    paginate(){
        //Pass fields in query param as -> ?page=2&limit=10
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skipVal = (page - 1) * limit;

        this.query = this.query.skip(skipVal).limit(limit);

        //If case where user pass a page number with no records in data
        if(this.queryString.page){
            const numTours = Tour.countDocuments();
            if(skipVal >= numTours) throw new Error('This page does not exists');
        }
        return this; //Returns the entire object class for chaining other functions
    }
}

module.exports = ApiFiltering;