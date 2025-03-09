
import livreurModel from '../models/livreurModel.js';

// INSCRIPTION
export const inscriptionControllerL = async (req, res) => {
    try {
        const { nom, numTel, categorie,matricule, email, mdp } = req.body;

        if (!nom || !numTel || !email || !mdp || !categorie || !matricule) {
            return res.status(400).send({
                success: false,
                message: "Remplissez tous les champs svp!",
            });
        }

        const existingLivreur = await livreurModel.findOne({ email });

        if (existingLivreur) {
            return res.status(400).send({
                success: false,
                message: "Adresse e-mail déjà utilisée!",
            });
        }

        const livreur = await livreurModel.create({ nom, numTel, categorie,matricule, email, mdp });

        res.status(201).send({
            success: true,
            message: "Inscription réussie, veuillez vous connecter",
            livreur,
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
export const connexionControllerL = async (req, res) => {
    try {
        const { email, mdp } = req.body;

        if (!email || !mdp) {
            return res.status(400).send({
                success: false,
                message: "Veuillez entrer votre e-mail et votre mot de passe!",
            });
        }

        const livreur = await livreurModel.findOne({ email });

        if (!livreur) {
            return res.status(404).send({
                success: false,
                message: "Utilisateur non trouvé!",
            });
        }

        if (mdp !== livreur.mdp) {
            return res.status(400).send({
                success: false,
                message: "Mot de passe invalide",
            });
        }

        const token = livreur.generateToken();

        res.status(200).cookie("token", token).send({
            success: true,
            message: "Connecté avec succès",
            token,
            livreur,
        });

    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Erreur dans l'API de connexion",
            error,
        });
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
