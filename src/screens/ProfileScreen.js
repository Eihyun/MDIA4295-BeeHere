import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Plan Your Movie Day</Text>

      <View style={styles.profileRow}>
        <View style={styles.profileInfo}>
          <Image 
            style={styles.profileImg}
            source={require('../../assets/profile-image.png')}
          />
          <Text style={styles.name}>Sarah</Text>
        </View>

        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons name="more-vert" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.menu}>
        <Text style={styles.menuItem}>Notification</Text>
        <Text style={styles.menuItem}>My Route</Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingTop: 50,
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
  },

  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  profileImg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },

  name: {
    fontSize: 24,
    fontWeight: '500',
  },

  iconButton: {
    padding: 8,
  },

  menu: {
    marginTop: 30,
  },

  menuItem: {
    fontSize: 20,
    paddingVertical: 16,
  },
});
