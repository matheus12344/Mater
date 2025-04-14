import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import LoginScreen from '../pages/Login';
import HomeTabContent from '../components/HomeTabContent';
import AccountScreen from '../pages/AccountScreen';
import ServicesScreen from '../pages/ServicesScreen';
import ServiceDetailsScreen from '../pages/ServiceDetailScreen';
import AdminDashboard from '../pages/AdminDashboard';
import AdminUsers from '../pages/AdminUsers';
import AdminServices from '../pages/AdminServices';
import AdminAnalytics from '../pages/AdminAnalytics';
import AdminNotifications from '../pages/AdminNotifications';
import AdminSystemSettings from '../pages/AdminSettings';
import { RootStackParamList, ServiceManagementProps, TabType, UserData, Vehicle, ServiceItem } from '../types';
import { useActivities } from '../context/ActivityContext';
import { View, Text, TouchableOpacity } from 'react-native';
import { mockUserData } from '../data/mockData';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ServiceItem as ServiceDetailScreenItem } from '../pages/ServiceDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Wrapper components to handle navigation params
const HomeWrapper = () => {
  const { theme } = useTheme();
  const [selectedTab, setSelectedTab] = useState<TabType>('Viagem');
  const [searchText, setSearchText] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const handleSearch = () => {
    // Implement search logic
  };

  const handleSearchTextChange = async (text: string) => {
    // Implement search text change logic
  };

  const handleSelectSuggestion = (item: any) => {
    // Implement suggestion selection logic
  };

  const handleDeleteHistoryItem = (index: number) => {
    const newHistory = history.filter((_, i) => i !== index);
    setHistory(newHistory);
  };

  const handleMap = (index: number) => {
    // Implement map logic
  };

  const handleEmergency = (index: number) => {
    // Implement emergency logic
  };

  const handleCommunity = (index: number) => {
    // Implement community logic
  };

  return (
    <HomeTabContent
      selectedTab={selectedTab}
      setSelectedTab={setSelectedTab}
      styles={theme}
      colors={theme.colors}
      scale={(size: number) => size}
      searchText={searchText}
      setSearchText={setSearchText}
      handleSearch={handleSearch}
      history={history}
      renderItem={() => <></>}
      suggestions={suggestions}
      renderSuggestion={() => <></>}
      onSearchTextChange={handleSearchTextChange}
      onSelectSuggestion={handleSelectSuggestion}
      searchSuggestions={[]}
      onDeleteHistoryItem={handleDeleteHistoryItem}
      onMap={handleMap}
      onEmergency={handleEmergency}
      handleCommunity={handleCommunity}
    />
  );
};

const ServicesWrapper = () => {
  const { theme } = useTheme();
  const [services, setServices] = useState<ServiceItem[]>([]);

  const handleServiceSelect = (service: ServiceItem) => {
    // Implement service selection logic
  };

  return (
    <ServicesScreen
      services={services}
      handleServiceSelect={handleServiceSelect}
      styles={theme}
      colors={theme.colors}
      scale={(size: number) => size}
    />
  );
};

const AccountWrapper = () => {
  const { theme } = useTheme();
  const [userData, setUserData] = useState<UserData>({
    id: '',
    name: '',
    email: '',
    phone: '',
    role: 'user',
    status: 'active',
    lastLogin: new Date(),
    createdAt: new Date(),
    vehicles: []
  });

  const accountOptions = [
    { id: 'profile', title: 'Perfil', icon: 'user', screen: 'Profile' },
    { id: 'vehicles', title: 'Veículos', icon: 'car', screen: 'Vehicles' },
    { id: 'payments', title: 'Pagamentos', icon: 'credit-card', screen: 'Payments' },
    { id: 'settings', title: 'Configurações', icon: 'settings', screen: 'Settings' }
  ];

  const renderVehicleItem = ({ item }: { item: Vehicle }) => <></>;
  const renderAccountOption = (option: any) => <></>;
  const onOptionSelect = (optionId: string) => {};
  const onVehicleSelect = (vehicle: Vehicle) => {};

  return (
    <AccountScreen
      userData={userData}
      setUserData={setUserData}
      styles={theme}
      colors={theme.colors}
      scale={(size: number) => size}
      accountOptions={accountOptions}
      renderVehicleItem={renderVehicleItem}
      renderAccountOption={renderAccountOption}
      onOptionSelect={onOptionSelect}
      onVehicleSelect={onVehicleSelect}
    />
  );
};

const AdminServicesWrapper = () => {
  const handleServiceUpdate = (service: ServiceItem) => {
    // Implement service update logic
  };

  return (
    <AdminServices
      onServiceUpdate={handleServiceUpdate}
    />
  );
};

const UserTabs = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeWrapper} />
      <Tab.Screen name="Services" component={ServicesWrapper} />
      <Tab.Screen name="Profile" component={AccountWrapper} />
    </Tab.Navigator>
  );
};

const AdminTabs = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="AdminDashboard" component={AdminDashboard} />
      <Tab.Screen name="AdminUsers" component={AdminUsers} />
      <Tab.Screen name="AdminServices" component={AdminServicesWrapper} />
      <Tab.Screen name="AdminAnalytics" component={AdminAnalytics} />
      <Tab.Screen name="AdminNotifications" component={AdminNotifications} />
      <Tab.Screen name="AdminSystemSettings" component={AdminSystemSettings} />
    </Tab.Navigator>
  );
};

// Wrapper component for ServiceDetailsScreen
const ServiceDetailsWrapper = ({ 
  route, 
  navigation 
}: { 
  route: RouteProp<RootStackParamList, 'ServiceDetails'>; 
  navigation: NativeStackNavigationProp<RootStackParamList, 'ServiceDetails'>;
}) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const { activities } = useActivities();
  
  // Find the service by ID from the route params
  const serviceId = route.params?.serviceId;
  const service = activities.find(activity => activity.id === serviceId);
  
  // If no service is found, show an error or redirect
  if (!service) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Service not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Create the service object in the format expected by ServiceDetailsScreen
  const serviceItem: ServiceDetailScreenItem = {
    id: service.id,
    icon: service.icon || 'car',
    title: service.title,
    description: service.description,
    color: '#007AFF', // Default color
    location: service.location ? {
      latitude: service.location.coords.latitude,
      longitude: service.location.coords.longitude,
      address: service.location.address
    } : undefined
  };
  
  // Create the handlers
  const handleChat = () => {
    // Use a type assertion to bypass the type checking for navigation
    (navigation as any).navigate('Chat', { serviceId: service.id });
  };
  
  const handleBack = () => {
    navigation.goBack();
  };
  
  // Create a scale function
  const scale = (size: number): number => size;
  
  return (
    <ServiceDetailsScreen
      service={serviceItem}
      onChat={handleChat}
      onBack={handleBack}
      styles={{}}
      colors={colors}
      scale={scale}
      userVehicles={mockUserData.vehicles}
    />
  );
};

const AppNavigator = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : user?.isAdmin ? (
          <Stack.Screen name="AdminTabs" component={AdminTabs} />
        ) : (
          <Stack.Screen name="UserTabs" component={UserTabs} />
        )}
        <Stack.Screen 
          name="ServiceDetails" 
          component={ServiceDetailsWrapper}
          initialParams={{ serviceId: '' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 