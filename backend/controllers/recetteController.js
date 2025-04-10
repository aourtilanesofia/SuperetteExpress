import Recette from '../models/recetteModel.js';

export const getRecetteParIngredients = async (req, res) => {
    try {
      const { ingredients } = req.body;
      console.log('Requête reçue:', ingredients);  // Ajoute un log ici
      const recettes = await Recette.find({
        ingredients: { $all: ingredients }
      });
      console.log('Recettes trouvées:', recettes);  // Et un autre log ici
      res.json(recettes);
    } catch (err) {
      console.error('Erreur serveur:', err);  // Log l'erreur aussi
      res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
  };
  
