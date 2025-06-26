
import consommateurModel from "../models/consommateurModel.js";
import Notification from '../models/NotificationModel.js';

// INSCRIPTION 
export const inscriptionController = async (req, res) => { 
    try {
        const { nom, numTel, adresse, mdp ,superetteId} = req.body;
  
        if (!nom || !numTel || !adresse || !mdp ) {
            return res.status(400).send({
                success: false,
                message: "Veuillez remplir tous les champs ! ",
            });
        }


        if (mdp.length <= 6) {
            return res.status(400).send({ success: false, message: "Le mot de passe doit contenir plus de 6 caractères" });
        }

        const numTelRegex = /^(06|07|05)[0-9]{8}$/;
        if (!numTelRegex.test(numTel)) {
            return res.status(400).send({ success: false, message: "Le numéro de téléphone doit commencer par 06, 07 ou 05 et contenir exactement 10 chiffres" });
        }

        const existingConsommateur = await consommateurModel.findOne({ numTel });

        if (existingConsommateur) {
            return res.status(400).send({
                success: false,
                message: "Numéro téléphone déjà utilisée!",
            });
        }

        const consommateur = await consommateurModel.create({ nom, numTel, adresse, mdp,superetteId });

        // Créer la notification **avant** d'envoyer la réponse
        try {
            const notification = new Notification({
                message: `${nom} vient de s'inscrire en tant que Client.`,
                isRead: false,
                role: "administrateur",
            });
            await notification.save();
            //console.log("Notification envoyée via Socket.io :", notification);
            req.io.emit("newNotification", notification);
        } catch (notifError) {
            console.error("Erreur lors de la création de la notification :", notifError);
        }
 
        // Envoyer la réponse une seule fois à la fin
        res.status(201).send({
            success: true,
            message: "Vous êtes maintenant inscrit!, veuillez vous connecter",
            consommateur,
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
export const connexionController = async (req, res) => {
  try {
    const { numTel, mdp, shopId } = req.body;
    const now = new Date();

    if (!numTel || !mdp) {
      return res.status(400).json({
        success: false,
        message: "Veuillez entrer votre numéro de téléphone et votre mot de passe !",
      });
    }

    let consommateur = await consommateurModel.findOne({ numTel });

    if (!consommateur) {
      return res.status(404).json({
        success: false,
        message: "Numéro de téléphone incorrect.",
      });
    }

    // Vérifier si bloqué
    if (consommateur.blockUntil && consommateur.blockUntil > now) {
      const minutes = Math.ceil((consommateur.blockUntil - now) / 60000);
      return res.status(403).json({
        success: false,
        message: `Compte bloqué. Réessayez dans ${minutes} minute(s).`,
      });
    }

    // Vérifier superette
    if (shopId && consommateur.superetteId.toString() !== shopId) {
      return res.status(403).json({
        success: false,
        message: "Vous n'êtes pas inscrit dans cette supérette !",
      });
    }

    // Vérifier mot de passe
    if (mdp !== consommateur.mdp) {
      consommateur.loginAttempts += 1;

      if (consommateur.loginAttempts >= 3) {
        consommateur.blockUntil = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes
        consommateur.loginAttempts = 0;
        await consommateur.save();
        return res.status(403).json({
          success: false,
          message: "3 tentatives échouées. Compte bloqué 5 minutes.",
        });
      }

      await consommateur.save();
      return res.status(400).json({
        success: false,
        message: `Mot de passe incorrect. Tentative ${consommateur.loginAttempts}/3`,
      });
    }

    // Compte désactivé
    if (!consommateur.isActive) {
      return res.status(403).json({
        success: false,
        message: "Votre compte est désactivé !",
      });
    }

    // Réinitialiser après succès
    consommateur.loginAttempts = 0;
    consommateur.blockUntil = null;
    await consommateur.save();

    const token = consommateur.generateToken();

    return res.status(200).json({
      success: true,
      message: "Connexion réussie.",
      token,
      consommateur,
    });
  } catch (error) {
    console.error("Erreur connexion consommateur:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
};


// PROFIL UTILISATEUR
export const getConsommateurProfileController = async (req, res) => {
    try {
        const consommateur = await consommateurModel.findById(req.user._id);

        res.status(200).send({
            success: true,
            message: "Profil utilisateur récupéré avec succès",
            consommateur,
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
export const updateProfileController = async (req, res) => {
    try {
        const { nom, numTel, adresse,mdp } = req.body;

        const consommateur = await consommateurModel.findById(req.user.id);
        if (!consommateur) {
            return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
        }

        consommateur.nom = nom || consommateur.nom;
        consommateur.numTel = numTel || consommateur.numTel;
        consommateur.adresse = adresse || consommateur.adresse;
        consommateur.mdp = mdp || consommateur.mdp;

        await consommateur.save();

        res.status(200).json({ success: true, message: "Profil mis à jour", consommateur });

    } catch (error) {
        console.error("Erreur mise à jour profil :", error);
        res.status(500).json({ success: false, message: "Erreur serveur." });
    }
};



// SUPPRIMER LE COMPTE
export const deleteAccountController = async (req, res) => {
    try {
      const consommateur = await consommateurModel.findById(req.user._id);
  
      if (!consommateur) {
        return res.status(404).send({
          success: false,
          message: "Utilisateur non trouvé !",
        });
      }
  
      // Utilisation de la méthode deleteAccount mise à jour
      const result = await consommateur.deleteAccount();
  
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

// Obtenir tous les consommateurs
export const getAllConsommateurs = async (req,res) =>{
    try {
        const consommateur = await consommateurModel.find();
        res.json(consommateur);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

//supprimer un consommateur

export const deleteConsommateur = async (req, res) => {
    try {
        const { id } = req.params;
        //console.log("ID reçu :", id);

        if (!id) {
            return res.status(400).json({ message: "ID manquant" });
        }

        const consommateur = await consommateurModel.findByIdAndDelete(id);
        if (!consommateur) {
            return res.status(404).json({ message: "Utilisateur introuvable !" });
        }

        res.json({ message: "Utilisateur supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


//Activer ou désactiver un consommateur

export const toggleStatus = async (req, res) => {
    try {
      const consommateur = await consommateurModel.findById(req.params.id);
      
      if (!consommateur) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
  
      consommateur.isActive = !consommateur.isActive;
      await consommateur.save();
  
      res.json(consommateur);
    } catch (error) {
      console.error("Erreur lors de l'activation/désactivation :", error);
      res.status(500).json({ message: error.message });
    }
  };

  // Récupérer un consommateur par son ID
  export const getConsommateurByIdController = async (req, res) => {
    try {
      if (!req.params.id) {
        return res.status(400).json({ message: "ID manquant dans la requête" });
      }
  
      const consommateur = await consommateurModel.findById(req.params.id);
      if (!consommateur) {
        return res.status(404).json({ message: "Consommateur non trouvé" });
      }
      
      res.json({
        nom: consommateur.nom,
        telephone: consommateur.numTel
      });
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur", error });
    }
  };

  
// Récupérer le nombre de consommateurs actifs
export const getActiveConsommateurCountController = async (req, res) => {
    try {
        // Recherche des consommateurs actifs
        const count = await consommateurModel.countDocuments();
        res.status(200).json({
            success: true,
            count,
        });
    } catch (error) {
        console.error("Erreur lors de la récupération du nombre de consommateurs actifs :", error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur",
            error: error.message || error,  // Affichage du message d'erreur exact
        });
    }
};

//Récupérer le nombre de consommateurs désactifs 

export const getNotActiveConsommateurCountController = async (req, res) => {
    try {
        // Recherche des consommateurs actifs
        const notactiveCount = await consommateurModel.countDocuments({ isActive: false });

        res.status(200).json({
            success: true,
            count: notactiveCount,  
        });
    } catch (error) {
        console.error("Erreur lors de la récupération du nombre de consommateurs non actifs :", error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur",
            error: error.message || error,  
        });
    }
};



  
  