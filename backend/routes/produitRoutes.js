import express from "express";
import upload from "../middlewares/upload.js";
import produitModel from "../models/produitModel.js";
import { 
  addProduct, 
  updateProduct, 
  deleteProduct, 
  getProducts,
  getProductById, 
  getProductsByCategory,
  getProductCount
} from "../controllers/produitController.js";

const router = express.Router();

// Récupérer tous les produits
router.get("/", getProducts);

// Récupérer le nombre total de produits
router.get("/count", getProductCount);

// Récupérer les produits par catégorie
router.get("/categorie/:categorie", getProductsByCategory);

// Recherche d'un produit par code-barres
router.get("/codebarre/:codeBarre", async (req, res) => {
  try {
    const codeBarre = req.params.codeBarre.trim();

    const produit = await produitModel.findOne({
      codeBarre: { $regex: new RegExp(`^${codeBarre}$`, "i") },
    });

    if (!produit) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    res.status(200).json(produit);
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// Récupérer un produit par son ID (mettre en dernier)
router.get("/:id", getProductById);

// Ajouter un produit
router.post("/add", upload.single("image"), addProduct);

// Mettre à jour un produit
router.put("/update/:id", upload.single("image"), updateProduct);

// Supprimer un produit
router.delete("/delete/:id", deleteProduct);

export default router;
