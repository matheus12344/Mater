// context/ActivityContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { ActivityItem } from '../types';

interface ActivityContextType {
  activities: ActivityItem[];
  addActivity: (activity: Omit<ActivityItem, 'id'>) => void;
  updateActivityStatus: (id: string, status: ActivityItem['status']) => void;
}

const ActivityContext = createContext<ActivityContextType>({
  activities: [],
  addActivity: () => {},
  updateActivityStatus: () => {},
});

export const ActivityProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const addActivity = (activity: Omit<ActivityItem, 'id'>) => {
    const newActivity: ActivityItem = {
      ...activity,
      id: Date.now().toString(),
    };
    setActivities(prev => [newActivity, ...prev]);
  };

  const updateActivityStatus = (id: string, status: ActivityItem['status']) => {
    setActivities(prev => prev.map(item => 
      item.id === id ? { ...item, status } : item
    ));
  };

  return (
    <ActivityContext.Provider value={{ activities, addActivity, updateActivityStatus }}>
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivities = () => useContext(ActivityContext);