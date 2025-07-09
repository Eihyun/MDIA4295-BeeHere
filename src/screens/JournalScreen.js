import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, Switch } from 'react-native';
import { getJournal, saveJournal } from '../storage/journalStorage';

export default function JournalScreen() {
  const [journal, setJournal] = useState([]);
  const [showVisited, setShowVisited] = useState(false);

  useEffect(() => {
    getJournal().then(setJournal);
  }, []);

  // FILTER: show only visited if toggled
  const filtered = showVisited 
    ? journal.filter(j => j.visited)
    : journal;

  // SORT: by rating descending
  const sorted = [...filtered].sort((a, b) => b.rating - a.rating);

  // Toggle visited for a location
  const toggleVisited = async (id) => {
    const updated = journal.map(j =>
      j.id === id ? { ...j, visited: !j.visited } : j
    );
    setJournal(updated);
    await saveJournal(updated);
  };

  return (
    <View>
      <Text>Show Only Visited</Text>
      <Switch value={showVisited} onValueChange={setShowVisited} />
      <FlatList
        data={sorted}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View>
            <Text>{item.locationName} - {item.rating}⭐</Text>
            <Text>{item.note}</Text>
            <Switch
              value={item.visited}
              onValueChange={() => toggleVisited(item.id)}
            />
            {/* Add Edit/Delete buttons as needed */}
          </View>
        )}
      />
    </View>
  );
}