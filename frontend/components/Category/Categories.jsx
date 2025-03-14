import { StyleSheet, Text, Touchable, TouchableOpacity, View, Image, ScrollView} from 'react-native'
import React from 'react'
import { categoriesData } from '../../Data/CategoriesData'


const Categories = () => {
  return (
    <ScrollView horizontal={true}>
      <View style={styles.container}>
      {categoriesData?.map((item) => (
        <View key={item._id} >
          <TouchableOpacity style={styles.catContainer}>
            <Image source={item.icon} style={[styles.img, styles.catIcon]}/>
            <Text style={styles.txt}>{item.name}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>

    </ScrollView>
    
  );
};

export default Categories;

const styles = StyleSheet.create({
  img:{
    width:40,
    height:40,
  },
  container:{
    flexDirection:'row',
    padding:9,
    //marginTop:2,
    height:120,
    backgroundColor:'lightgrey'
  },
  catContainer:{
    padding:18,
    justifyContent:'center',
    alignItems:'center',
  },
  catIcon:{
    fontSize:20,
    verticalAlign:'top',

  },
  txt:{
    fontSize:13,
  }
})