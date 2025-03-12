import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { Server } from "socket.io";
import http from "http";

//routes imports 
import testRouter from './routes/testRoutes.js';
import connectDB from './config/db.js';
import consommateurRoutes from './routes/consommateurRoutes.js';
import livreurRoutes from './routes/livreurRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

//Configuration dot env
dotenv.config();

//Conexion a la base de données
connectDB();


//L'objet REST
const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});



//middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use((req, res, next) => {
    req.io = io;
    next();
});

//routes
app.use('/api/v1',testRouter);
app.use('/api/v1/consommateur',consommateurRoutes);
app.use('/api/v1/livreur',livreurRoutes);
app.use('/api/v1/notifications', notificationRoutes);

app.get('/',(req,res) => {
    return res.status(200).send("<h1>Bonjour</h1>");
});

// Gérer la connexion de socket.io
io.on("connection", (socket) => {
    console.log("Un client est connecté");
});

//Le port
/*const PORT = process.env.PORT || 8080;
//Listen
app.listen(PORT , () =>{
    console.log(`Server running on PORT ${process.env.PORT}`);
})*/



const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
});