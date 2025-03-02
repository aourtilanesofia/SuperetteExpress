import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react'


const FirstScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.btnAdmin} onPress={() => navigation.navigate('ConCommerçant')}>
        <Text style={styles.txtadmin}>Administrateur</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnCons} onPress={() => navigation.navigate('WelcomePage')}>
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
    backgroundColor:'#329171',
    padding:20,
    margin:10,
    borderRadius:10,
    width:250,
  },
  btnCons:{
    backgroundColor:'#329171',
    padding:20,
    margin:10,
    borderRadius:10,
    width:250,
  },
  btnLiv:{
    backgroundColor:'#329171',
    padding:20,
    margin:10,
    borderRadius:10,
    width:250,
  },
  txtadmin:{
    color:'#fff',
    fontSize:20,
    fontWeight:'bold',
    marginLeft:27,
  },
  txtCons:{
    color:'#fff',
    fontSize:20,
    fontWeight:'bold',
    marginLeft:25,
  },
  txtLiv:{
    color:'#fff',
    fontSize:20,
    fontWeight:'bold',
    marginLeft:67,
  }


})