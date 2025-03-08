/*import { StyleSheet, Text, View, ScrollView } from 'react-native'
import React from 'react';
import Layout from '../components/Layout/Layout';
import Categories from '../components/Category/Categories';
import Banner from '../components/Banner/Banner';
import Produits from '../components/Produits/Produits';
import Header from './../components/Layout/Header';


const AcceuilConsommateur = ({ navigation }) => {
  return (

    <View style={styles.container}>
      <Layout>

        <Header />
        <Text style={styles.txt}>Explorez les catégories</Text>
        <Categories />
        <Banner />
        <Produits />
      </Layout>
    </View>

  )
}

export default AcceuilConsommateur;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  txt: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 20,
    paddingTop: 30,
  }


})*/

import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from "react-native";
import React from "react";
import Layout from "../components/Layout/Layout";
import Header from './../components/Layout/Header';
import Categories from "../components/Category/Categories";
import Banner from "../components/Banner/Banner";
import Produits from "../components/Produits/Produits";
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from'react-native-vector-icons/MaterialCommunityIcons';


const AcceuilConsommateur = ({ navigation }) => {
  return (
    <Layout>
      {/* Header fixe en haut */}
      <View style={styles.hdr}>
        <TouchableOpacity style={styles.btn1} onPress={() => navigation.navigate('AutresOptions')}>
          <AntDesign name="bars" style={styles.plus} size={25}/>
        </TouchableOpacity>
        <TouchableOpacity>
          <MaterialCommunityIcons name="chat-question-outline" size={26} style={{color:'#ffff'}}/>
        </TouchableOpacity>
      </View>
     
      {/* ScrollView pour défiler entre le header et le menu */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
         <Header/>
        <Text style={styles.txt}>Explorez les catégories</Text>
        <Categories />
        <Banner />
        <Produits />
      </ScrollView>
    </Layout>
  );
};

export default AcceuilConsommateur;

const styles = StyleSheet.create({
  hdr: {
    height: 60, 
    backgroundColor: "#329171",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  plus: {
    //backgroundColor: "white",
    color: "#fff",
    padding: 10,
    borderRadius: 5,
  },
  txtbtn1: {
    color: "#fff",
  },
  scrollContent: {
    flexGrow: 1,  // Permet au contenu de bien défiler
    paddingBottom: 80, // Laisse de l'espace avant le menu
  },
  txt: {
    fontSize: 20,
    fontWeight: "bold",
    padding: 20,
  },
});

