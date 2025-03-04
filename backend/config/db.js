//Etablir une connexion avec la base de données
import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log(`Mongodb connected successfully ${mongoose.connection.host}`);
        
    } catch (error) {
        console.log(`Error ${error}`);
        
    }
};

export default connectDB;