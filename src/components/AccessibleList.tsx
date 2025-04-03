import React from 'react';
import { FlatList, StyleSheet, ViewStyle } from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';

interface AccessibleListProps<T> {
  data: T[];
  renderItem: (item: T) => React.ReactElement;
  keyExtractor: (item: T) => string;
  style?: ViewStyle;
  label?: string;
  hint?: string;
  ListEmptyComponent?: React.ReactElement;
  ListHeaderComponent?: React.ReactElement;
  ListFooterComponent?: React.ReactElement;
  onEndReached?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export const AccessibleList = <T extends unknown>({
  data,
  renderItem,
  keyExtractor,
  style,
  label,
  hint,
  ListEmptyComponent,
  ListHeaderComponent,
  ListFooterComponent,
  onEndReached,
  onRefresh,
  refreshing,
}: AccessibleListProps<T>) => {
  const { getAccessibilityStyles } = useAccessibility();
  const accessibilityStyles = getAccessibilityStyles();

  return (
    <FlatList
      data={data}
      renderItem={({ item }) => renderItem(item)}
      keyExtractor={keyExtractor}
      style={[styles.list, accessibilityStyles.container, style]}
      contentContainerStyle={styles.contentContainer}
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityRole="list"
      ListEmptyComponent={ListEmptyComponent}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      onRefresh={onRefresh}
      refreshing={refreshing}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
}); 