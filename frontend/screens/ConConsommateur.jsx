import { StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from 'react-native'
import React, { useState } from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons';
import SimpleLineIcon from 'react-native-vector-icons/SimpleLineIcons';
import { fonts } from './../node_modules/@react-navigation/native/lib/module/theming/fonts';

const ConConsommateur = ({ navigation }) => {
    const [secureEntery, setSecureEntery] =useState(true);
  return (
    <View style={styles.container}>
      <Text style={styles.txt1}>Connexion</Text>

    {/*formulaire*/}
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
            <Ionicons name='mail-outline' size={22} color={'#939494'}/>
            <TextInput style={styles.textInput} placeholder='Entrez votre E-mail' keyboardType='email-address'/>
        </View>

        <View style={styles.inputContainer}>
            <SimpleLineIcon name='lock' size={22} color={'#939494'}/>
            <TextInput style={styles.textInput} placeholder='Entrez votre mot de passe' secureTextEntry={secureEntery}/>
            <TouchableOpacity onPress={() =>{ setSecureEntery((prev)=>!prev);}}>
            <SimpleLineIcon name='eye' size={19} color={'#939494'}/>
            </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.cnxButton} onPress={() => navigation.navigate('AcceuilConsommateur')}>
            <Text style={styles.cnxtxt}>Se connecter</Text>
        </TouchableOpacity>


        <View style={styles.footerContainer}>
            <Text style={styles.accountText}>Vous n'avez pas un compte?</Text>
            <Text style={styles.signuptext} onPress={() => navigation.navigate('InsConsommateur')}>S'inscrire</Text>
        </View>

      </View>
    </View>
  )
}

export default ConConsommateur

const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:'#fff',
        padding:25,
    },
    txt1:{
        fontSize:30,
        fontWeight:'bold',
        color:'#329171',
        marginTop:70,
    
    },
    formContainer:{
        marginTop:100,
    },
    inputContainer:{
        borderWidth:1,
        borderColor:'#329171',
        borderRadius:30,
        height:50,
        paddingHorizontal:20,
        flexDirection:'row',
        alignItems:'center',
        marginVertical:15,
    },
    textInput:{
        flex:1,
        paddingHorizontal:15,
        fontFamily:fonts.Ligth,
    },
    cnxButton:{
        backgroundColor:'#329171',
        borderRadius:100,
        marginVertical:33,
    },
    cnxtxt:{
        color:'#fff',
        fontSize:18,
        fontWeight:'bold',
        textAlign:'center',
        padding:12,
    },
    txtggl:{
        textAlign:'center',
        marginVertical:40,
        fontSize:13,
        color:'#4f4f4f',
    },
    googlBtn:{
        
        flexDirection:'row',
        borderWidth:1.5,
        borderColor:"#329171",
        borderRadius:100,
        justifyContent:'center',
        alignItems:'center',
        
    
    },
    img:{
        width:25,
        height:25,
        
    },
    googleText:{
        color:'#000',
        fontSize:16,
        fontWeight:'bold',
        textAlign:'center',
        padding:12,
    },
    footerContainer:{
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        marginVertical:20,
        gap:5,
    },
    accountText:{
        color:'#4f4f4f',
        fontFamily:fonts.Regular,
    },
    signuptext:{
        color:'#4f4f4f',
        fontWeight:'bold',
    }

})