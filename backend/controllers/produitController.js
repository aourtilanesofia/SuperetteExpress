import produitModel from "../models/produitModel.js";

// Liste des produits
export const getProducts = async (req, res) => {
  try {
    const products = await produitModel.find();
    res.json(products);
  } catch (error) {
    console.error("Erreur lors de la récupération des produits :", error);
    res.status(500).json({ message: "Erreur lors de la récupération des produits" });
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
  const { nom, prix, categorie, stock, description, codeBarre } = req.body;

  const imageUrl = req.file ? `http://192.168.1.9:8080/uploads/${req.file.filename}` : null;

  try {
    // Création d'un nouveau produit avec tous les champs requis
    const newProduct = new produitModel({
      nom,
      prix,
      categorie,
      stock,
      description,
      codeBarre,  // Ajout du champ codeBarre
      image: imageUrl,
    });

    // Sauvegarder le produit dans la base de données
    await newProduct.save();

    // Retourner une réponse avec le produit ajouté
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Erreur lors de l'ajout du produit:", error);
    res.status(500).json({ message: "Erreur serveur lors de l'ajout du produit" });
  }
};



// Modifier un produit
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prix, categorie, stock, description, codeBarre } = req.body;

    // Si une nouvelle image est envoyée
    const imageUrl = req.file
      ? `http://192.168.1.9:8080/uploads/${req.file.filename}`
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

// Récupérer les produits par catégorie
export const getProductsByCategory = async (req, res) => {
  try {
    const { categorie } = req.params;
    const produits = await produitModel.find({ categorie });

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
    const count = await produitModel.countDocuments(); 
    res.status(200).json({ count }); 
  } catch (error) {
    console.error("Erreur lors du comptage des produits :", error);
    res.status(500).json({ message: "Erreur serveur lors du comptage des produits" });
  }
};

