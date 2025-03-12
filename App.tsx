import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View, Dimensions, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Import icons

const { width, height } = Dimensions.get('window');

export default function App() {
  const [selectedTab, setSelectedTab] = useState('Viagem');
  const [searchText, setSearchText] = useState('');
  const [requestTime, setRequestTime] = useState('Agora');

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

      {/*barra de pesquisa para gerar a viagem */}
      <View style={styles.searchBar}> 
        <Ionicons name="search" size={24} color="black" style={styles.icon} /> {/* Icone */}
        <TextInput
          style={styles.searchInput}
          placeholder="Para onde?"
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity style={styles.nowButton} onPress={() => setRequestTime(requestTime === 'Agora' ? 'Mais tarde' : 'Agora')}>  
          <Text style={styles.nowButtonText}>{requestTime}</Text>
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
    top: height * 0.1,
  },
  tabText: {
    fontSize: width * 0.08,
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
    top: height * 0.15,
    marginTop: height * 0.05,
    backgroundColor: 'lightgray',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: width * 0.05,
  },
  icon: {
    marginRight: width * 0.02,
  },
  searchInput: {
    flex: 1,
    fontSize: width * 0.04,
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
