import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface KeepContextType {
  keepList: string[];
  addToKeep: (facilityId: string) => void;
  removeFromKeep: (facilityId: string) => void;
  isKept: (facilityId: string) => boolean;
  keepCount: number;
}

const KeepContext = createContext<KeepContextType | undefined>(undefined);

const KEEP_LIST_KEY = '@keep_list';

interface KeepProviderProps {
  children: ReactNode;
}

export function KeepProvider({ children }: KeepProviderProps) {
  const [keepList, setKeepList] = useState<string[]>([]);

  // AsyncStorageからキープリストを読み込み
  useEffect(() => {
    loadKeepList();
  }, []);

  const loadKeepList = async () => {
    try {
      const stored = await AsyncStorage.getItem(KEEP_LIST_KEY);
      if (stored) {
        setKeepList(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load keep list:', error);
    }
  };

  const saveKeepList = async (newList: string[]) => {
    try {
      await AsyncStorage.setItem(KEEP_LIST_KEY, JSON.stringify(newList));
      setKeepList(newList);
    } catch (error) {
      console.error('Failed to save keep list:', error);
    }
  };

  const addToKeep = (facilityId: string) => {
    const newList = [...keepList, facilityId];
    saveKeepList(newList);
  };

  const removeFromKeep = (facilityId: string) => {
    const newList = keepList.filter(id => id !== facilityId);
    saveKeepList(newList);
  };

  const isKept = (facilityId: string) => {
    return keepList.includes(facilityId);
  };

  const keepCount = keepList.length;

  const value: KeepContextType = {
    keepList,
    addToKeep,
    removeFromKeep,
    isKept,
    keepCount,
  };

  return <KeepContext.Provider value={value}>{children}</KeepContext.Provider>;
}

export function useKeep() {
  const context = useContext(KeepContext);
  if (context === undefined) {
    throw new Error('useKeep must be used within a KeepProvider');
  }
  return context;
}