import { StyleSheet, Text, View,Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { colors } from './../utils/colors';


const WelcomePage = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.txt1}>Bienvenue sur Superette Express!</Text>
      <Text style={styles.txt2}>Connectez-vous pour une expérience shopping rapide et simple.</Text>
      <Image source={ require('../assets/im4.png')} style={styles.aaa}/>
      <View style={styles.buttonContainer}>

        <TouchableOpacity style={styles.btn1} onPress={() => navigation.navigate('ConConsommateur')}>
            <Text style={styles.cnxtxt}>Connexion</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn2} onPress={() => navigation.navigate('InsConsommateur')}>
            <Text style={styles.insctxt}>Inscription</Text>
        </TouchableOpacity>

      </View>
    </View>
  )
}

export default WelcomePage;

const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:"#fff",

    },
    txt1:{
        fontSize:35,
        fontWeight:'bold',
        margin:8,
        color:'#329171',
        marginTop:80,
    },
    txt2:{
        fontSize:15,
        margin:9,
        color:'#000',
        fontWeight:'bold',
        marginTop:30,
    },
    aaa:{
        alignSelf: 'center',
        marginTop:90,
        //for im1
        //height:'25%',
        //width:'53%',

        //FORM IM3
        //height:'25%',
        //width:'53%',

        //FORM IM4
        height:'25%',
        width:'53%',

    },
    buttonContainer:{
        flexDirection:'row',
        borderWidth:2.5,
        borderColor:'#329171',
        width:'90%',
        height:55,
        borderRadius:100,
        alignSelf:'center',
        marginTop:130,
    },
    btn1:{
        justifyContent:'center',
        backgroundColor:'#329171',
        alignItems:'center',
        width:'54%',
        height:'104%',
        borderRadius:100,
    },
    cnxtxt:{
        color:'#fff',
        fontSize:17,
        fontWeight:'bold',
    },
    btn2:{
        justifyContent:'center',
        alignItems:'center',

    },
    insctxt:{
        marginLeft:30,
        color:'#329171',
        fontSize:17,
        fontWeight:'bold',

    }
});

/*import { StyleSheet, Text, View, Image, TouchableOpacity, ImageBackground } from 'react-native';
import React from 'react';
import { colors } from './../utils/colors';

const WelcomePage = ({ navigation }) => {
  return (
    <ImageBackground source={require('../assets/b2.jpg')} style={styles.background}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.txt1}>Bienvenue sur Superette Express!</Text>
          <Text style={styles.txt2}>Connectez-vous pour une expérience shopping rapide et simple.</Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.btn1} onPress={() => navigation.navigate('ConConsommateur')}>
              <Text style={styles.cnxtxt}>Connexion</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btn2} onPress={() => navigation.navigate('InsConsommateur')}>
              <Text style={styles.insctxt}>Inscription</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

export default WelcomePage;

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)', // Effet de transparence
    },
    container:{
        flex:1,
        backgroundColor:"transparent", // Permet de voir l'effet de transparence
    },
    txt1:{
        fontSize:35,
        fontWeight:'bold',
        margin:8,
        color:'#329171',
        marginTop:130,
    },
    txt2:{
        fontSize:15,
        margin:9,
        color:'#FFF',
        fontWeight:'bold',
        marginTop:30,
    },
    aaa:{
        alignSelf: 'center',
        marginTop:70,
    },
    buttonContainer:{
        flexDirection:'row',
        borderWidth:2.3,
        borderColor:'#329171',
        width:'80%',
        height:55,
        borderRadius:100,
        alignSelf:'center',
        marginTop:290,
    },
    btn1:{
        justifyContent:'center',
        backgroundColor:'#329171',
        alignItems:'center',
        width:'54%',
        height:'104%',
        borderRadius:100,
    },
    cnxtxt:{
        color:'#A9A9A9',
        fontSize:17,
        fontWeight:'bold',
    },
    btn2:{
        justifyContent:'center',
        alignItems:'center',
    },
    insctxt:{
        marginLeft:30,
        color:'#329171',
        fontSize:17,
        fontWeight:'bold',
    }
});*/

