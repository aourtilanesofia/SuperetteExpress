import { StyleSheet, Text, TouchableOpacity, View, Image, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';


const backendUrl = "http://192.168.224.149:8080";

const Categories = () => {  // Ajout de navigation
  const [categories, setCategories] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/categories`);
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des catégories :", error);
      }
    };

    fetchCategories();
  }, []);


  return (
    <ScrollView horizontal>
      <View style={styles.container}>
        {categories.map((item) => (
          <View key={item._id}>
            <TouchableOpacity style={styles.catContainer}>
            <Image
                source={{ 
                  uri: item.image.startsWith('http') ? item.image : `${backendUrl}${item.image}` 
                }}
                style={styles.img}
                resizeMode="contain"
                onError={(error) => console.log("Erreur de chargement de l'image", error.nativeEvent)}
              />
              <Text style={styles.txt}>{item.nom}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default Categories;

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
  },
});
