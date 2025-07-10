import AsyncStorage from '@react-native-async-storage/async-storage';
const JOURNAL_KEY = 'JOURNAL_KEY';

export const getJournal = async () => {
  try {
    const json = await AsyncStorage.getItem(JOURNAL_KEY);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.log('Error reading journal:', e);
    return [];
  }
};

export const saveJournal = async (journal) => {
  try {
    await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(journal));
  } catch (e) {
    console.log('Error saving journal:', e);
  }
};

export const clearJournal = async () => {
  try {
    await AsyncStorage.removeItem(JOURNAL_KEY);
  } catch (e) {
    console.log('Error clearing journal:', e);
  }
};