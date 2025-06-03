// utils/notifications.js
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import axios from 'axios';

export async function registerForPushNotificationsAsync(userToken) {
    console.log("Toneennn", userToken)
  if (!Device.isDevice) {
    alert('Must use physical device for Push Notifications');
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Failed to get push token!');
    return;
  }

//   const tokenData = await Notifications.getExpoPushTokenAsync();

  let expoPushToken;
    try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    expoPushToken = tokenData.data;
    console.log('Expo Push Token:', expoPushToken);
    } catch (err) {
    console.error("Failed to get Expo Push Token", err);
    return;
    }
//   const expoPushToken = tokenData.data;
  console.log('Expo Push Token:', expoPushToken);

  // Gửi token về server Django
  try {
    await axios.post(
      'https://dec9-2001-ee0-4f42-2f20-4f3-348b-6c0-39f5.ngrok-free.app/api/expo-devices/',
      { token: expoPushToken },
      {
        headers: {
          Authorization: `Bearer ${userToken}`
        }
      }
    );
  } catch (error) {
    console.error('Error sending token to server:', error);
  }

  return expoPushToken;
}
