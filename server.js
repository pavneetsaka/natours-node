const mongoose = require('mongoose');
const dotenv = require('dotenv');

//Placement of uncaughtException should always be above all the code structure inorder to catch the exceptions
process.on('uncaughtException', (err) => {
    console.log('Uncaught exception. Shutting down....');
    console.log(err.name, err.message);
    server.close(() => { // server.close gives server the time to finish all request that are still pending or beign handled at the time
        process.exit(1); // 0 - successful, 1 - Exception error
    });
});

dotenv.config({path: './config.env'});

const app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(conn => console.log('DB connection successful'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
	console.log(`App running on port ${port}...`);
});

// Funcationality to handle errors other than Operational or Programmatical errors
process.on('unhandledRejection', (err) => {
    console.log('Unhandler rejection. Shutting down....');
    console.log(err.name, err.message);
    server.close(() => { // server.close gives server the time to finish all request that are still pending or beign handled at the time
        process.exit(1); // 0 - successful, 1 - Exception error
    });
});
