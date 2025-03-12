import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import LayoutAdmin from "../../components/LayoutAdmin/LayoutAdmin";
import AntDesign from 'react-native-vector-icons/AntDesign';

const GestiondesUtilisateurs = ({ navigation }) => {
    return (
        <LayoutAdmin>
            <Text style={styles.txtdash}>Gestion des utilisateurs</Text>
            <View style={styles.btnContainer}>
                <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('ListeDesClients')}>
                    <AntDesign name="bars" style={styles.icone} />
                    <Text style={styles.btntxt}>Liste des clients</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('ListeDesLivreurs')}>
                    <AntDesign name="bars" style={styles.icone} />
                    <Text style={styles.btntxt}>Liste des livreurs</Text>
                </TouchableOpacity>
            </View>
        </LayoutAdmin>

    )
}

export default GestiondesUtilisateurs

const styles = StyleSheet.create({
    btnContainer:{
        margin:15,
        marginTop:120,
      },
      btn:{
        flexDirection:'row',
        alignItems:'center',
        backgroundColor:'#fff',
        padding:10,
        borderRadius:10,
        elevation:15,
        marginBottom:25,
        height:60,
      },
      btntxt:{
        fontSize:18,
      },
      icone:{
        fontSize:20,
        marginLeft:10,
        marginRight:10,
      },
      txtdash:{
        backgroundColor:'#329171',
        color:'#fff',
        textAlign:'center',
        padding:10,
        fontSize:20,
        margin:15,
        borderRadius:5,
        fontWeight:'bold',
      },
})