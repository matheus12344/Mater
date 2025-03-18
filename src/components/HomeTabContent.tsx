import React from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  TextInput 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { TabType, SuggestionItem } from '../types/index'; 

// Defina a interface das props que este componente precisa receber
interface HomeTabContentProps {
  selectedTab: TabType;
  setSelectedTab: (tab: TabType) => void;
  styles: any;
  colors: any;
  scale: (size: number) => number; // Caso use a função scale de fora
  searchText: string;
  setSearchText: (text: string) => void;
  handleSearch: () => void;
  history: string[];
  renderItem: ({ item }: { item: string }) => JSX.Element;
  suggestions: SuggestionItem[];
  renderSuggestion: ({ item }: { item: SuggestionItem }) => JSX.Element;
}

const HomeTabContent: React.FC<HomeTabContentProps> = ({
  selectedTab,
  setSelectedTab,
  styles,
  colors,
  scale,
  searchText,
  setSearchText,
  handleSearch,
  history,
  renderItem,
  suggestions,
  renderSuggestion,
}) => {
  return (
    <FlatList
      data={[]}
      renderItem={() => null}
      // ---------------------------------------------
      // Header da lista (conteúdo principal da Home)
      ListHeaderComponent={
        <>
          {/* Seção de Tabs "Viagem" e "Serviços" */}
          <View style={styles.header}>
            {['Viagem', 'Serviços'].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setSelectedTab(tab as TabType)}
                style={[
                  styles.tabButton,
                  selectedTab === tab && styles.activeTab,
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: colors.text },
                    selectedTab === tab && styles.activeTabText,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Campo de busca */}
          <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Para onde?"
              placeholderTextColor={colors.placeholder}
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity
              style={[styles.searchButton, { backgroundColor: colors.primary }]}
              onPress={handleSearch}
            >
              <Ionicons name="search" size={scale(20)} color="white" />
            </TouchableOpacity>
          </View>

          {/* Histórico */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Histórico
          </Text>
          <FlatList
            data={history}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
          />
        </>
      }
      // ---------------------------------------------
      // Footer da lista (sugestões)
      ListFooterComponent={
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Sugestões
          </Text>
          <FlatList
            horizontal
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item) => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsList}
          />
        </>
      }
      // ---------------------------------------------
      contentContainerStyle={styles.contentContainer}
    />
  );
};

export default HomeTabContent;
