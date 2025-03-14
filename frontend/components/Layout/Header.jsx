import { StyleSheet, Text, TextInput, Touchable, TouchableOpacity, View } from 'react-native'
import React from 'react'
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useState } from 'react';

const Header = () => {
  const [searchText, setSearchText] = useState('');
  // function for search
  const handleSearch = () => {
    console.log(searchText);
    setSearchText('');
  }
  return (
    <View style={{ height:90}}>
      <View style={styles.container}>
      <TextInput placeholder='Recherchez' style={styles.inputBox}  value={searchText} onChangeText={(text) => setSearchText(text) }/>
      <TouchableOpacity style={styles.rech} onPress={handleSearch}>
        <FontAwesome name='search' size={17} />
        </TouchableOpacity>  
      </View>
    </View>
  )
}

export default Header;

const styles = StyleSheet.create({
  container:{
    display:'flex',
    flex:1,
    flexDirection:'row',
    alignItems:'center',
    paddingHorizontal:20,
    //marginTop:5,

  },
  inputBox:{
    borderWidth:0,
    width:'100%',
    position:'absolute',
    left:15,
    height:45,
    color:'black',
    backgroundColor:'lightgrey',
    paddingLeft:15,
    fontSize:15,
    borderRadius:10,

  },
  rech:{
    position:'absolute',
    left:'93%',
  }
})