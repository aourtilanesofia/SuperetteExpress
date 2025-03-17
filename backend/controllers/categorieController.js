import CategorieModel from "../models/CategorieModel.js";

// Ajouter une catégorie
export const addCategorie = async (req, res) => {
    try {
        const { nom, image } = req.body;
        const newCategorie = new CategorieModel({ nom, image });
        await newCategorie.save();
        res.status(201).json({ message: 'Catégorie ajoutée avec succès', categorie: newCategorie });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

// Récupérer toutes les catégories
export const getCategories = async (req, res) => {
    try {
        const categories = await CategorieModel.find();
        res.status(200).json(categories);
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
        res.status(200).json({ message: 'Catégorie mise à jour', categorie: updatedCategorie });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

// Supprimer une catégorie
export const deleteCategorie = async (req, res) => {
    try {
        await CategorieModel.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Catégorie supprimée' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};
