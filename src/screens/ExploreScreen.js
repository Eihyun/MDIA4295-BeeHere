import { useState, useEffect, useCallback } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';


import viffVenues from '../data/sample-data'; // static data
const OPENCAGE_API_KEY = 'b5789a06f064456b980cf10716b52ccf'; // My OpenCage API Key

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
    // to save the Itinerary info ad use them in Home Screen
    const [savedMarkers, setSavedMarkers] = useState([]);
    // modal logic for selected marker
    const [selectedMarker, setSelectedMarker] = useState(null);

    // fetch and place predefined venues when loaded
    const fetchVenueCoordinates = async () => {
    // convert each Viff venue address into coordinates using OpenCage
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
            if (data.results?.length > 0) {
            const { lat, lng } = data.results[0].geometry;
            // Build a marker object with metadata
            return {
                name: venue.name,
                latitude: lat,
                longitude: lng,
                type: data.results[0].components?._type || 'N/A',
                category: data.results[0].components?._category || 'Unknown',
            };
            }
            return null; // skip if no result
        })
        .catch(() => null); // skip if api call fails
    });
    // Wait for all venue lookups to complete, then set markers
    // fetch location from API and parse it into a marker or return null if failed
    const results = await Promise.all(venuePromises);
        return results.filter((m) => m && typeof m.latitude === 'number');
    };

    // Load saved itinerary from AsyncStorage or fallback to sample venues
    useFocusEffect(
        useCallback(() => {
            const loadItinerary = async () => {
                try {
                    const cleared = await AsyncStorage.getItem('itineraryCleared');
                    if (cleared === 'true') {
                        setSavedMarkers([]);
                        return;
                    }
                    
                    const storedData = await AsyncStorage.getItem('savedMarkers');
                    const parsed = storedData ? JSON.parse(storedData) : null;
                    
                    

                    if (Array.isArray(parsed)) {
                    setSavedMarkers(parsed); // even if it's an empty list, it's valid
                    } else {
                    // fallback to sample only if nothing stored at all
                    const fallback = await fetchVenueCoordinates();
                    setSavedMarkers(fallback);
                    }
                } catch (err) {
                    console.error('Failed to load itinerary:', err);
                }
            };

            loadItinerary();
        }, [])
    );

    
    // Save itinerary anytime savedMarkers changes
    useEffect(() => {
        const saveItinerary = async () => {
        try {
            await AsyncStorage.setItem(
            'savedMarkers',
            JSON.stringify(savedMarkers)
            );
            await AsyncStorage.removeItem('itineraryCleared');
        } catch (err) {
            console.error('Failed to save itinerary:', err);
        }
        };

        saveItinerary();
    }, [savedMarkers]);

    // Search for user input place and show modal
    const handleSearch = () => {
        if (!search) return; // do nothing if the input is empty

        // Call OpenCage API with the user's search query
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(search)}&key=${OPENCAGE_API_KEY}`;
        fetch(url)
        .then((res) => res.json())
        .then((data) => {
            if (data.results?.length > 0) {
            const result = data.results[0];
            const { lat, lng } = result.geometry;
            const newMarker = {
                name: search,
                latitude: lat,
                longitude: lng,
                type: data.results[0].components?._type || 'N/A',
                category: data.results[0].components?._category || 'Unknown',
            };
            // Update the map region to focus on this result
            setRegion({ ...region, latitude: lat, longitude: lng });
            // show the modal with the location details
            setSelectedMarker(newMarker);
            }
        });
        // clear the input field
        setSearch('');
    };

    // Check if marker already exists in the savedMarkers list
    const toggleSavedMarker = async () => {
        if (!selectedMarker || typeof selectedMarker.latitude !== 'number') return;

        // some() returns true as soon as it finds a match
        const alreadySaved = savedMarkers.some(
        // compare each saved marker(m) with the input marker
        // if latitude and longitude match, it's considered the same marker
        (m) =>
            m &&
            typeof m.latitude === 'number' &&
            m.latitude === selectedMarker.latitude &&
            m.longitude === selectedMarker.longitude
        );

        if (alreadySaved) {
            // if laready saved -> remove it from savedMarkers
            setSavedMarkers((prev) =>
                prev.filter(
                (m) =>
                    m.latitude !== selectedMarker.latitude ||
                    m.longitude !== selectedMarker.longitude
                )
            );
            } else {
            // if not already saved -> add to itinerary
            setSavedMarkers((prev) => [...prev, selectedMarker]);
            await AsyncStorage.removeItem('itineraryCleared');
        }
        setSelectedMarker(null);
    };

    const resetToDefault = async () => {
        try {
            await AsyncStorage.removeItem('itineraryCleared');
            const fallback = await fetchVenueCoordinates();
            setSavedMarkers(fallback);
            await AsyncStorage.setItem('savedMarkers', JSON.stringify(fallback));
        } catch (err) {
            console.error('Failed to reset default locations:', err);
        }
    };


    return (
        <View style={styles.container}>

        {/* Search bar */}
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

        <TouchableOpacity onPress={resetToDefault} style={styles.resetButton}>
            <Text style={styles.resetText}>Reset to Default Venues</Text>
        </TouchableOpacity>

        {/* Saved List */}
        <ScrollView style={styles.savedList} contentContainerStyle={{ paddingBottom: 24 }}>
            <Text style={styles.listTitle}>My Itinerary</Text>
            {savedMarkers.length === 0 ? (
            <Text style={styles.emptyText}>No saved places yet.</Text>
            ) : (
            savedMarkers.map((marker, index) => (
                <Text key={index} style={styles.listItem}>• {marker.name}</Text>
            ))
            )}
        </ScrollView>

        {/* Map & Marker */}
        <MapView style={styles.map} region={region}>
            {savedMarkers.map((marker, index) => (
            marker.latitude && marker.longitude ? (
                <Marker
                key={index}
                coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
                title={marker.name}
                pinColor="#FCE205"
                onPress={() => setSelectedMarker(marker)}
                />
            ) : null
            ))}
        </MapView>

        {/* Modal for add/remove */}
        {selectedMarker && (
            <Modal animationType="slide" transparent onRequestClose={() => setSelectedMarker(null)}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{selectedMarker.name}</Text>

                {/* Display text to whether add or remove */}
                <TouchableOpacity style={styles.saveButton} onPress={toggleSavedMarker}>
                    <Text style={styles.saveButtonText}>
                    {savedMarkers.some(m => m.latitude === selectedMarker.latitude) ? 'Remove from Itinerary' : 'Add to Itinerary'}
                    </Text>
                </TouchableOpacity>

                {/* Close modal */}
                <Pressable onPress={() => setSelectedMarker(null)}>
                    <Text style={styles.closeText}>Close</Text>
                </Pressable>
                </View>
            </View>
            </Modal>
        )}
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
    searchBar: { fontSize: 16 },
    resetButton: {
        position: 'absolute',
        top: 120,
        left: 220,
        right: 0,
        zIndex: 2,
        backgroundColor: '#CC0000',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginBottom: 10,
        marginRight: 20,
        elevation: 2,
    },
    resetText: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: 'bold',
        textAlign: 'center'
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
    listTitle: { fontWeight: 'bold', marginBottom: 6 },
    listItem: { fontSize: 14, paddingVertical: 2 },
    emptyText: { fontStyle: 'italic', color: '#888' },
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
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    saveButton: {
        marginTop: 20,
        backgroundColor: '#FCE205',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    saveButtonText: { fontWeight: '600', fontSize: 16 },
    closeText: { marginTop: 15, color: '#555' },
});