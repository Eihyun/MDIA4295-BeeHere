import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';

import HomeScreen from '../src/screens/HomeScreen';
import ExploreScreen from '../src/screens/ExploreScreen';
import ProfileScreen from '../src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
    return (
        <Tab.Navigator 
            screenOptions={({route}) => ({
                headerShown: false,
                tabBarActiveTintColor: '#FCE205',
                tabBarInactiveTintColor: '#CDCDCD',
                tabBarStyle: {
                    backgroundColor: '#313131',
                    borderTopWidth: 0,
                },
                tabBarIcon: ({ color, size }) => {
                    let iconName;

                    if (route.name === 'Home') iconName = 'home';
                    else if (route.name === 'Explore') iconName = 'search';
                    else if (route.name === 'Profile') iconName = 'person';

                    return <MaterialIcons name={iconName} type="material" color={color} size={size} />;
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600'
                }
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Explore" component={ExploreScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}