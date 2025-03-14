
import livreurModel from '../models/livreurModel.js';
import Notification from '../models/NotificationModel.js';
import { sendEmail } from '../utils/emailService.js';


// INSCRIPTION
export const inscriptionControllerL = async (req, res) => {
    try {
        const { nom, numTel, categorie, matricule, email, mdp } = req.body;

        if (!nom || !numTel || !categorie || !matricule || !email || !mdp) {
            return res.status(400).send({ success: false, message: "Remplissez tous les champs svp!" });
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        if (!emailRegex.test(email)) {
            return res.status(400).send({ success: false, message: "L'email doit être au format 'exemple@gmail.com'" });
        }

        if (mdp.length <= 6) {
            return res.status(400).send({ success: false, message: "Le mot de passe doit contenir plus de 6 caractères" });
        }

        const numTelRegex = /^(06|07|05)[0-9]{8}$/;
        if (!numTelRegex.test(numTel)) {
            return res.status(400).send({ success: false, message: "Le numéro de téléphone doit commencer par 06, 07 ou 05 et contenir exactement 10 chiffres" });
        }

        const existingLivreur = await livreurModel.findOne({ email });
        if (existingLivreur) {
            return res.status(400).send({ success: false, message: "Adresse e-mail déjà utilisée!" });
        }

        const livreur = await livreurModel.create({ nom, numTel, categorie, matricule, email, mdp });

        // Créer la notification **avant** d'envoyer la réponse
        try {
            const notification = new Notification({
                message: `${nom} vient de s'inscrire en tant que livreur.`,
                isRead: false,
            });
            await notification.save();
            console.log("Notification envoyée via Socket.io :", notification);
            req.io.emit("newNotification", notification);
        } catch (notifError) {
            console.error("Erreur lors de la création de la notification :", notifError);
        }
 
        // Envoyer la réponse une seule fois à la fin
        res.status(201).send({
            success: true,
            message: "Inscription réussie, veuillez vous connecter",
            livreur,
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, message: "Erreur dans l'inscription", error });
    }
};


// CONNEXION
export const connexionControllerL = async (req, res) => {
    try {
        const { email, mdp } = req.body;

        if (!email || !mdp) {
            return res.status(400).json({ success: false, message: "Veuillez entrer votre e-mail et votre mot de passe!" });
        }

        const livreur = await livreurModel.findOne({ email });

        if (!livreur) {
            return res.status(404).json({ success: false, message: "Utilisateur non trouvé!" });
        }

        if (mdp !== livreur.mdp) {
            return res.status(400).json({ success: false, message: "Mot de passe invalide" });
        }

        if (!livreur.isValidated) {
            return res.status(403).json({ success: false, message: "Votre compte doit être validé par l'admin." });
        }

        const token = livreur.generateToken();

        return res.status(200).cookie("token", token).json({
            success: true,
            message: "Connecté avec succès",
            token,
            livreur,
        });

    } catch (error) {
        console.error("Erreur connexion livreur :", error);
        return res.status(500).json({ success: false, message: "Erreur dans l'API de connexion", error });
    }
};


// PROFIL UTILISATEUR
export const getLivreurProfileController = async (req, res) => {
    try {
        const livreur = await livreurModel.findById(req.user._id);

        res.status(200).send({
            success: true,
            message: "Profil utilisateur récupéré avec succès",
            livreur,
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
export const updateProfileControllerL = async (req, res) => {
    try {
        const { nom, numTel, email, categorie,matricule,mdp } = req.body;

        const livreur = await livreurModel.findById(req.user.id);
        if (!livreur) {
            return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
        }

        livreur.nom = nom || livreur.nom;
        livreur.numTel = numTel || livreur.numTel;
        livreur.email = email || livreur.email;
        livreur.categorie = categorie || livreur.categorie;
        livreur.matricule = matricule || livreur.matricule;
        livreur.mdp = mdp || livreur.mdp;

        await livreur.save();

        res.status(200).json({ success: true, message: "Profil mis à jour", livreur });

    } catch (error) {
        console.error("Erreur mise à jour profil :", error);
        res.status(500).json({ success: false, message: "Erreur serveur." });
    }
};



// SUPPRIMER LE COMPTE
export const deleteAccountControllerL = async (req, res) => {
    try {
      const livreur = await livreurModel.findById(req.user._id);
  
      if (!livreur) {
        return res.status(404).send({
          success: false,
          message: "Utilisateur non trouvé!",
        });
      }
  
      // Utilisation de la méthode deleteAccount mise à jour
      const result = await livreur.deleteAccount();
  
      res.status(200).send({
        success: result.success,
        message: result.message,
      });
    } catch (error) {
      console.error("Erreur lors de la suppression du compte:", error.message);
      res.status(500).send({
        success: false,
        message: error.message || "Erreur serveur",
      });
    }
  };

  // Obtenir tous les livreurs
export const getAllLivreurs = async (req,res) =>{
    try {
        const livreur = await livreurModel.find();
        res.json(livreur);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

  // Valider livreur par l'Admin 

  export const validerLivreur = async (req, res) => {
    try {
        const { id } = req.params;
        const livreur = await livreurModel.findByIdAndUpdate(id, { isValidated: true }, { new: true });

        if (!livreur) {
            return res.status(404).json({ message: "Livreur non trouvé" });
        }

        // Envoyer un email au livreur
        await sendEmail(
            livreur.email,
            "Validation de votre compte",
            "Félicitations, votre compte a été validé par l'administrateur ! Vous pouvez maintenant vous connecter."
        );

        

        res.status(200).json({ success: true, message: "Livreur validé avec succès", livreur });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la validation du livreur", error });
    }
};

//Refuser (Supprimer livreur ) par l'Admin
export const deleteLivreur = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("ID reçu :", id);

        if (!id) {
            return res.status(400).json({ message: "ID manquant" });
        }

        const livreur = await livreurModel.findByIdAndDelete(id);
        if (!livreur) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }

        res.json({ message: "Utilisateur supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

