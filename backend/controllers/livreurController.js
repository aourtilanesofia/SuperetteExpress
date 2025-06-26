
import livreurModel from '../models/livreurModel.js';
import Notification from '../models/NotificationModel.js';
import mongoose from "mongoose";
import { CommandeModel } from '../models/OrderModel.js';


// INSCRIPTION
export const inscriptionControllerL = async (req, res) => {
  try {
    const { nom, numTel, categorie, matricule, marque, mdp } = req.body;

    if (!nom || !numTel || !categorie || !matricule || !marque || !mdp) {
      return res.status(400).send({ success: false, message: "Veuillez remplir tous les champs !" });
    }

    if (mdp.length <= 6) {
      return res.status(400).send({ success: false, message: "Le mot de passe doit contenir plus de 6 caractères" });
    }

    const numTelRegex = /^(06|07|05)[0-9]{8}$/;
    if (!numTelRegex.test(numTel)) {
      return res.status(400).send({ success: false, message: "Le numéro de téléphone doit commencer par 06, 07 ou 05 et contenir exactement 10 chiffres" });
    }

    const existingLivreur = await livreurModel.findOne({ numTel });
    if (existingLivreur) {
      return res.status(400).send({ success: false, message: "Numéro de téléphone déjà utilisé !" });
    }

    const livreur = await livreurModel.create({
      nom,
      numTel,
      categorie,
      matricule,
      marque,
      mdp,
      position: {
        type: 'Point',
        coordinates: [0, 0],
        lastUpdated: Date.now()
      }
    });

    try {
      const notification = new Notification({
        message: `${nom} vient de s'inscrire en tant que livreur.`,
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
      message: "Vous êtes maintenant inscrit !, veuillez vous connecter",
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
    const { numTel, mdp } = req.body;
    const now = new Date();

    if (!numTel || !mdp) {
      return res.status(400).json({
        success: false,
        message: "Veuillez entrer votre numéro de téléphone et votre mot de passe !"
      });
    }

    let livreur = await livreurModel.findOne({ numTel });

    if (!livreur) {
      return res.status(404).json({
        success: false,
        message: "Numéro de téléphone incorrect."
      });
    }

    // Vérifier le blocage avec calcul précis du temps restant
    if (livreur.blockUntil && livreur.blockUntil > now) {
      const remainingTime = livreur.blockUntil - now;
      const minutes = Math.floor(remainingTime / 60000);
      const seconds = Math.floor((remainingTime % 60000) / 1000);
      
      return res.status(403).json({
        success: false,
        message: `Compte bloqué. Réessayez dans ${minutes}m ${seconds}s.`,
        remainingTime: remainingTime // Optionnel: envoyer le temps en ms pour le frontend
      });
    }

    // Vérifier mot de passe
    if (mdp !== livreur.mdp) {
      livreur.loginAttempts += 1;

      if (livreur.loginAttempts >= 3) {
        livreur.blockUntil = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes
        livreur.loginAttempts = 0;
        await livreur.save();
        
        // Message immédiat après blocage
        return res.status(403).json({
          success: false,
          message: "Trop de tentatives. Compte bloqué pour 5 minutes."
        });
      }

      await livreur.save();
      return res.status(400).json({
        success: false,
        message: `Mot de passe incorrect. Tentative ${livreur.loginAttempts}/3`,
        attemptsLeft: 3 - livreur.loginAttempts // Optionnel: nombre de tentatives restantes
      });
    }

    // Vérifier si désactivé
    if (!livreur.isActive) {
      return res.status(403).json({
        success: false,
        message: "Votre compte est désactivé !"
      });
    }

    // Réinitialiser après succès
    livreur.loginAttempts = 0;
    livreur.blockUntil = null;
    await livreur.save();

    const token = livreur.generateToken();

    return res.status(200).json({
      success: true,
      message: "Connecté avec succès",
      token,
      livreur
    });

  } catch (error) {
    console.error("Erreur connexion livreur :", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur"
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
    const { nom, numTel, categorie, matricule, marque, mdp } = req.body;

    const livreur = await livreurModel.findById(req.livreur._id);
    if (!livreur) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }

    livreur.nom = nom || livreur.nom;
    livreur.numTel = numTel || livreur.numTel;
    livreur.categorie = categorie || livreur.categorie;
    livreur.matricule = matricule || livreur.matricule;
    livreur.marque = marque || livreur.marque;
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
export const getAllLivreurs = async (req, res) => {
  try {
    const livreur = await livreurModel.find();
    res.json(livreur);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Valider livreur par l'Admin 
export const toggleStatus = async (req, res) => {
  try {
    const livreur = await livreurModel.findById(req.params.id);

    if (!livreur) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    livreur.isActive = !livreur.isActive;
    await livreur.save();

    res.json(livreur);
  } catch (error) {
    console.error("Erreur lors de l'activation/désactivation :", error);
    res.status(500).json({ message: error.message });
  }
};

export const validerLivreur = async (req, res) => {
  try {
    const { id } = req.params;
    const livreur = await livreurModel.findByIdAndUpdate(id, { isValidated: false }, { new: true });

    if (!livreur) {
      return res.status(404).json({ message: "Livreur non trouvé" });
    }



    res.status(200).json({ success: true, message: "Livreur validé avec succès", livreur });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la validation du livreur", error });
  }
};

//Refuser (Supprimer livreur ) par l'Admin
export const deleteLivreur = async (req, res) => {
  try {
    const { id } = req.params;
    //console.log("ID reçu :", id);

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

//Récupérer le nombre des livreurs
export const getLivreurCountController = async (req, res) => {
  try {
    const count = await livreurModel.countDocuments();
    res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du nombre de livreurs :", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error,
    });
  }
};

export const updateLocation = async (req, res) => {
  const { commandeId, latitude, longitude } = req.body;

  await livreurModel.create({
    commandeId,
    livreurId: req.user._id, // ID du livreur authentifié
    coordinates: { latitude, longitude }
  });

  // Diffusion en temps réel via Socket.io
  io.to(`commande_${commandeId}`).emit('location_update', {
    latitude,
    longitude
  });

  res.status(200).json({ success: true });
};

// Ajoutez cette fonction à votre fichier livreurController.js
export const uploadProfilePicController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier téléchargé'
      });
    }

    // Utilisez le chemin relatif pour le stockage en base
    const relativePath = `/uploads/${req.file.filename}`;

    const updatedLivreur = await livreurModel.findByIdAndUpdate(
      req.user._id,  // Utilisez req.user._id si vous utilisez isAuthL
      { profilePic: relativePath },
      { new: true }
    );

    if (!updatedLivreur) {
      // Supprimez le fichier si l'utilisateur n'existe pas
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Livreur non trouvé'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Photo de profil mise à jour',
      profilePic: relativePath,
      livreur: updatedLivreur
    });

  } catch (error) {
    console.error('Erreur:', error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Mettre à jour la position
// Dans livreurController.js
export const updatePosition = async (req, res) => {
  try {
    // Vérification que req.livreur existe
    if (!req.livreur || !req.livreur._id) {
      return res.status(401).json({
        success: false,
        message: "Authentification requise ou session expirée"
      });
    }

    const { longitude, latitude } = req.body;

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: "Coordonnées GPS manquantes"
      });
    }

    const livreur = await livreurModel.findByIdAndUpdate(
      req.livreur._id,
      {
        position: {
          type: "Point",
          coordinates: [longitude, latitude]
        },
        lastPositionUpdate: new Date()
      },
      { new: true }
    );

    if (!livreur) {
      return res.status(404).json({
        success: false,
        message: "Livreur non trouvé"
      });
    }

    res.status(200).json({
      success: true,
      message: "Position mise à jour",
      data: {
        position: livreur.position
      }
    });

  } catch (error) {
    console.error("Erreur mise à jour position:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la mise à jour de la position",
      error: error.message
    });
  }
};

