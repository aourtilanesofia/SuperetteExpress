import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from "react-native";
import React from "react";
import LayoutAdmin from "../../components/LayoutAdmin/LayoutAdmin";
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useTranslation } from 'react-i18next';

 
const AcceuilCommerçant = ({ navigation }) => {
  const { t } = useTranslation();
  return (
    <LayoutAdmin>
      {/* Header fixe en haut */}
      <View style={styles.hdr}> 
      </View>
      {/* ScrollView pour défiler entre le header et le menu */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.main}>
          <Text style={styles.txtdash}>{t('Dashboard')}</Text> 
          <View style={styles.btnContainer}>
            <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('GestiondesProduits')}>
            <AntDesign name="edit" style={styles.icone}/>
              <Text style={styles.btntxt}>{t('Gestion_des_produits')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('GestionDesCategories')}>
            <AntDesign name="edit" style={styles.icone}/>
              <Text style={styles.btntxt}>{t('Gestion_des_catégories')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('GestionDesCommandes')}>
            <AntDesign name="bars" style={styles.icone}/>
              <Text style={styles.btntxt}>{t('Gestion_des_commandes')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('GestiondesUtilisateurs')}>
              <AntDesign name="user" style={styles.icone}/>
              <Text style={styles.btntxt}>{t('Gestion_des_utilisateurs')}</Text>
            </TouchableOpacity>
          </View>
        </View> 
      </ScrollView>
    </LayoutAdmin>
  );
};

export default AcceuilCommerçant;

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
  main:{
    backgroundColor:"ligthgray",
    height:"96%",
  },
  txtdash:{
    backgroundColor:'#329171',
    color:'#fff',
    textAlign:'center',
    padding:10,
    fontSize:20,
    margin:15,
    borderRadius:5,
    fontWeight:'bold',
    marginTop:20,
  },
  btnContainer:{
    margin:15,
  },
  btn:{
    flexDirection:'row',
    alignItems:'center',
    backgroundColor:'#fff',
    padding:10,
    borderRadius:10,
    elevation:15,
    marginBottom:25,
    height:60,
  },
  btntxt:{
    fontSize:18,
  },
  icone:{
    fontSize:20,
    marginLeft:10,
    marginRight:10,
  }
});

