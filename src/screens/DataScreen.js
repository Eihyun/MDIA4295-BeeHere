import React from 'react';
import { View, Button } from 'react-native';
import { saveJournal, clearJournal } from '../storage/journalStorage';
import sampleJournal from '../data/sampleJournal.json';

export default function DataScreen() {
  return (
    <View>
      <Button title="Load Sample Journal" onPress={() => saveJournal(sampleJournal)} />
      <Button title="Clear Journal" onPress={clearJournal} />
    </View>
  );
}