import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { useTheme } from 'src/context/ThemeContext';
import { mockUserData } from 'src/data/mockData';

const ReferralScreen = () => {
    const { colors } = useTheme();
    const [referralCode] = React.useState(mockUserData.referralCode);
  
    return (
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>Seu Código:</Text>
        <View style={[styles.codeContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.codeText, { color: colors.primary }]}>{referralCode}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.shareButton, { backgroundColor: colors.primary }]}
          onPress={() => Share.share({ message: `Use meu código: ${referralCode}` })}
        >
          <Text style={styles.buttonText}>Compartilhar Código</Text>
        </TouchableOpacity>
      </View>
  );
};

export default ReferralScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F9F9F9',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    codeContainer: {
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    codeText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    shareButton: {
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
