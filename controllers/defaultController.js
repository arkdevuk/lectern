

exports.handleHealthcheck = async (req, res) => {
    // return 200 ok
    res.status(200).json({
        error: false,
        message: 'API is running',
        version: process.env.VERSION || 'unknown',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
}
