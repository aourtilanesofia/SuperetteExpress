import SuperetteModel from "../models/SuperetteModel.js";
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
  const φ1 = coord1[1] * Math.PI/180;
  const φ2 = coord2[1] * Math.PI/180;
  const Δφ = (coord2[1]-coord1[1]) * Math.PI/180;
  const Δλ = (coord2[0]-coord1[0]) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

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
  const { name, address, location } = req.body;

  try {
    const newSuperette = new SuperetteModel({
      name,
      address,
      location: {
        type: "Point",
        coordinates: location.coordinates,
      },
    });

    const savedSuperette = await newSuperette.save();
    res.status(201).json(savedSuperette);
  } catch (error) {
    res.status(400).json({ message: error.message });
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