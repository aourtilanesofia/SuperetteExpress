import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import Layout from "../components/Layout/Layout";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const AutresOptions = () => {
    return (
        <Layout>
            <View style={styles.container}>
            <View style={styles.line} />
                <View>
                    <TouchableOpacity style={styles.btn}>
                    <MaterialCommunityIcons name='syllabary-hiragana' size={30}/>
                    <Text style={styles.txt1}>Langues</Text>
                    </TouchableOpacity>
                    
                </View>

                <View style={styles.line} />

                <View>
                    <TouchableOpacity style={styles.btn}>
                    <Fontisto name='close-a' size={20}/>
                    <Text style={styles.txt2}>Supprimer mon compte</Text>
                    </TouchableOpacity>
                    
                </View>

                <View style={styles.line} />

                <View>
                    <TouchableOpacity style={styles.btn}>
                    <MaterialIcons name='logout' size={29}/>
                    <Text style={styles.txt3}>Se déconnecter</Text>
                    </TouchableOpacity>
                    
                </View>
                <View style={styles.line} />


            </View>
        </Layout>
    )
}

export default AutresOptions

const styles = StyleSheet.create({
    line: {
        borderBottomWidth: 1,  
        borderBottomColor: 'lightgrey',  
        marginVertical: 10,  
        width: '100%',
      
    },
    container:{
        //backgroundColor:'#fff',
        flex:1,
    },
    btn:{
        flexDirection:'row',
        padding:15,
    },
    txt1:{
        justifyContent:'center',
        alignItems:'center',
        fontSize:17,
        marginLeft:13,
    },
    txt2:{
        justifyContent:'center',
        alignItems:'center',
        fontSize:17,
        marginLeft:23,
    },
    txt3:{
        justifyContent:'center',
        alignItems:'center',
        fontSize:17,
        marginLeft:15,
    }

})