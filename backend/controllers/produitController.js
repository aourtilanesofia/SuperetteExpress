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


// Liste des produits par son ID
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
  try {
    console.log("Fichier reçu :", req.file);
    const { nom, prix, categorie, stock, description, image } = req.body;
    if (!nom || !prix || !categorie || !stock || !description || !image) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires." });
    }

    if (req.file) {
      image = `/assets/${req.file.filename}`;
    }

    const newProduct = new produitModel({ nom, prix, categorie, stock, description, image });
    await newProduct.save();
    res.status(201).json({ message: "Produit ajouté avec succès", produit: newProduct });
  } catch (error) {
    console.error("Erreur lors de l'ajout du produit :", error);
    res.status(500).json({ message: "Erreur lors de l'ajout du produit" });
  }
};


// Modifier un produit
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prix, categorie, stock, description } = req.body;
    const image = req.file ? req.file.path : req.body.image;
    const updatedProduct = await produitModel.findByIdAndUpdate(id, { nom, prix, categorie, stock, description, image }, { new: true });

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
    const { categorie } = req.params; // Récupérer la catégorie depuis l'URL
    console.log("🔹 Catégorie reçue :", req.params.categorie);
    const produits = await produitModel.find({ categorie: categorie }); // Filtrer par texte
    console.log("🔹 Produits trouvés :", produits);

    if (produits.length === 0) {
      return res.status(404).json({ message: "Aucun produit trouvé pour cette catégorie" });
    }

    res.json(produits);
  } catch (error) {
    console.error("Erreur lors de la récupération des produits par catégorie :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};







