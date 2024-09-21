
// Global/Common error catch for all async request
module.exports = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(next); //long version -> fn(req, res, next).catch(next(err)); err is what the catch method returns
    }
};
