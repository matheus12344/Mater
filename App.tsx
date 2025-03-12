import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [selectedTab, setSelectedTab] = useState('Viagem');

  return (
    <View style={styles.container}>
      {/*<---------------------Começo do Header ------------------------>*/}
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSelectedTab('Viagem')}>
          <Text style={[styles.tabText, selectedTab === 'Viagem' && styles.selectedTab]}>Viagem</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setSelectedTab('Serviços')}>
          <Text style={[styles.tabText, selectedTab === 'Serviços' && styles.selectedTab]}>Serviços</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}> 
        <View style={styles.icon} /> {/* Icone */}
        <Text style={styles.searchText}>Para onde?</Text>
        <TouchableOpacity style={styles.nowButton}>  
          <Text style={styles.nowButtonText}>Agora</Text>
        </TouchableOpacity>
      </View>
      {/*<---------------------Fim do Header ------------------------>*/}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    position: 'absolute',
    top: height * 0.05,
  },
  tabText: {
    fontSize: width * 0.05,
  },
  selectedTab: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  searchBar: {
    flexDirection: 'row',
    width: '90%',
    height: height * 0.07,
    position: 'absolute',
    top: height * 0.1,
    marginTop: height * 0.05,
    backgroundColor: 'lightgray',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: width * 0.05,
  },
  icon: {
    backgroundColor: 'red',
    width: width * 0.05,
    height: width * 0.05,
    borderRadius: width * 0.05,
  },
  searchText: {
    padding: width * 0.05,
    fontSize: width * 0.04,
    marginRight: 'auto',
  },
  nowButton: {
    backgroundColor: 'blue',
    padding: width * 0.02,
    borderRadius: 10,
    marginLeft: 'auto',
    height: height * 0.05,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nowButtonText: {
    color: '#fff',
    fontSize: width * 0.03,
  },
});
