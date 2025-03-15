import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View, Dimensions, TextInput, FlatList, ScrollView, Image, Appearance } from 'react-native'; // Import Appearance for theme detection
import { Ionicons } from '@expo/vector-icons'; // Import icons
import * as FileSystem from 'expo-file-system'; // Import FileSystem for file operations

const { width, height } = Dimensions.get('window');
const historyFilePath = `${FileSystem.documentDirectory}history.txt`;

export default function App() {
  const [selectedTab, setSelectedTab] = useState('Viagem');
  const [searchText, setSearchText] = useState('');
  const [requestTime, setRequestTime] = useState('Agora');
  const [history, setHistory] = useState<string[]>([]);
  const [activePage, setActivePage] = useState('Home'); // State for active page
  const [theme, setTheme] = useState(Appearance.getColorScheme()); // State for theme

  useEffect(() => {
    loadHistory();
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme);
    });
    return () => subscription.remove();
  }, []);

  const loadHistory = async () => {
    try {
      const fileExists = await FileSystem.getInfoAsync(historyFilePath);
      if (fileExists.exists) {
        const fileContents = await FileSystem.readAsStringAsync(historyFilePath);
        setHistory(fileContents.split('\n').filter(Boolean));
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const saveHistory = async (newHistory: string[]) => {
    try {
      await FileSystem.writeAsStringAsync(historyFilePath, newHistory.join('\n'));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  };

  const handleSearch = (text: string): void => {
    setSearchText(text);
  };

  const handleSearchSubmit = async () => {
    if (searchText) {
      const newHistory = [searchText, ...history].slice(0, 3);
      setHistory(newHistory);
      await saveHistory(newHistory);
      setSearchText('');
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case 'Home':
        return (
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            {/*<---------------------Começo do Header ------------------------>*/}
            <StatusBar style="auto" />
            <View style={styles.header}>
              <TouchableOpacity onPress={() => setSelectedTab('Viagem')}>
                <Text style={[styles.tabText, selectedTab === 'Viagem' && styles.selectedTab, theme === 'dark' ? styles.textDark : styles.textLight]}>Viagem</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setSelectedTab('Serviços')}>
                <Text style={[styles.tabText, selectedTab === 'Serviços' && styles.selectedTab, theme === 'dark' ? styles.textDark : styles.textLight]}>Serviços</Text>
              </TouchableOpacity>
            </View>

            {/*barra de pesquisa para gerar a viagem */}
            <View style={styles.searchBar}> 
              <Ionicons name="search" size={24} color={theme === 'dark' ? 'white' : 'black'} style={styles.icon} onPress={handleSearchSubmit} /> {/* Icone */}
              <TextInput
                style={[styles.searchInput, theme === 'dark' ? styles.textDark : styles.textLight]}
                placeholder="Para onde?"
                placeholderTextColor={theme === 'dark' ? '#ccc' : '#888'}
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
                  <Ionicons name="time" size={40} color={theme === 'dark' ? 'white' : 'black'} style={styles.locationIcon} /> {/* Icone de relógio */}
                  <View>
                    <Text style={[styles.locationTitle, theme === 'dark' ? styles.textDark : styles.textLight]}>{item}</Text>
                    <Text style={[styles.locationAddress, theme === 'dark' ? styles.textDark : styles.textLight]}>Endereço fictício</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
            {/*<---------------------Fim do Histórico ------------------------>*/}
            <Text style={[styles.suggestionsTitle, theme === 'dark' ? styles.textDark : styles.textLight]}>Sugestões</Text>
            <FlatList
              data={[
                { id: '1', src: 'https://example.com/tow-truck1.jpg' },
                { id: '2', src: 'https://example.com/tow-truck2.jpg' },
                { id: '3', src: 'https://example.com/tow-truck3.jpg' },
                { id: '4', src: 'https://example.com/tow-truck4.jpg' },
              ]}
              horizontal
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.suggestionContainer}>
                  <Image source={{ uri: item.src }} style={styles.suggestionImage} />
                </TouchableOpacity>
              )}
              showsHorizontalScrollIndicator={true}
            />
          </ScrollView>
        );
      case 'Serviços':
        return <Text style={theme === 'dark' ? styles.textDark : styles.textLight}>Serviços Page</Text>;
      case 'Atividade':
        return <Text style={theme === 'dark' ? styles.textDark : styles.textLight}>Atividade Page</Text>;
      case 'Conta':
        return <Text style={theme === 'dark' ? styles.textDark : styles.textLight}>Conta Page</Text>;
      default:
        return <Text style={theme === 'dark' ? styles.textDark : styles.textLight}>Home Page</Text>;
    }
  };

  return (
    <View style={theme === 'dark' ? styles.containerDark : styles.container}>
      {/*<---------------------Começo do Conteúdo da Página ------------------------>*/}
      <View style={styles.pageContent}>
        {renderPage()}
      </View>
      {/*<---------------------Fim do Conteúdo da Página ------------------------>*/}

      {/*<---------------------Começo do Footer Navbar ------------------------>*/}
      <View style={theme === 'dark' ? styles.footerDark : styles.footer}>
        <TouchableOpacity onPress={() => setActivePage('Home')} style={styles.navButton}>
          <Ionicons name="home" size={24} color={activePage === 'Home' ? 'blue' : theme === 'dark' ? 'white' : 'black'} />
          <Text style={activePage === 'Home' ? styles.activeNavText : theme === 'dark' ? styles.navTextDark : styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActivePage('Serviços')} style={styles.navButton}>
          <Ionicons name="construct" size={24} color={activePage === 'Serviços' ? 'blue' : theme === 'dark' ? 'white' : 'black'} />
          <Text style={activePage === 'Serviços' ? styles.activeNavText : theme === 'dark' ? styles.navTextDark : styles.navText}>Serviços</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActivePage('Atividade')} style={styles.navButton}>
          <Ionicons name="list" size={24} color={activePage === 'Atividade' ? 'blue' : theme === 'dark' ? 'white' : 'black'} />
          <Text style={activePage === 'Atividade' ? styles.activeNavText : theme === 'dark' ? styles.navTextDark : styles.navText}>Atividade</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActivePage('Conta')} style={styles.navButton}>
          <Ionicons name="person" size={24} color={activePage === 'Conta' ? 'blue' : theme === 'dark' ? 'white' : 'black'} />
          <Text style={activePage === 'Conta' ? styles.activeNavText : theme === 'dark' ? styles.navTextDark : styles.navText}>Conta</Text>
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
  },
  containerDark: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollViewContent: {
    alignItems: 'center',
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
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    height: height * 0.08,
    borderTopWidth: 1,
    borderTopColor: 'lightgray',
    backgroundColor: '#fff',
  },
  footerDark: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    height: height * 0.08,
    borderTopWidth: 1,
    borderTopColor: 'lightgray',
    backgroundColor: '#000',
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: width * 0.03,
    color: 'black',
  },
  navTextDark: {
    fontSize: width * 0.03,
    color: 'white',
  },
  activeNavText: {
    fontSize: width * 0.03,
    color: 'blue',
  },
  suggestionsTitle: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    marginBottom: height * 0.02,
    right: width * 0.35,
  },
  suggestionContainer: {
    width: width * 0.4,
    height: height * 0.2,
    backgroundColor: 'powderblue',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    margin: 10,
  },
  suggestionImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  textLight: {
    color: '#000',
  },
  textDark: {
    color: '#fff',
  },
});
