import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import Layout from '../components/Layout/Layout'
import { UserData } from '../Data/UserData'



const Compte = ({navigation}) => {
    return (
        <Layout>
            <View style={styles.container}>
                <Image source={{ uri: UserData[0].profilePic }} style={styles.img} />
                <View style={{justifyContent:'center',alignItems:'center'}}>
                    <Text style={styles.name}>Bienvenue {UserData[0].name} 👋</Text>
                </View>

                <View style={{marginTop:40}}>
                    <View style={styles.line} />

                    <View style={styles.vw}>
                        <Text style={styles.txt1}>Adresse E-mail:</Text>
                        <Text style={styles.txt2}>{UserData[0].email}</Text>
                    </View>

                    <View style={styles.line} />

                    <View style={styles.vw}>
                        <Text style={styles.txt1}>Numéro de téléphone:</Text>
                        <Text style={styles.txt2}>{UserData[0].number}</Text>
                    </View>

                    <View style={styles.line} />

                    <View style={styles.vw}>
                        <Text style={styles.txt1}>Adresse:</Text>
                        <Text style={styles.txt2}>{UserData[0].adr}</Text>
                    </View>

                    <View style={styles.line} />

                    <View style={styles.vw}>
                        <Text style={styles.txt1}>Mot de passe:</Text>
                        <Text style={styles.txt2}>{UserData[0].password}</Text>
                    </View>

                    <View style={styles.line} />

                </View>
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('UpdateProfile')}>
                        <Text style={styles.txtbtn}>Modifier le profile</Text>
                    </TouchableOpacity>
                </View>

            </View>

        </Layout>

    )
}

export default Compte

const styles = StyleSheet.create({

    container: {

        marginVertical: 20,
    },
    img: {
        height: 100,
        width: '100%',
        resizeMode: 'contain',
        marginTop:17,
    },
    name:{
        marginTop:15,
        fontSize:16,
    },
    line: {
        borderBottomWidth: 1,  
        borderBottomColor: 'lightgrey',  
        marginVertical: 10,  
        width: '100%',
      },
    vw:{
        flexDirection:'row',
        padding:15,

    },
    txt1:{
        fontWeight:'bold',
        fontSize:15,
        flex:1,

    },
    txt2:{
        marginLeft:45,
    

    },
    footer: {
        marginTop:40,
        margin:15,

    },
    btn:{
        backgroundColor:'#329171',
        padding:13,
        borderRadius:100,

    },
    txtbtn:{
        justifyContent:'center',
        textAlign:'center',
        alignItems:'center',
        color:'#fff',
        fontWeight:'bold',
        fontSize:17,
    }
      

})