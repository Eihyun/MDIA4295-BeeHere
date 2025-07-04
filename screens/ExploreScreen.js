// ExploreScreen.js
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Dimensions,
  Modal,
  Pressable,
  TouchableOpacity,
  ScrollView,
} from 'react-native'; 
import MapView, { Marker } from 'react-native-maps';

// My OpenCage API Key
const OPENCAGE_API_KEY = 'b5789a06f064456b980cf10716b52ccf';

// VIFF Film Venue info
const viffVenues = [
  { name: 'VIFF Centre', address: '1181 Seymour St, Vancouver, BC' },
  { name: 'The Cinematheque', address: '1131 Howe St, Vancouver, BC', _type: 'cinema' },
  { name: 'Rio Theatre', address: '1660 E Broadway St, Vancouver, BC' },
  { name: 'International Village', address: '88 W Pender St, Vancouver, BC' },
  { name: 'Fifth Avenue Cinemas', address: '2110 Burrard St, Vancouver, BC' },
  { name: 'The Vancouver Playhouse', address: '600 Hamilton St, Vancouver, BC' },
  { name: "SFU's Goldcorp Centre for the Arts", address: '149 W Hastings St, Vancouver, BC' },
];

export default function ExploreScreen() {
  // input text state
  const [search, setSearch] = useState('');
  // Map shows downtown Vancouver by default
  const [region, setRegion] = useState({
    latitude: 49.2827,
    longitude: -123.1207,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  // local markers displayed on the map
  const [markers, setMarkers] = useState([]);
  // to save the Itinerary information and use them in Home Screen
  const [ savedMarkers, setSavedMarkers ] = useState([]);
  // modal logic for selected marker
  const [selectedMarker, setSelectedMarker] = useState(null);
  // Modal pops up when user clicks the marker
  const [modalVisible, setModalVisible] = useState(false);

  // fetch and place predefined venues when loaded
  useEffect(() => {
    const fetchVenueCoordinates = () => {
      // convert each viff venue address into coordinates using OpenCage
      const venuePromises = viffVenues.map((venue) => {
        // encodeURIComponent() is used to safely encode user input for inclusion in a URL
        // especially when the input contains characters (such as spaces) that would otherwise break the request or be misinterpreted
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
          venue.address
        )}&key=${OPENCAGE_API_KEY}`;

        // Call OpenCage API for this venue's address
        return fetch(url)
          .then((res) => res.json())
          .then((data) => {
            if (data.results && data.results.length > 0) {
              const { lat, lng } = data.results[0].geometry;
              // Build a marker object with metadata
              return {
                name: venue.name,
                latitude: lat,
                longitude: lng,
                type: data.results[0].components?._type || 'N/A',
                category: data.results[0]?.components?._category || 'Unknown',
              };
            }
            return null; // skip if no result
          })
          .catch(() => null); // skip if api call fails
      });

      // Wait for all venue lookups to complete, then set markers
      // fetch location from API and parse it into a marker or return null if failed
      Promise.all(venuePromises).then((results) => {
        setMarkers(results.filter(Boolean)); // filter out any null/undefined/false results
      });
    };

    fetchVenueCoordinates(); // run once on component mount
  }, []);

  // Search for user input place and show modal
  const handleSearch = () => {
    if (!search) return; // do nothing if the input is empty
    
    // Call OpenCage API with the user's search query
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(search)}&key=${OPENCAGE_API_KEY}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.results && data.results.length > 0) {
          const result = data.results[0];
          const { lat, lng } = result.geometry;

          const newMarker = {
            name: search,
            latitude: lat,
            longitude: lng,
            type: result.components?._type || 'N/A',
            category: result.components?._category || 'Unknown',
          };

          // Update the map region to focus on this result
          setRegion({ ...region, latitude: lat, longitude: lng });
          // show the  modal with the location details
          setSelectedMarker(newMarker); // prepare modal content
          setModalVisible(true); // show modal
          // Clear the input field
          setSearch('');
        }
      });
  };

  // Check if marker already exists in the savedMarkers list
  const isSaved = (marker) =>
    // some() returns true as soon as it finds a match
    savedMarkers.some(
      // compare each saved marker(m) with the input marker
      // if latitude and longitude match, it's considered the same marker
      (m) => m.latitude === marker.latitude && m.longitude === marker.longitude
    );

  // Toggle whether the selectedMarker is saved in the itinerary and on map
  const toggleSavedMarker = () => {
    if (!selectedMarker) return;

    const alreadySaved = isSaved(selectedMarker);
    if (alreadySaved) {
      // if already saved -> remove it from savedMarkers
      setSavedMarkers((prev) =>
        prev.filter(
          (m) =>
            !(
              m.latitude === selectedMarker.latitude &&
              m.longitude === selectedMarker.longitude
            )
        )
      );
      // Also remove marker from map
      setMarkers((prev) =>
        prev.filter(
          (m) =>
            !(m.latitude === selectedMarker.latitude && m.longitude === selectedMarker.longitude)
        )
      );
    } else {
      // If not already saved -> add to itinerary
      setSavedMarkers((prev) => [...prev, selectedMarker]);
      // add to markers to display if newly saved
      setMarkers((prev) => [...prev, selectedMarker]);
    }
    // close the modal either way
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search a location..."
          placeholderTextColor="#AEAEAE"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
        />
      </View>

      {/* Saved List */}
      <ScrollView 
        style={styles.savedList}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <Text style={styles.listTitle}>My Itinerary</Text>
        {savedMarkers.length === 0 ? (
          <Text style={styles.emptyText}>No saved places yet.</Text>
        ) : (
          savedMarkers.map((marker, index) => (
            <Text key={index} style={styles.listItem}>• {marker.name}</Text>
          ))
        )}
      </ScrollView>

      {/* Map & markers */}
      <MapView style={styles.map} region={region}>
        {markers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            title={marker.name}
            pinColor="#FCE205"
            onPress={() => {
              setSelectedMarker(marker);
              setModalVisible(true);
            }}
          />
        ))}
      </MapView>

      {/* Modal for add/remove */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedMarker?.name}</Text>
            <Text>Latitude: {selectedMarker?.latitude.toFixed(5)}</Text>
            <Text>Longitude: {selectedMarker?.longitude.toFixed(5)}</Text>

            {/* display text to whether remove or add */}
            <TouchableOpacity style={styles.saveButton} onPress={toggleSavedMarker}>
              <Text style={styles.saveButtonText}>
                {isSaved(selectedMarker) ? 'Remove from Itinerary' : 'Add to Itinerary'}
              </Text>
            </TouchableOpacity>

            {/* close modal */}
            <Pressable onPress={() => setModalVisible(false)}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBarContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 2,
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 5,
    elevation: 4,
  },
  searchBar: {
    fontSize: 16,
  },
  savedList: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    zIndex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 3,
    maxHeight: 150,
  },
  listTitle: {
    fontWeight: 'bold',
    marginBottom: 6,
  },
  listItem: {
    fontSize: 14,
    paddingVertical: 2,
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#888',
  },
  map: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: '#FCE205',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  saveButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  closeText: {
    marginTop: 15,
    color: '#555',
  },
});
