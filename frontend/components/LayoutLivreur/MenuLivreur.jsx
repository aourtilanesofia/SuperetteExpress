import { StyleSheet, Text, Touchable, TouchableOpacity, View } from 'react-native'
import React from 'react'
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from "@react-navigation/native";

const MenuLivreur = () => {
  const route = useRoute();
  const navigation = useNavigation();
  
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.menuContainer} onPress={() => navigation.navigate('AcceuilLivreur')}>
        <AntDesign name='home' style={[styles.icon , route.name ==="AcceuilLivreur" && styles.active]} size={25}/>
        
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuContainer}>
        <Ionicons name='notifications-outline' style={[styles.icon , route.name ===" " && styles.active]} size={26}/>
        
      </TouchableOpacity>


      <TouchableOpacity style={styles.menuContainer}>
      <Ionicons name='bag-outline' style={[styles.icon , route.name ===" " && styles.active]} size={25}/>
        
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuContainer}>
        <MaterialCommunityIcons name='update' style={[styles.icon , route.name ===" " && styles.active]} size={25}/>
        
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuContainer} onPress={() => navigation.navigate('CompteLivreur')}>
        <AntDesign name='user' style={[styles.icon , route.name ==="CompteLivreur" && styles.active]} size={25}/>
        
      </TouchableOpacity>

      
    </View>
  )
}

export default MenuLivreur;

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
  color:'#2E7D32',  
  },
})