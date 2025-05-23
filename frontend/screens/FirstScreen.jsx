import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react'


const FirstScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
       <TouchableOpacity style={styles.btnAdmin} onPress={() => navigation.navigate('ConnAdmin')}>
        <Text style={styles.txtadmin}>Administrateur</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnAdmin} onPress={() => navigation.navigate('WelcomePageCommercant')}>
        <Text style={styles.txtadmin}>Commerçant</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnCons} onPress={() => navigation.navigate('ListeShops')}>
        <Text style={styles.txtCons}>Consommateur</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnLiv} onPress={() => navigation.navigate('WelcomePageLivreur')}>
        <Text style={styles.txtLiv}>Livreur</Text>
      </TouchableOpacity>
    </View>
  )
}

export default FirstScreen

const styles = StyleSheet.create({

  container:{
    flex:1,
     justifyContent:'center',
     alignItems:'center',
  },
  btnAdmin:{
    backgroundColor:'#2E7D32',
    padding:20,
    margin:10,
    borderRadius:10,
    width:250,
  },
  btnCons:{
    backgroundColor:'#2E7D32',
    padding:20,
    margin:10,
    borderRadius:10,
    width:250,
  },
  btnLiv:{
    backgroundColor:'#2E7D32',
    padding:20,
    margin:10,
    borderRadius:10,
    width:250,
  },
  txtadmin:{
    color:'#fff',
    fontSize:20,
    fontWeight:'600',
    marginLeft:27,
  },
  txtCons:{
    color:'#fff',
    fontSize:20,
    fontWeight:'600',
    marginLeft:25,
  },
  txtLiv:{
    color:'#fff',
    fontSize:20,
    fontWeight:'600',
    marginLeft:67,
  }


})