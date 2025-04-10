import { StyleSheet, Text, View,Image } from 'react-native'
import React,{useEffect} from 'react'

const SplashScreen = ({ navigation }) => {
    useEffect(() => {
            setTimeout(() => {
              navigation.replace("FirstScreen"); // Remplace "Home" par "Login" après 3 sec
            }, 3000);
          }, []);
  return (
    <View style={styles.container}>
      <Text style={styles.txt}>Superette Express</Text>
      <Image  source={require('../assets/panier.png')} style={styles.img} />
    </View>
  )
}

export default SplashScreen

const styles = StyleSheet.create({
    container:{
        flex:1,
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'#2E7D32',

    },
    txt:{
        fontSize:25,
        fontWeight:'bold',
        color:'#fff',
       },
       img:{
        width:90,
        height:90,
        tintColor:'#fff',
       }
})