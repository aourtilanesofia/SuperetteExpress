import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { Server } from "socket.io";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import multer from 'multer';


//routes imports 
import testRouter from './routes/testRoutes.js';
import connectDB from './config/db.js';
import consommateurRoutes from './routes/consommateurRoutes.js';
import livreurRoutes from './routes/livreurRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import categorieRoutes from './routes/categorieRoutes.js';
import produitRoutes from "./routes/produitRoutes.js";
import panierRoutes from "./routes/panierRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import recetteRoutes from './routes/recetteRoutes.js';

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



//middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    req.io = io;
    next();
});



// Middleware pour servir les fichiers statiques (images, etc.) depuis le dossier 'uploads/'
app.use("/uploads", express.static("uploads"));

// Servir les fichiers statiques depuis le dossier "assets"
app.use("/assets", express.static("assets"));

// Servir les fichiers statiques du dossier "assets"
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));





//routes
app.use('/api/v1', testRouter);
app.use('/api/v1/consommateur', consommateurRoutes);
app.use('/api/v1/livreur', livreurRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/categories', categorieRoutes);
app.use("/assets", express.static("assets"));
app.use("/api/produits", produitRoutes);
app.use("/panier", panierRoutes);
app.use("/api/commandes", orderRoutes);
app.use('/api/recettes', recetteRoutes);




app.get('/', (req, res) => {
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