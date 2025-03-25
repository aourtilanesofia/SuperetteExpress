/*import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import Layout from '../components/Layout/Layout'
import { useNavigation } from "@react-navigation/native";

const Valider = () => {
    const navigation = useNavigation();

    return (
        <Layout>
            <View>
                <Image source={require('../assets/validerIcone.png')} style={styles.img} />
                <Text style={styles.txt1}>Merci</Text>
                <Text style={styles.txt2}>Votre commande est en cours de traitement</Text>
                <TouchableOpacity style={styles.btnCheckout} onPress={() => navigation.navigate("ListeDesCommandes")}>
                    <Text style={styles.btnCheckoutText}>Voir mes commandes</Text>
                </TouchableOpacity>

            </View>
        </Layout>

    )
}

export default Valider

const styles = StyleSheet.create({
    img:{
        width:60,
        height:60,
        marginTop:'50%',
        marginLeft:'43%',
    },
    txt1:{
        fontSize:20,
        fontWeight:'bold',
        justifyContent:'center',
        alignItems:'center',
        textAlign:'center',
        marginTop:26,
    },
    txt2:{
        fontSize:18,
        fontWeight:'bold',
        justifyContent:'center',
        alignItems:'center',
        textAlign:'center',
        marginTop:10,
    },
    btnCheckout: {
        marginTop: '74%',
        justifyContent: "center",
        alignItems: "center",
        height: 46,
        backgroundColor: "#329171",
        width: "90%",
        marginHorizontal: 20,
        borderRadius: 5,
      },
      btnCheckoutText: {
        color: "#ffffff",
        fontWeight: "bold",
        fontSize: 19,
      },

})*/

import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import Layout from '../components/Layout/Layout';
import { useNavigation } from "@react-navigation/native";

const Valider = () => {
    const navigation = useNavigation();

    return (
        <Layout>
            <View>
                <Image source={require('../assets/validerIcone.png')} style={styles.img} />
                <Text style={styles.txt1}>Merci</Text>
                <Text style={styles.txt2}>Votre commande est en cours de traitement</Text>
                <TouchableOpacity 
                    style={styles.btnCheckout} 
                    onPress={() => navigation.navigate("ListeDesCommandes")}
                >
                    <Text style={styles.btnCheckoutText}>Voir mes commandes</Text>
                </TouchableOpacity>
            </View>
        </Layout>
    );
}
export default Valider;

const styles = StyleSheet.create({
    img: {
        width: 60,
        height: 60,
        marginTop: '50%',
        marginLeft: '43%',
    },
    txt1: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 26,
    },
    txt2: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 10,
    },
    btnCheckout: {
        marginTop: '74%',
        justifyContent: "center",
        alignItems: "center",
        height: 46,
        backgroundColor: "#329171",
        width: "90%",
        marginHorizontal: 20,
        borderRadius: 5,
    },
    btnCheckoutText: {
        color: "#ffffff",
        fontWeight: "bold",
        fontSize: 19,
    },
});
