const errorHandlerMiddleware = async (err, req, res, next) => {
    return res.status(err.status).json(err);
};
export default errorHandlerMiddleware;
