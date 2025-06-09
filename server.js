// Load environment variables
require('./config/env');

const express = require('express');
const morgan = require('morgan');
const apiRoutes = require('./routes/api');
const cors = require('cors')
const errorHandler = require('./middlewares/errorHandler');


const app = express();

// @see https://expressjs.com/en/resources/middleware/cors.html
const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}


// Middleware
app.use(cors(corsOptions))
app.use(morgan('dev'));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse x-www-form-urlencoded
app.use('/api', apiRoutes);

// change timeout to 5 minutes
app.use((req, res, next) => {
    res.setTimeout(5 * 60 * 1000, () => { // 5 minutes
        console.error('Request has timed out');
        res.status(408).json({ error: 'Request timed out' });
    });
    next();
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.NODE_PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

