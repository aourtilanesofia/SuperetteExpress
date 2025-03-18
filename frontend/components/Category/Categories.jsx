/*import { StyleSheet, Text, Touchable, TouchableOpacity, View, Image, ScrollView} from 'react-native'
import React from 'react'
import { categoriesData } from '../../Data/CategoriesData'


const Categories = () => {
  return (
    <ScrollView horizontal={true}>
      <View style={styles.container}>
      {categoriesData?.map((item) => (
        <View key={item._id} >
          <TouchableOpacity style={styles.catContainer}>
            <Image source={item.icon} style={[styles.img, styles.catIcon]}/>
            <Text style={styles.txt}>{item.name}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>

    </ScrollView>
    
  );
};

export default Categories;

const styles = StyleSheet.create({
  img:{
    width:40,
    height:40,
  },
  container:{
    flexDirection:'row',
    padding:9,
    //marginTop:2,
    height:120,
    backgroundColor:'lightgrey'
  },
  catContainer:{
    padding:18,
    justifyContent:'center',
    alignItems:'center',
  },
  catIcon:{
    fontSize:20,
    verticalAlign:'top',

  },
  txt:{
    fontSize:13,
  }
})*/

import { StyleSheet, Text, TouchableOpacity, View, Image, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';

const backendUrl = "http://192.168.43.107:8080";

const Categories = () => {
  const [categories, setCategories] = useState([]);

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
    <ScrollView horizontal={true}>
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
  img: {
    width: 40,
    height: 40,
  },
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
  catIcon: {
    fontSize: 20,
    verticalAlign: 'top',
  },
  txt: {
    fontSize: 13,
  },
});
