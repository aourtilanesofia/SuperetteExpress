import commercantModel from "../models/commercantModel.js";
import Notification from '../models/NotificationModel.js';
import mongoose from 'mongoose';


// INSCRIPTION
export const inscriptionCommercantController = async (req, res) => {
    try {
        const { nom, numTel, adresseBoutique, mdp } = req.body;

        if (!nom || !numTel || !adresseBoutique || !mdp) {
            return res.status(400).send({
                success: false,
                message: "Veuillez remplir tous les champs !",
            });
        }

        if (mdp.length <= 6) {
            return res.status(400).send({ success: false, message: "Le mot de passe doit contenir plus de 6 caractères" });
        }

        const numTelRegex = /^(06|07|05)[0-9]{8}$/;
        if (!numTelRegex.test(numTel)) {
            return res.status(400).send({ success: false, message: "Le numéro de téléphone doit commencer par 06, 07 ou 05 et contenir exactement 10 chiffres" });
        }



        const commercant = await commercantModel.create({ nom, numTel, adresseBoutique, mdp });
 

        // Créer la notification **avant** d'envoyer la réponse
        try {
            const notification = new Notification({
                message: `${nom} vient de s'inscrire en tant que commerçant.`,
                isRead: false,
                role: "administrateur",
            });
            await notification.save();
            req.io.emit("newNotification", notification);
        } catch (notifError) {
            console.error("Erreur lors de la création de la notification :", notifError);
        }

        res.status(201).send({
            success: true,
            message: "Vous êtes maintenant inscrit en tant que commerçant, veuillez vous connecter",
            commercant,
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Erreur dans l'API d'inscription",
            error,
        });
    }
};

// CONNEXION
export const connexionCommercantController = async (req, res) => {
    try {
        const { numTel, mdp } = req.body;

        if (!numTel || !mdp) {
            return res.status(400).send({
                success: false,
                message: "Veuillez entrer votre numéro de téléphone et votre mot de passe!",
            });
        }

        const commercant = await commercantModel.findOne({ numTel });

        

        if (!commercant) {
            return res.status(404).send({
                success: false,
                message: "Numéro de téléphone. Veuillez réessayer !",
            });
        }

        

        if (mdp !== commercant.mdp) {
            return res.status(400).send({
                success: false,
                message: " Mot de passe invalide. Veuillez réessayer !",
            });
        }

        const token = commercant.generateToken();

        return res.status(200).cookie("token", token).send({
            success: true,
            message: "Bienvenue, vous êtes maintenant connecté en tant que commerçant!",
            token,
            commercant,
        });

    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "Erreur dans l'API de connexion",
            error,
        });
    }
};



// PROFIL COMMERÇANT
export const getCommercantProfileController = async (req, res) => {
    try {
        const commercant = await commercantModel.findById(req.user._id);

        res.status(200).send({
            success: true,
            message: "Profil commerçant récupéré avec succès",
            commercant,
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Erreur dans l'API du profil",
            error,
        });
    }
};

// MODIFIER LE PROFIL
export const updateCommercantProfileController = async (req, res) => {
    try {
        const { nom, email, numTel, adresseBoutique, mdp } = req.body;

        const commercant = await commercantModel.findById(new mongoose.Types.ObjectId(req.user._id));

        if (!commercant) {
            return res.status(404).json({ success: false, message: "Commerçant non trouvé" });
        }

        commercant.nom = nom || commercant.nom;
        commercant.email = email || commercant.email;
        commercant.numTel = numTel || commercant.numTel;
        commercant.adresseBoutique = adresseBoutique || commercant.adresseBoutique;
        commercant.mdp = mdp || commercant.mdp;

        await commercant.save();

        res.status(200).json({ success: true, message: "Profil mis à jour", commercant });

    } catch (error) {
        console.error("Erreur mise à jour profil :", error);
        res.status(500).json({ success: false, message: "Erreur serveur." });
    }
};

// SUPPRIMER LE COMPTE
export const deleteCommercantAccountController = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await commercantModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Utilisateur non trouvé"
            });
        }

        await commercantModel.findByIdAndDelete(userId);
        res.status(200).json({
            success: true,
            message: "Compte commerçant supprimé avec succès"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la suppression du compte",
            error: error.message
        });
    }
};


// Récupérer tous les commerçants
export const getAllCommercants = async (req, res) => {
    try {
        const commercants = await commercantModel.find();
        res.json(commercants);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// SUPPRIMER UN COMMERÇANT
export const deleteCommercant = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "ID manquant" });
        }

        const commercant = await commercantModel.findByIdAndDelete(id);
        if (!commercant) {
            return res.status(404).json({ message: "Commerçant introuvable !" });
        }

        res.json({ message: "Commerçant supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Activer ou désactiver un consommateur

export const toggleStatus = async (req, res) => {
    try {
        const commercant = await commercantModel.findById(req.params.id);

        if (!commercant) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        commercant.isActive = !commercant.isActive;
        await commercant.save();

        res.json(commercant);
    } catch (error) {
        console.error("Erreur lors de l'activation/désactivation :", error);
        res.status(500).json({ message: error.message });
    }
};

// Récupérer un consommateur par son ID
export const getCommercantByIdController = async (req, res) => {
    try {
        if (!req.params.id) {
            return res.status(400).json({ message: "ID manquant dans la requête" });
        }

        const commercant = await commercantModel.findById(req.params.id);
        if (!commercant) {
            return res.status(404).json({ message: "Commercant non trouvé" });
        }

        res.json({
            nom: commercant.nom,
            telephone: commercant.numTel
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
    }
};

// RÉCUPÉRER LE NOMBRE DE COMMERCANTS
export const getCommercantCountController = async (req, res) => {
    try {
        const count = await commercantModel.countDocuments();
        res.status(200).json({
            success: true,
            count,
        });
    } catch (error) {
        console.error("Erreur lors de la récupération du nombre de commerçants :", error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur",
            error,
        });
    }
};


  

