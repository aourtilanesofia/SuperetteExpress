import { StyleSheet, Text, TouchableOpacity, View, Image, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';

const backendUrl = "http://192.168.43.145:8080";

const Categories = ({ shopId }) => {  // Accepte maintenant shopId en prop
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        let url = `${backendUrl}/api/categories`;
        
        // Ajout du filtre superetteId si disponible
        if (shopId) {
          url += `?superetteId=${shopId}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error("Erreur réseau");
        
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Erreur:", error);
        setError("Impossible de charger les catégories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [shopId]);  // Déclenche le rechargement quand shopId change

  const handleImageError = (error) => {
    console.log('Erreur de chargement image:', error);
  };

  if (loading) return <Text style={styles.loading}>Chargement...</Text>;
  if (error) return <Text style={styles.error}>{error}</Text>;
  if (categories.length === 0) return <Text style={styles.empty}>Aucune catégorie disponible</Text>;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.container}>
        {categories.map((item) => (
          <TouchableOpacity 
            key={item._id} 
            style={styles.catContainer} 
            onPress={() => navigation.navigate("ProduitsParCategorie", { 
              categorieId: item._id,  // Envoyer l'ID plutôt que le nom pour plus de précision
              shopId: shopId  // Transmettre aussi le shopId
            })}
          >
            <Image 
              source={{ 
                uri: item.image?.startsWith('http') 
                  ? item.image 
                  : `${backendUrl}${item.image}`
              }} 
              style={styles.img}
              onError={handleImageError}
            />
            <Text style={styles.txt}>{item.nom}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 9,
    height: 120,
    backgroundColor: '#E0E0E0',
  },
  catContainer: {
    padding: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  img: {
    width: 40,
    height: 40,
  },
  txt: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
  loading: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
  },
  error: {
    textAlign: 'center',
    padding: 20,
    color: 'red',
  },
  empty: {
    textAlign: 'center',
    padding: 20,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default Categories;