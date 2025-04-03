import { StyleSheet, Text, View,Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { colors } from '../../utils/colors';


const WelcomePageLivreur = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.txt1}>Bienvenue sur Superette Express!</Text>
      <Image source={ require('../../assets/liv3.png')} style={styles.aaa}/>
      <View style={styles.buttonContainer}>

        <TouchableOpacity style={styles.btn1} onPress={() => navigation.navigate('ConLivreur')}>
            <Text style={styles.cnxtxt}>Connexion</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn2} onPress={() => navigation.navigate('InsLivreur')}>
            <Text style={styles.insctxt}>Inscription</Text>
        </TouchableOpacity>

      </View>
    </View>
  )
}

export default WelcomePageLivreur;

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
        marginTop:100,
    },
    
    aaa:{
        alignSelf: 'center',
        marginTop:120,
        width:200,
        height:200,
    },
    buttonContainer:{
        flexDirection:'row',
        borderWidth:2.5,
        borderColor:'#329171',
        width:'90%',
        height:55,
        borderRadius:100,
        alignSelf:'center',
        marginTop:180,
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