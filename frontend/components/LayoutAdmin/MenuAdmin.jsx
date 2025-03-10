import { StyleSheet, Text, Touchable, TouchableOpacity, View } from 'react-native'
import React from 'react'
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from "@react-navigation/native";
import { Alert } from 'react-native';

const MenuAdmin = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const handleLogout = () => {
    Alert.alert(
        "Déconnexion",
        "Voulez-vous vraiment vous déconnecter ?",
        [
            { text: "Annuler", style: "cancel" },
            { text: "Oui", onPress: () => navigation.navigate("ConCommerçant") }
        ]
    );
};
  
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.menuContainer} onPress={() => navigation.navigate('AcceuilCommerçant')}>
        <AntDesign name='home' style={[styles.icon , route.name ==="AcceuilCommerçant" && styles.active]} size={25}/>
        
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuContainer}>
        <Ionicons name='notifications-outline' style={[styles.icon , route.name ===" " && styles.active]} size={26}/>
        
      </TouchableOpacity>


      <TouchableOpacity style={styles.menuContainer}>
      <MaterialCommunityIcons name='syllabary-hiragana' style={[styles.icon , route.name ===" " && styles.active]} size={26}/>
        
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuContainer} onPress={handleLogout} >
        <MaterialIcons name='logout' style={[styles.icon , route.name ===" " && styles.active]} size={25}/>
        
      </TouchableOpacity>



      
    </View>
  )
}

export default MenuAdmin;

const styles = StyleSheet.create({
  container:{
    position:'relative',
    width:'100%',
    flexDirection:'row',
    justifyContent:'space-between',
    paddingHorizontal:20,
  },
  menuContainer:{
    alignItems:'center',
    justifyContent:'center',
  },
  icon:{
    color:'#00000',
  },
  active:{
  color:'#329171',  
  },
})