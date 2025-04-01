// navigation/AppNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeTabContent from 'src/components/HomeTabContent';
import ServicesScreen from 'src/pages/ServicesScreen';

const Tab = createBottomTabNavigator();

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }): React.ReactNode => {
          // Return a placeholder icon for now
          return null; // Add actual icon logic here
        },
      })}>
      <Tab.Screen 
        name="Home" 
        component={HomeTabContent as React.ComponentType}
        options={{
          // Add any screen-specific options here
        }}
      />
      <Tab.Screen name="Services" component={ServicesScreen as React.ComponentType} />
      {/* ... outras telas */}
    </Tab.Navigator>
  );
}