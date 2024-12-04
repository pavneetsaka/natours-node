const mongoose = require('mongoose');
const dotenv = require('dotenv');

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

//Placement of uncaughtException should always be above all the code structure inorder to catch the exceptions
process.on('uncaughtException', (err) => {
    console.log('Uncaught exception. Shutting down....');
    console.log(err.name, err.message);
    server.close(() => { // server.close gives server the time to finish all request that are still pending or beign handled at the time
        process.exit(1); // 0 - successful, 1 - Exception error
    });
});

// Funcationality to handle errors other than Operational or Programmatical errors
process.on('unhandledRejection', (err) => {
    console.log('Unhandler rejection. Shutting down....');
    console.log(err.name, err.message);
    server.close(() => { // server.close gives server the time to finish all request that are still pending or beign handled at the time
        process.exit(1); // 0 - successful, 1 - Exception error
    });
});

// TO capture SIGTERM Signal for Heroku container - dyno, which restarts the server every 24hrs and shits the app down immediately in production
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down slowly...');
    server.close(() => {
        console.log('Process terminated after SIGTERM');
    });
})