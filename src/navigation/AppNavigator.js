import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../features/auth/screens/LoginScreen";
import RegisterScreen from "../features/auth/screens/RegisterScreen";
import HomeScreen from "../features/home/screens/HomeScreen";

import MyContactCardScreen from "../features/contacts/screens/MyContactCardScreen";
import MyQRCodeScreen from "../features/contacts/screens/MyQRCodeScreen";
import ContactListScreen from "../features/contacts/screens/ContactListScreen";
import CreateContactScreen from "../features/contacts/screens/CreateContactScreen";
import ContactDetailsScreen from "../features/contacts/screens/ContactDetailsScreen";
import ContactQRCodeScreen from "../features/contacts/screens/ContactQRCodeScreen";
import ScanContactQRScreen from "../features/contacts/screens/ScanContactQRScreen";
import EditContactScreen from "../features/contacts/screens/EditContactScreen";

import SearchContactsScreen from "../features/search/screens/SearchContactsScreen";
import SearchEventsScreen from "../features/search/screens/SearchEventsScreen";
import AIContactSearchScreen from "../features/search/screens/AIContactSearchScreen";

import EventsScreen from "../features/events/screens/EventsScreen";
import CreateEventScreen from "../features/events/screens/CreateEventScreen";
import EventDetailsScreen from "../features/events/screens/EventDetailsScreen";

import RemindersScreen from "../features/reminders/screens/RemindersScreen";
import QRScannerScreen from "../features/scanner/screens/QRScannerScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />

        <Stack.Screen name="Home" component={HomeScreen} />

        <Stack.Screen name="MyContactCard" component={MyContactCardScreen} />
        <Stack.Screen name="MyQRCode" component={MyQRCodeScreen} />
        <Stack.Screen name="ContactList" component={ContactListScreen} />
        <Stack.Screen name="CreateContact" component={CreateContactScreen} />
        <Stack.Screen name="ContactDetails" component={ContactDetailsScreen} />
        <Stack.Screen name="ContactQRCode" component={ContactQRCodeScreen} />
        <Stack.Screen name="ScanContactQR" component={ScanContactQRScreen} />
        <Stack.Screen name="EditContact" component={EditContactScreen} />

        <Stack.Screen name="SearchContacts" component={SearchContactsScreen} />
        <Stack.Screen name="SearchEvents" component={SearchEventsScreen} />
        <Stack.Screen
          name="AIContactSearch"
          component={AIContactSearchScreen}
        />

        <Stack.Screen name="Events" component={EventsScreen} />
        <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
        <Stack.Screen name="EventDetails" component={EventDetailsScreen} />

        <Stack.Screen name="Reminders" component={RemindersScreen} />
        <Stack.Screen name="QRScanner" component={QRScannerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
