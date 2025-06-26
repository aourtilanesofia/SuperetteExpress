import produitModel from "../models/produitModel.js";
import CategorieModel from"../models/CategorieModel.js";

// Liste des produits 
export const getProducts = async (req, res) => {
  try {
    const { superetteId, search } = req.query;
    let query = {};

    // Si superetteId est fourni, on filtre par ses catégories
    if (superetteId) {
      // 1. Trouver les catégories de cette supérette
      const categories = await CategorieModel.find({ superetteId });
      
      // 2. Filtrer les produits par ces catégories
      query.categorieId = { $in: categories.map(cat => cat._id) };
    }

    // Filtre de recherche si fourni
    if (search) {
      query.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const produits = await produitModel.find(query);
    res.json(produits);
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
export const getProduits = async (req, res) => {
  try {
    const { superetteId } = req.query;
    
    if (!superetteId) {
      return res.status(400).json({ message: "superetteId est requis" });
    }

    // Trouver les catégories de la supérette
    const categories = await CategorieModel.find({ superetteId });
    const categorieIds = categories.map(cat => cat._id);
    
    // Trouver les produits de ces catégories
    const produits = await produitModel.find({ 
      categorieId: { $in: categorieIds } 
    }).populate('categorieId', 'nom');
    
    res.status(200).json(produits);
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error);
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// Liste des produits par ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await produitModel.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// Ajouter un produit
export const addProduct = async (req, res) => {
  const { nom, prix, categorie, categorieId, stock, description, codeBarre } = req.body;

  const imageUrl = req.file ? `http://192.168.43.145:8080/uploads/${req.file.filename}` : null;

  try {
    // Vérifier que la catégorie existe
    const categorieExist = await CategorieModel.findById(categorieId);
    if (!categorieExist) {
      return res.status(400).json({ message: "Catégorie invalide" });
    }

    const newProduct = new produitModel({
      nom,
      prix,
      categorie,        
      categorieId,      
      stock,
      description,
      codeBarre,
      image: imageUrl,
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Erreur lors de l'ajout du produit:", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};



// Modifier un produit
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prix, categorie, stock, description, codeBarre } = req.body;

    // Si une nouvelle image est envoyée
    const imageUrl = req.file
      ? `http://192.168.43.145:8080/uploads/${req.file.filename}`
      : req.body.imagePath || req.body.image; // accepte imagePath s’il existe

    const updateFields = {};

    // Ajouter les champs si ils sont définis dans la requête
    if (nom !== undefined) updateFields.nom = nom;
    if (prix !== undefined) updateFields.prix = prix;
    if (categorie !== undefined) updateFields.categorie = categorie;
    if (stock !== undefined) updateFields.stock = stock;
    if (description !== undefined) updateFields.description = description;
    if (codeBarre !== undefined) updateFields.codeBarre = codeBarre;  // Ajout du codeBarre
    if (imageUrl !== undefined) updateFields.image = imageUrl;

    // Mettre à jour le produit dans la base de données
    const updatedProduct = await produitModel.findByIdAndUpdate(
      id,
      updateFields,
      { new: true }
    );

    // Vérification de l'existence de données dans la requête
    if (!req.body && !req.file) {
      return res.status(400).json({ message: "Aucune donnée envoyée" });
    }

    // Si le produit n'est pas trouvé
    if (!updatedProduct) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    res.json({ message: "Produit modifié avec succès", produit: updatedProduct });
  } catch (error) {
    console.error("Erreur lors de la modification du produit :", error);
    res.status(500).json({ message: "Erreur lors de la modification du produit" });
  }
};

// Supprimer un produit
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await produitModel.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    res.json({ message: "Produit supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du produit :", error);
    res.status(500).json({ message: "Erreur lors de la suppression du produit" });
  }
};

// Récupérer les produits par categorieId
export const getProductsByCategory = async (req, res) => {
  try {
    const { categorieId } = req.params;

    const produits = await produitModel.find({ categorieId });

    if (produits.length === 0) {
      return res.status(404).json({ message: "Aucun produit trouvé pour cette catégorie" });
    }

    res.json(produits);
  } catch (error) {
    console.error("Erreur lors de la récupération des produits par catégorie :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


// Récupérer le nombre total de produits
export const getProductCount = async (req, res) => {
  try {
    const { superetteId } = req.query;

    if (!superetteId) {
      return res.status(400).json({ message: "superetteId est requis" });
    }

    // 1. Trouver toutes les catégories de cette supérette
    const categories = await CategorieModel.find({ superetteId }, '_id');

    // 2. Compter les produits qui ont ces catégories
    const count = await produitModel.countDocuments({
      categorieId: { $in: categories.map(cat => cat._id) }
    });

    res.status(200).json({ count });
  } catch (error) {
    console.error("Erreur lors du comptage des produits :", error);
    res.status(500).json({ 
      message: "Erreur serveur lors du comptage des produits",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

