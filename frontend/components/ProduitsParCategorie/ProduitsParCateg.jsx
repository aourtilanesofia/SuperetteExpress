import { StyleSheet, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import ProductsCard from '../Produits/ProductsCard';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from "@react-navigation/native";


const backendUrl = "http://192.168.38.149:8080";



const ProduitsParCateg = ({searchText} ) => { 
  const [produitsparcategorie, setProduitsParCategorie] = useState([]);
  const route = useRoute();
  const { categorie } = route.params;

  useEffect(() => {
    //console.log("🔹 Catégorie envoyée à l'API :", categorie);
    const fetchProduitsParCateg = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/produits/categorie/${categorie}`);
        const data = await response.json();       
        setProduitsParCategorie(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des produits par categorie:", error);
      }
    };

    fetchProduitsParCateg();
  }, [categorie])

  const produitsFiltres = produitsparcategorie.filter((produit) =>
    produit.nom && produit.nom.toLowerCase().includes(searchText?.toLowerCase() || "")
  );
  

   return ( 
      <FlatList
        data={produitsFiltres}
        keyExtractor={(item, index) => `${item.categorie}-${index}`}
        renderItem={({ item }) => <ProductsCard p={item} />}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.container}
        nestedScrollEnabled={true}
      />
    ); 
};

 export default ProduitsParCateg;
    
    const styles = StyleSheet.create({
      container: {
        paddingHorizontal: 10,
      },
      row: {
        justifyContent: 'space-between',
      },
    });
    