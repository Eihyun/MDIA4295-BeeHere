import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [savedMarkers, setSavedMarkers] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const fetchSavedMarkers = async () => {
        try {
          const data = await AsyncStorage.getItem('savedMarkers');
          if (data) {
            setSavedMarkers(JSON.parse(data));
          } else {
            setSavedMarkers([]);
          }
        } catch (err) {
          console.error('Error loading saved markers:', err);
        }
      };
      fetchSavedMarkers();
    }, [])
  );

  const clearItinerary = async () => {
    Alert.alert('Clear Itinerary', 'Are you sure you want to remove all saved locations?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      { 
        text: 'Clear All',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('savedMarkers');
            await AsyncStorage.setItem('itineraryCleared', 'true'); 
            setSavedMarkers([]);
          } catch (err) {
            console.error('Failed to clear itinerary:', err);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Hi, Sarah</Text>

      <View style={styles.ticketRow}>
        <Text style={styles.heading}>Upcoming Event</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('Explore')}
        >
          <Text style={styles.addButtonText}>Add location</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtext}>
        You have currently {savedMarkers.length} added.
        {'\n'}Please add your location.
      </Text>

      <Text style={styles.sectionTitle}>My Saved Locations</Text>

      {savedMarkers.length > 0 && (
        <TouchableOpacity onPress={clearItinerary}>
          <Text style={styles.clearAll}>Clear All</Text>
        </TouchableOpacity>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {savedMarkers.length === 0 ? (
          <Text style={styles.empty}>No saved places yet.</Text>
        ) : (
          savedMarkers.map((marker, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.cardTitle}>{marker.name}</Text>
              <Text style={styles.cardSubtitle}>
                {marker.latitude?.toFixed(4)}, {marker.longitude?.toFixed(4)}
              </Text>
              <Text style={styles.cardMeta}>Type: {marker.type || 'N/A'}</Text>
              <Text style={styles.cardMeta}>Category: {marker.category || 'Unknown'}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#FAFAFA',
  },
  greeting: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  ticketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  subtext: {
    fontSize: 14,
    color: '#444',
    marginTop: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  clearAll: {
    fontSize: 13,
    color: '#CC0000',
    fontWeight: 'bold',
    alignSelf: 'flex-end',
    marginBottom: 12,
  },
  card: {
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 12,
    marginRight: 12,
    width: 200,
    height: 200,
    elevation: 3,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  cardMeta: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  empty: {
    color: '#888',
    fontStyle: 'italic',
    paddingVertical: 10,
  },
});
