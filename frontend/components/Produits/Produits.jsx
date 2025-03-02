/*import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ProductsCard from './ProductsCard'
import { ProduitsData } from '../../Data/ProduitsData'

const Produits = () => {
  return (
    <View style={styles.container}>
        {ProduitsData.map(p => (
            <ProductsCard key={p._id} p={p} />
        ))}
      
    </View>
  )
}

export default Produits

const styles = StyleSheet.create({
    container:{
        flexDirection:'row',
        //justifyContent:'space-between',
    }
})*/
/*import { StyleSheet, Text, View, FlatList } from 'react-native'
import React from 'react'
import ProductsCard from './ProductsCard'
import { ProduitsData } from '../../Data/ProduitsData'

const Produits = () => {
  return (
    <FlatList
      data={ProduitsData}
      keyExtractor={(item) => item._id.toString()}
      renderItem={({ item }) => <ProductsCard p={item} />}
      numColumns={2}
      columnWrapperStyle={styles.row} // Ajoute un espacement entre les colonnes
      contentContainerStyle={styles.container} // Style global
    />
  )
}

export default Produits

const styles = StyleSheet.create({
  container: {
    //padding: 10,
  },
  row: {
    justifyContent: 'space-between',
  },
})*/

import { StyleSheet, FlatList } from 'react-native'
import React from 'react'
import ProductsCard from './ProductsCard'
import { ProduitsData } from '../../Data/ProduitsData'

const Produits = () => {
  return (
    <FlatList
      data={ProduitsData}
      keyExtractor={(item) => item._id.toString()}
      renderItem={({ item }) => <ProductsCard p={item} />}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.container}
      nestedScrollEnabled={true}
    
    />
  )
}

export default Produits

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10, // Ajoute un padding global
  },
  row: {
    justifyContent: 'space-between',
  },
})

