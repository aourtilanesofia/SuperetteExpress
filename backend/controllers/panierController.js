import panierModel from "../models/panierModel.js";
import produitModel from "../models/produitModel.js";

export const getCart = async (req, res) => {
    try {
      const { userId } = req.params;
      const panier = await panierModel.findOne({ userId }).populate("produits.produitId");
  
      if (!panier) {
        return res.status(404).json({ message: "Panier vide" });
      }
  
      res.json(panier);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur", error });
    }
  };

  
// Ajouter un produit au panier
export const addToCart = async (req, res) => {
  try {
    const { userId, produitId } = req.body;

    let panier = await panierModel.findOne({ userId });

    const produit = await produitModel.findById(produitId);
    if (!produit) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    if (!panier) {
      panier = new panierModel({ 
        userId, 
        produits: [{ produitId, quantite: 1, prix: produit.prix }], 
        total: produit.prix 
      });
    } else {
      const produitIndex = panier.produits.findIndex(p => p.produitId.toString() === produitId);

      if (produitIndex > -1) {
        panier.produits[produitIndex].quantite += 1;
      } else {
        panier.produits.push({ produitId, quantite: 1, prix: produit.prix });
      }
      
      panier.total = panier.produits.reduce((sum, p) => sum + p.quantite * p.prix, 0);
    }

    await panier.save();
    res.status(200).json({ message: "Produit ajouté au panier", panier });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

//Mettre à jour la quantité et recalculer le prix total

export const updateQuantity = async (req, res) => {
    try {
      const { userId, produitId, quantite } = req.body;
  
      let panier = await panierModel.findOne({ userId });
      if (!panier) {
        return res.status(404).json({ message: "Panier non trouvé" });
      }
  
      const produitIndex = panier.produits.findIndex(p => p.produitId.toString() === produitId);
      if (produitIndex === -1) {
        return res.status(404).json({ message: "Produit non trouvé dans le panier" });
      }
  
      panier.produits[produitIndex].quantite = quantite;
  
      panier.total = panier.produits.reduce((sum, p) => sum + p.quantite * p.prix, 0);
  
      await panier.save();
      res.json({ message: "Quantité mise à jour", panier });
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur", error });
    }
  };

  //Supprimer un produit du panier et mettre à jour le total

  export const removeFromCart = async (req, res) => {
    try {
      const { userId, produitId } = req.body;
      let panier = await panierModel.findOne({ userId });
  
      if (!panier) {
        return res.status(404).json({ message: "Panier non trouvé" });
      }
  
      panier.produits = panier.produits.filter(p => p.produitId.toString() !== produitId);
  
      panier.total = panier.produits.reduce((sum, p) => sum + p.quantite * p.prix, 0);
  
      await panier.save();
  
      res.json({ message: "Produit supprimé du panier", panier });
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur", error });
    }
  };
  