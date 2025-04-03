import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from "react-native";
import React from "react";
import Layout from "../../components/LayoutLivreur/LayoutLivreur";
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from'react-native-vector-icons/MaterialCommunityIcons';


const AcceuilLivreur = ({ navigation }) => {
  return (
    <Layout>
      {/* Header fixe en haut */}
      <View style={styles.hdr}>
        <TouchableOpacity style={styles.btn1} onPress={() => navigation.navigate('AutresOptionsLivreur')}>
          <AntDesign name="bars" style={styles.plus} size={25}/>
        </TouchableOpacity>
       
      </View>
     
      {/* ScrollView pour défiler entre le header et le menu */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}> 
      </ScrollView>
    </Layout>
  );
};

export default AcceuilLivreur;

const styles = StyleSheet.create({
  hdr: {
    marginTop:42,
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

