import express from "express";
import upload from "../middlewares/upload.js";
import { 
  addProduct, 
  updateProduct, 
  deleteProduct, 
  getProducts,
  getProductById, 
  getProductsByCategory
} from "../controllers/produitController.js";
 
const router = express.Router();

// Route pour récupérer tous les produits
router.get("/", getProducts);

// Route pour récupérer un produit par son ID
router.get("/:id", getProductById);

// Route pour ajouter un produit
router.post("/add", upload.single("image"), addProduct);

// Route pour mettre à jour un produit
router.put("/update/:id", upload.single("image"), updateProduct);

// Route pour supprimer un produit
router.delete("/delete/:id", deleteProduct);

// Route pour récupérer les produits par catégorie
router.get("/categorie/:categorie", getProductsByCategory);

export default router;
/*import express from "express";
import upload from "../middlewares/upload.js"; // Importer le middleware Multer
import { 
  addProduct, 
  updateProduct, 
  deleteProduct, 
  getProducts,
  getProductById, 
  getProductsByCategory
} from "../controllers/produitController.js";

const router = express.Router();

// Route pour récupérer tous les produits
router.get("/", getProducts);

// Route pour récupérer un produit par son ID
router.get("/:id", getProductById);

// Route pour ajouter un produit
router.post("/add", upload.single("image"), addProduct); // Utilisation de Multer pour gérer l'image

// Route pour mettre à jour un produit
router.put("/update/:id", upload.single("image"), updateProduct); // Utilisation de Multer pour gérer l'image

// Route pour supprimer un produit
router.delete("/delete/:id", deleteProduct);

// Route pour récupérer les produits par catégorie
router.get("/categorie/:categorie", getProductsByCategory);

export default router;*/

