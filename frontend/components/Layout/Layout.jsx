/*import { StyleSheet, Text, View } from 'react-native'
import React from 'react';
import Header from './Header';
import Menu from './Menu';
import { StatusBar } from 'expo-status-bar';

const Layout = ({children}) => {
  return (
    <>
    <StatusBar/>
      <View>
        {children}
      </View>
      <View style={styles.footer}>
      <Menu/>
      </View>
      
    </>
  )
}

export default Layout;

const styles = StyleSheet.create({
  footer:{
    position:'absolute',
    padding:4,
    flex:1,
    display:'flex',
    width:'100%',
    justifyContent:'flex-end',
    zIndex:100,
    borderTopWidth:0.5,
    borderColor:'lightgray',
    height:40,
    marginTop:850,
 
  },
  
})*/
/*import { StyleSheet, Text, Touchable, TouchableOpacity, View } from 'react-native';
import React from 'react';
import Menu from './Menu';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

const Layout = ({ children }) => {
  return (
    <>
      <StatusBar />
      <SafeAreaView style={styles.container}>
        <View style={styles.hdr}>
          <TouchableOpacity style={styles.btn1}>
            <Text style={styles.txtbtn1}>icone</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text>chatbot</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.content}>{children}</View>
        <View style={styles.footer}>
          <Menu />
        </View>
      </SafeAreaView>
    </>
  );
};

export default Layout;

const styles = StyleSheet.create({
  container: {
    flex: 1,  // ✅ Permet au layout de prendre tout l'espace
  },
  content: {
    flex: 1,  // ✅ Permet aux enfants d'occuper l'espace disponible
  },
  footer: {
    position: 'absolute',
    bottom: 0,  // ✅ Place le footer en bas
    width: '100%',
    height: 50,  // ✅ Donne une hauteur fixe au footer
    borderTopWidth: 0.5,
    borderColor: 'lightgray',
    backgroundColor: 'white',  // ✅ S'assure que le footer est visible
    padding: 10,
  },
  hdr:{
    flexDirection:'row',
    justifyContent:'center',
    padding:10,
    backgroundColor:'orange',
    //position:'absolute',
    top:0,
    width:'100%',
    zIndex:1,
  },
  btn1:{
    backgroundColor:'white',
    padding:10,
    borderRadius:5,
  },
  txtbtn1:{
    color:'#000',

  }
});*/

import { StyleSheet, View } from "react-native";
import React from "react";
import Menu from "./Menu";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

const Layout = ({ children }) => {
  return (
    <>
      <StatusBar />
      <View style={styles.container}>
        {/* Contenu qui sera défini dans chaque page */}
        <View style={styles.content}>{children}</View>

        {/* Footer fixe */}
        <View style={styles.footer}>
          <Menu />
        </View>
      </View>
    </>
  );
};

export default Layout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,  // Permet au contenu d'occuper tout l'espace disponible
  },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 50,
    borderTopWidth: 0.5,
    borderColor: "lightgray",
    backgroundColor: "white",
    padding: 10,
  },
});
