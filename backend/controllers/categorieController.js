import CategorieModel from "../models/CategorieModel.js";
 
// Ajouter une catégorie
export const addCategorie = async (req, res) => {
  try {
    const { nom, image, superette } = req.body;

    const newCategorie = new CategorieModel({
      nom,
      image,
      superetteId: superette  
    });

    await newCategorie.save();
    res.status(201).json({ message: 'Catégorie ajoutée avec succès', categorie: newCategorie });
  } catch (error) {
    console.error("Erreur backend:", error);
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};



// Récupérer les catégories par superetteId
export const getCategories = async (req, res) => {
    try {
        const { superetteId } = req.query;
        const filter = superetteId ? { superetteId: superetteId } : {}; // Notez le changement ici
        const categories = await CategorieModel.find(filter);
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};



// Récupérer le nombre total de catégories
export const getCategorieCount = async (req, res) => {
    try {
        const { superetteId } = req.query;
        const count = await CategorieModel.countDocuments({ superetteId });
        res.status(200).json({ count }); // Retourne le nombre total de catégories
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

// Modifier une catégorie
export const updateCategorie = async (req, res) => {
    try {
        const { nom, image } = req.body;
        const updatedCategorie = await CategorieModel.findByIdAndUpdate(
            req.params.id, 
            { nom, image }, 
            { new: true }
        );
        res.status(200).json({ message: 'Catégorie mise à jour !', categorie: updatedCategorie });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

// Supprimer une catégorie
export const deleteCategorie = async (req, res) => {
    try {
        await CategorieModel.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Catégorie supprimée !' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};
