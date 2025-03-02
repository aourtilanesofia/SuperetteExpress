import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';

//Configuration dot env
dotenv.config();



//L'objet REST
const app = express();

//middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(cors());

//routes

app.get('/',(req,res) => {
    return res.status(200).send("<h1>Bonjour</h1>");
});
//Le port
const PORT = process.env.PORT || 8080;
//Listen
app.listen(PORT , () =>{
    console.log(`Server running on PORT ${process.env.PORT}`);
})