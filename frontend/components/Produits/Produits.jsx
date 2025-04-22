import { StyleSheet, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import ProductsCard from './ProductsCard';


const backendUrl = "http://192.168.1.9:8080"; // Remplace par ton URL de backend


const Produits = ({searchText }) => {
  const [produits, setProduits] = useState([]); 

  useEffect(() => { 
    const fetchProduits = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/produits`);
        const data = await response.json();
        setProduits(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des produits :", error);
      }
    };

    fetchProduits();
  }, []);

  const produitsFiltres = produits.filter((produit) =>
    produit.nom.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <FlatList
      data={produitsFiltres}
      keyExtractor={(item) => item._id.toString()}
      renderItem={({ item }) => <ProductsCard p={item} />}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.container}
      nestedScrollEnabled={true}
      removeClippedSubviews={true}
    />
  );
};

export default Produits;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
  },
  row: {
    justifyContent: 'space-between',
  },
});
