import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
    const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Hi, Sarah</Text>

      <View style={styles.ticketRow}>
        <Text style={styles.heading}>Upcoming Event</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('Explore')}>
          <Text style={styles.addButtonText}>Add location</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtext}>
        You have currently 0 added.
        {'\n'}Please add your location.
      </Text>

      <Text style={styles.sectionTitle}>My Saved Locations</Text>

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
