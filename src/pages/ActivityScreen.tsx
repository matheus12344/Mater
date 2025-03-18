import React from 'react';
import { FlatList, Text } from 'react-native';
import { ActivityItem } from '../types'; 

interface ActivityScreenProps {
  activities: ActivityItem[];
  renderActivityItem: ({ item }: { item: ActivityItem }) => JSX.Element;
  styles: any;
  colors: any;
}

const ActivityScreen: React.FC<ActivityScreenProps> = ({
  activities,
  renderActivityItem,
  styles,
  colors
}) => {
  return (
    <FlatList
      data={activities}
      renderItem={renderActivityItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.activityContainer}
      ListHeaderComponent={
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Histórico de Atividades
        </Text>
      }
    />
  );
};

export default ActivityScreen;
