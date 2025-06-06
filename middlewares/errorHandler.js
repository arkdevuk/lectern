module.exports = (err, req, res, next) => {
    // todo add reporting to ELK
    console.error('we should log this : ', err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
};
