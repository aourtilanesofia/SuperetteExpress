import SuperetteModel from "../models/SuperetteModel.js";
import { CommandeModel } from "../models/OrderModel.js";
import mongoose from 'mongoose';

/** 
 * Récupère les superettes à proximité
 * @param {number} lat - Latitude de l'utilisateur
 * @param {number} lng - Longitude de l'utilisateur
 * @param {number} radius - Rayon de recherche en mètres (défaut: 1000m)
 */
// controllers/superetteController.js
export const getNearbySuperettes = async (req, res) => {
  const coords = [parseFloat(req.query.lng), parseFloat(req.query.lat)];
  const radius = parseInt(req.query.radius) || 10000;

  console.log('=== DEBUG ===');
  console.log('Coordonnées:', coords);
  console.log('Rayon:', radius, 'mètres');

  try {
    // 1. Vérification CRITIQUE de la collection
    const collectionExists = await mongoose.connection.db.listCollections({ name: 'Superette' }).hasNext();
    if (!collectionExists) throw new Error('Collection Superette introuvable');

    // 2. Requête ALTERNATIVE garantie
    const collection = mongoose.connection.db.collection('Superette');
    const results = await collection.find({
      location: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: coords
          },
          $maxDistance: radius
        }
      }
    }).toArray();

    console.log('Documents trouvés:', results.length);

    // 3. Formatage des résultats
    const formattedResults = results.map(shop => ({
      ...shop,
      distance: shop.location?.coordinates
        ? Math.round(calculateDistance(coords, shop.location.coordinates))
        : null
    }));

    res.status(200).json({
      success: true,
      count: formattedResults.length,
      data: formattedResults
    });

  } catch (error) {
    console.error('ERREUR CRITIQUE:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      technicalDetails: process.env.NODE_ENV === 'development' ? {
        coordinates: coords,
        radius,
        dbStatus: mongoose.connection.readyState
      } : null
    });
  }
};

// Fonction helper pour calcul de distance
function calculateDistance(coord1, coord2) {
  const R = 6371e3; // Rayon de la Terre en mètres
  const φ1 = coord1[1] * Math.PI / 180;
  const φ2 = coord2[1] * Math.PI / 180;
  const Δφ = (coord2[1] - coord1[1]) * Math.PI / 180;
  const Δλ = (coord2[0] - coord1[0]) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}




/**
 * Crée une nouvelle superette (optionnel)
 */
export const createSuperette = async (req, res) => {
  try {
    const { name, address, longitude, latitude } = req.body;

    const newSuperette = await SuperetteModel.create({
      name,
      address,
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      }
    });

    res.status(201).json({
      success: true,
      data: newSuperette
    });

  } catch (error) {
    console.error("Erreur:", error);
    res.status(400).json({
      success: false,
      message: "Impossible de créer la superette."
    });
  }
};


// Récupérer toutes les supérettes
export const getAllSuperettes = async (req, res) => {
  try {
    const superettes = await SuperetteModel.find();
    res.status(200).json(superettes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer une supérette par son ID
export const getSuperetteById = async (req, res) => {
  try {
    const superette = await SuperetteModel.findById(req.params.id);
    if (!superette) {
      return res.status(404).json({ message: "Supérette non trouvée" });
    }
    res.status(200).json(superette);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Ajouter une nouvelle supérette
export const addSuperette = async (req, res) => {
  try {
    console.log('Données reçues:', JSON.stringify(req.body, null, 2));

    const { name, address, location } = req.body;

    if (!name || !address || !location?.coordinates) {
      return res.status(400).json({
        message: "Tous les champs sont requis"
      });
    }

    // Normalisation des coordonnées
    let coordinates = location.coordinates;

    if (typeof coordinates === 'string') {
      try {
        coordinates = JSON.parse(coordinates.replace(/'/g, '"'));
      } catch (e) {
        return res.status(400).json({
          message: "Format des coordonnées invalide"
        });
      }
    }

    // Création avec données normalisées
    const newSuperette = new SuperetteModel({
      name,
      address,
      location: {
        type: 'Point',
        coordinates: Array.isArray(coordinates) ? coordinates : []
      }
    });

    // Validation explicite
    await newSuperette.validate();

    const savedSuperette = await newSuperette.save();
    return res.status(201).json(savedSuperette);

  } catch (error) {
    console.error('Erreur détaillée:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        path: err.path,
        message: err.message
      }));
      return res.status(400).json({
        message: "Erreur de validation",
        errors
      });
    }

    return res.status(500).json({
      message: "Erreur serveur",
      error: error.message
    });
  }
};

// Modifier une supérette
export const updateSuperette = async (req, res) => {
  try {
    const superette = await SuperetteModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!superette) {
      return res.status(404).json({ message: "Supérette non trouvée" });
    }
    res.status(200).json(superette);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supprimer une supérette
export const deleteSuperette = async (req, res) => {
  try {
    const superette = await SuperetteModel.findByIdAndDelete(req.params.id);
    if (!superette) {
      return res.status(404).json({ message: "Supérette non trouvée" });
    }
    res.status(200).json({ message: "Supérette supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//récupérer le nombre des supérettes

export const getSupCountController = async (req, res) => {
  try {
    // Recherche des consommateurs actifs
    const count = await SuperetteModel.countDocuments();
    res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du nombre des supérettes :", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message || error,
    });
  }
};

//récupérer les statistique 

export const getStatsParSuperette = async (req, res) => {
  try {
    const FRAIS_SERVICE = 30;

    const toutesSuperettes = await SuperetteModel.find().select('name').lean();

    const stats = await Promise.all(
      toutesSuperettes.map(async (superette) => {
        if (superette.name === "Supérette A") {
          console.log("Recherche des commandes pour Supérette A...");

          const commandes = await CommandeModel.find({ livraison: "Livré" }).lean();
          const nb = commandes.length;

          let total = 0;
          let totalNet = 0;
          let totalFraisService = 0;
          let totalPourcentage = 0;

          commandes.forEach((cmd) => {
            total += cmd.total || 0;
            totalNet += cmd.totalNet || 0;
            totalFraisService += FRAIS_SERVICE;
            totalPourcentage += (cmd.total || 0) * 0.10;
          });

          const totalLivraison = totalNet - (total + totalFraisService * nb);
          const totalMarge = totalFraisService + totalPourcentage;
          const totalAchats = totalNet - totalLivraison - totalMarge;

          return {
            nom: "Supérette A",
            totalPaye: total,
            totalLivraison,
            totalMarge,
            totalAchats
          };
        }

        return {
          nom: superette.name,
          totalPaye: 0,
          totalLivraison: 0,
          totalMarge: 0,
          totalAchats: 0
        };
      })
    );

    console.log("Stats envoyées:", stats);
    res.json(stats);
  } catch (err) {
    console.error("Erreur:", err);
    res.status(500).json({
      message: "Erreur serveur",
      error: err.message
    });
  }
};
