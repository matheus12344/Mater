import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View, Dimensions, TextInput, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Import icons

const { width, height } = Dimensions.get('window');

export default function App() {
  const [selectedTab, setSelectedTab] = useState('Viagem');
  const [searchText, setSearchText] = useState('');
  const [requestTime, setRequestTime] = useState('Agora');
  const [history, setHistory] = useState<string[]>([]);
  const [activePage, setActivePage] = useState('Home'); // State for active page

  const handleSearch = (text: string): void => {
    setSearchText(text);
  };

  const handleSearchSubmit = () => {
    if (searchText) {
      setHistory((prevHistory) => {
        const newHistory = [searchText, ...prevHistory];
        return newHistory.slice(0, 3);
      });
      setSearchText('');
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case 'Home':
        return <Text>Home Page</Text>;
      case 'Serviços':
        return <Text>Serviços Page</Text>;
      case 'Atividade':
        return <Text>Atividade Page</Text>;
      case 'Conta':
        return <Text>Conta Page</Text>;
      default:
        return <Text>Home Page</Text>;
    }
  };

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
        <Ionicons name="search" size={24} color="black" style={styles.icon} onPress={handleSearchSubmit} /> {/* Icone */}
        <TextInput
          style={styles.searchInput}
          placeholder="Para onde?"
          value={searchText}
          onChangeText={handleSearch}
        />
        <TouchableOpacity style={styles.nowButton} onPress={() => setRequestTime(requestTime === 'Agora' ? 'Mais tarde' : 'Agora')}>  
          <Text style={styles.nowButtonText}>{requestTime}</Text>
        </TouchableOpacity>
      </View>
      {/*<---------------------Fim do Header ------------------------>*/}

      {/*<---------------------Começo do Histórico ------------------------>*/}
      <FlatList
        data={history}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.locationContainer}> {/* Precisa de alguns reparos ainda, mas já temos um bom começo*/}
            <Ionicons name="time" size={40} color="black" style={styles.locationIcon} /> {/* Icone de relógio */}
            <View>
              <Text style={styles.locationTitle}>{item}</Text>
              <Text style={styles.locationAddress}>Endereço fictício</Text>
            </View>
          </TouchableOpacity>
        )}
      />
      {/*<---------------------Fim do Histórico ------------------------>*/}

      {/*<---------------------Começo do Conteúdo da Página ------------------------>*/}
      <View style={styles.pageContent}>
        {renderPage()}
      </View>
      {/*<---------------------Fim do Conteúdo da Página ------------------------>*/}

      {/*<---------------------Começo do Footer Navbar ------------------------>*/}
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => setActivePage('Home')} style={styles.navButton}>
          <Ionicons name="home" size={24} color={activePage === 'Home' ? 'blue' : 'black'} />
          <Text style={activePage === 'Home' ? styles.activeNavText : styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActivePage('Serviços')} style={styles.navButton}>
          <Ionicons name="construct" size={24} color={activePage === 'Serviços' ? 'blue' : 'black'} />
          <Text style={activePage === 'Serviços' ? styles.activeNavText : styles.navText}>Serviços</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActivePage('Atividade')} style={styles.navButton}>
          <Ionicons name="list" size={24} color={activePage === 'Atividade' ? 'blue' : 'black'} />
          <Text style={activePage === 'Atividade' ? styles.activeNavText : styles.navText}>Atividade</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActivePage('Conta')} style={styles.navButton}>
          <Ionicons name="person" size={24} color={activePage === 'Conta' ? 'blue' : 'black'} />
          <Text style={activePage === 'Conta' ? styles.activeNavText : styles.navText}>Conta</Text>
        </TouchableOpacity>
      </View>
      {/*<---------------------Fim do Footer Navbar ------------------------>*/}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.05,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: height * 0.05,
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
    backgroundColor: 'lightgray',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: width * 0.05,
    marginBottom: height * 0.05,
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
    height: height * 0.05,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nowButtonText: {
    color: '#fff',
    fontSize: width * 0.03,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.02,
    justifyContent: 'space-between',
    width: '90%',
  },
  locationIcon: {
    marginRight: width * 0.05,
  },
  locationTitle: {
    fontSize: width * 0.04,
    fontWeight: 'bold',
  },
  locationAddress: {
    fontSize: width * 0.035,
  },
  pageContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    height: height * 0.05,
    borderTopWidth: 1,
    borderTopColor: 'lightgray',
    backgroundColor: '#fff',
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    top: 10,
  },
  navText: {
    fontSize: width * 0.03,
    color: 'black',
  },
  activeNavText: {
    fontSize: width * 0.03,
    color: 'blue',
  },
});
