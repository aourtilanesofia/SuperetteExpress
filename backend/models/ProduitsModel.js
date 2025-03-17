const mongoose = require('mongoose');

const produitSchema = new mongoose.Schema({
   nom: String,
   prix: Number,
   categorie: String,
   stock: Number,
   image: String,
   description: String
});

const produits = mongoose.model('produits', productSchema);

module.exports = Produits;