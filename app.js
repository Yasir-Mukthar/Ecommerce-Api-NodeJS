import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import mongoose from 'mongoose';
import  authJwt , {isAdmin} from './helpers/jwt.js';

const app = express();
const api=process.env.API_URL;



// Middleware
app.use(morgan('tiny'));
app.use(bodyParser.json()); 
app.use(cors());
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
dotenv.config(
    {path: './.env'}
);




// Routes Import
import productRouter from './routes/product.routes.js';
import userRouter from './routes/users.routes.js';
import orderRouter from './routes/orders.routes.js';
import categoryRouter from './routes/categories.routes.js';

// Routes
app.use(`/api/v1`, productRouter);
app.use(`/api/v1`, userRouter);
app.use(authJwt());



app.use(`/api/v1`, orderRouter);
app.use(`/api/v1`,isAdmin, categoryRouter);






// Database Connection
mongoose.connect(process.env.CONNECTION_STRING)
.then(() => {
    console.log('Database connection is ready');
})
.catch((err) =>{
    console.log(err);
});


// Server Listener
app.listen(process.env.API_PORT, () => {
    console.log(`Server is running on port ${process.env.API_PORT || 3000}`);
    });