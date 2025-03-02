import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity } from 'react-native'
import React from 'react'
import Layout from '../components/Layout/Layout'
import { UserData } from '../Data/UserData'
import { fonts } from '../node_modules/@react-navigation/native/lib/module/theming/fonts';

const UpdateProfile = () => {
    return (
        <Layout>
            <View style={styles.container}>
                <Image source={{ uri: UserData[0].profilePic }} style={styles.img} />

                <View style={styles.inputContainer}>
                    <TextInput style={styles.textInput} 
                    defaultValue={UserData[0].name} />
                </View>

                <View style={styles.inputContainer}>
                    <TextInput style={styles.textInput}
                    defaultValue={UserData[0].email} />
                </View>

                <View style={styles.inputContainer}>
                    <TextInput style={styles.textInput}
                    defaultValue={UserData[0].number} />
                </View>

                <View style={styles.inputContainer}>
                    <TextInput style={styles.textInput}
                    defaultValue={UserData[0].adr} />
                </View>

                <View style={styles.inputContainer}>
                    <TextInput style={styles.textInput}
                    defaultValue={UserData[0].password} />
                </View>

                <TouchableOpacity style={styles.cnxButton}>
                    <Text style={styles.cnxtxt}>Valider</Text>
                </TouchableOpacity>

            </View>
        </Layout>

    )
}

export default UpdateProfile

const styles = StyleSheet.create({
    container: {

        marginVertical: 20,
        margin: 10,

    },
    img: {
        height: 100,
        width: '100%',
        resizeMode: 'contain',
        marginTop: 10,
    },
    inputContainer: {
        borderWidth: 1,
        borderColor: '#329171',
        borderRadius: 30,
        height: 50,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 15,
        marginTop: 26,
    },
    textInput: {
        flex: 1,
        paddingHorizontal: 15,
        fontFamily: fonts.Ligth,
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
    
})