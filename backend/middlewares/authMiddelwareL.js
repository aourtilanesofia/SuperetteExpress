import jwt from "jsonwebtoken";
import livreurModel from './../models/livreurModel.js';

const isAuthL = async (req, res, next) => {
    console.log("Middleware isAuthL exécuté");
    console.log("Headers reçus :", req.headers);
    console.log("Cookies reçus :", req.cookies);

    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        console.log("Aucun token trouvé");
        return res.status(401).json({ message: "Accès refusé, aucun token" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Token décodé :", decoded);

        req.user = await livreurModel.findById(decoded._id).select("-password");

        if (!req.user) {
            return res.status(401).json({ message: "Utilisateur non trouvé" });
        }

        next();
    } catch (error) {
        console.error("Erreur d'authentification :", error.name, error.message);
        return res.status(401).json({ message: "Token invalide ou expiré" });
    }
};

export default isAuthL;


