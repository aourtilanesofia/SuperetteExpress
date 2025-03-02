import { StyleSheet, Text, View,Image } from 'react-native'
import React, {useEffect} from 'react'
import { colors } from '../utils/colors'

const Home = ({ navigation }) => {

    useEffect(() => {
        setTimeout(() => {
          navigation.replace("WelcomePage"); // Remplace "Home" par "Login" après 3 sec
        }, 3000);
      }, []);


  return (
    <View style={styles.container}>
        <Image source={require('../assets/cart.png')} style={styles.cart} />
        <Text style={styles.txt}>Superette Express</Text>      
    </View>
  )
}

export default Home

const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:colors.gray,
        
    },
    cart:{
        width:150,
        height:100,
        alignItems:'center',
        justifyContent:'center',
        margin:20,
        marginTop:380,
        marginLeft:240,
    },
    txt:{
        fontSize:25,
        fontWeight:'bold',
        color:'#7fd959',
        marginLeft:40,
        bottom:90,


    }
});