// Trouver les livreurs proches
export const findNearbyLivreurs = async (req, res) => {
  const lng = parseFloat(req.query.longitude);
  const lat = parseFloat(req.query.latitude);
  const commandeId = req.query.commandeId;

  if (isNaN(lng) || isNaN(lat)) {
    return res.status(400).json({
      success: false,
      message: 'Coordonnées invalides'
    });
  }

  const coords = [lng, lat];
  const radius = parseInt(req.query.maxDistance) || 10000;

  try {
    const results = await mongoose.model('Livreurs').find({
      position: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: coords
          },
          $maxDistance: radius
        }
      },
      isActive: true
    }).lean();

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Aucun livreur trouvé"
      });
    }

    // Sélectionne uniquement le livreur le plus proche (premier résultat)
    const livreurAffecte = results[0];

    // Met à jour la commande
    const commande = await CommandeModel.findByIdAndUpdate(

      commandeId,
      {
        livreur: livreurAffecte._id,
        statut: "Assignée"
      },
      { new: true }
    );

    // Crée une seule notification pour le livreur affecté
    const notification = new Notification({
      message: "Nouvelle Commande à livrer!",
      isRead: false,
      role: "livreur",
      livreurId: livreurAffecte._id
    });

    await notification.save();

    // Envoi des notifications via WebSocket
    if (req.app.get("io")) {
      const io = req.app.get("io");
      io.emit(`commande-assignee_${livreurAffecte._id}`, commande);

      // Un seul emit pour la notification
      io.emit(`notification_livreur_${livreurAffecte._id}`, notification);
    }

    // Formatage des résultats pour la réponse
    const formattedResults = results.map(livreur => ({
      ...livreur,
      distance: livreur.position?.coordinates
        ? Math.round(calculateDistance(coords, livreur.position.coordinates))
        : null
    }));

    res.status(200).json({
      success: true,
      count: formattedResults.length,
      data: formattedResults
    });

  } catch (error) {
    console.error('ERREUR LIVREUR:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


function calculateDistance(coord1, coord2) {
  const R = 6371e3;
  const φ1 = coord1[1] * Math.PI / 180;
  const φ2 = coord2[1] * Math.PI / 180;
  const Δφ = (coord2[1] - coord1[1]) * Math.PI / 180;
  const Δλ = (coord2[0] - coord1[0]) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}


// Obtenir les commandes assignées à un livreur
export const getCommandesAssignees = async (req, res) => {
  try {
    const { livreurId } = req.params;
    //console.log(`Recherche commandes pour livreur: ${livreurId}`); // Log 1

    if (!mongoose.Types.ObjectId.isValid(livreurId)) {
      //console.log('ID livreur invalide:', livreurId); 
      return res.status(400).json({ message: 'ID livreur invalide' });
    }

    const commandes = await CommandeModel.find({
      livreur: livreurId,
      statut: 'Assignée',
      //livraison: 'En attente'
    })
      .populate('userId', 'nom numTel')
      .populate('livreur', 'nom')
      .populate('superetteId', 'name');

    //console.log('Commandes trouvées:', commandes); 

    res.status(200).json(commandes);
  } catch (error) {
    console.error('Erreur complète:', error); // Log 4
    res.status(500).json({
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Accepter une commande

export const accepterCommande = async (req, res) => {
  try {
    const { numeroCommande } = req.params;
    const { livreurId, livraison } = req.body;

    //console.log('Numéro de commande reçu (backend):', numeroCommande);

    // Trouver la commande par numéro de commande
    const commande = await CommandeModel.findOne({ numeroCommande });
    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    // Vérifier le livreur
    const livreur = await livreurModel.findById(livreurId);
    if (!livreur) {
      return res.status(404).json({ message: 'Livreur non trouvé' });
    }

    // Mettre à jour la commande
    commande.livraison = livraison;
    commande.livreur = livreurId;
    commande.dateAcceptation = new Date();

    await commande.save();

    res.status(200).json({
      message: 'Commande acceptée avec succès',
      commande
    });

  } catch (error) {
    res.status(500).json({
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Refuser une commande
export const refuserCommande = async (req, res) => {
  try {
    const { numeroCommande } = req.params;
    const { livreurId, raison } = req.body;

    const commande = await CommandeModel.findOne({ numeroCommande });
    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    commande.livraison = "Refusée";
    commande.raisonRefus = raison;
    commande.livreur = null;

    await commande.save();

    res.status(200).json({
      message: 'Commande refusée avec succès',
      commande
    });

  } catch (error) {
    res.status(500).json({
      message: 'Erreur serveur',
      error: error.message
    });
  }
};




