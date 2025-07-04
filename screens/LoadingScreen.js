import { View, Image, StyleSheet } from 'react-native';

export default function LoadingScreen() {
    return (
        <View style={StyleSheet.container}>
            <Image 
                style={[styles.loadingImg, {resizeMode: 'stretch'}]}
                source={require('../assets/Splash.png')}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    loadingImg: {
        width: '100%',
        height: '100%',
    },
});