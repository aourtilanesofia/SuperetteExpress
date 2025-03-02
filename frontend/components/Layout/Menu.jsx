import { StyleSheet, Text, Touchable, TouchableOpacity, View } from 'react-native'
import React from 'react'
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from "@react-navigation/native";

const Menu = () => {
  const route = useRoute();
  const navigation = useNavigation();
  
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.menuContainer} onPress={() => navigation.navigate('AcceuilConsommateur')}>
        <AntDesign name='home' style={[styles.icon , route.name ==="AcceuilConsommateur" && styles.active]} size={25}/>
        
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuContainer}>
        <Ionicons name='notifications-outline' style={[styles.icon , route.name ===" " && styles.active]} size={26}/>
        
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuContainer}>
        <AntDesign name='shoppingcart' style={[styles.icon , route.name ===" " && styles.active]} size={25}/>
        
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuContainer}>
        <SimpleLineIcons name='location-pin' style={[styles.icon , route.name ===" " && styles.active]} size={25}/>
        
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuContainer}>
        <Ionicons name='bag-outline' style={[styles.icon , route.name ===" " && styles.active]} size={25}/>
        
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuContainer} onPress={() => navigation.navigate('Compte')}>
        <AntDesign name='user' style={[styles.icon , route.name ==="Compte" && styles.active]} size={25}/>
        
      </TouchableOpacity>

      
    </View>
  )
}

export default Menu;

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