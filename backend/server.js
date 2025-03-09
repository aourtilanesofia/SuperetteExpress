import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

//routes imports 
import testRouter from './routes/testRoutes.js';
import connectDB from './config/db.js';
import consommateurRoutes from './routes/consommateurRoutes.js';
import livreurRoutes from './routes/livreurRoutes.js';

//Configuration dot env
dotenv.config();

//Conexion a la base de données
connectDB();


//L'objet REST
const app = express();



//middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(cors());
app.use(cookieParser());

//routes
app.use('/api/v1',testRouter);
app.use('/api/v1/consommateur',consommateurRoutes);
app.use('/api/v1/livreur',livreurRoutes);

app.get('/',(req,res) => {
    return res.status(200).send("<h1>Bonjour</h1>");
});
//Le port
const PORT = process.env.PORT || 8080;
//Listen
app.listen(PORT , () =>{
    console.log(`Server running on PORT ${process.env.PORT}`);
})