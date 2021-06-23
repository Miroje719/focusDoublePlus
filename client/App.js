
import 'react-native-gesture-handler'

import React from 'react'
import { View, TouchableOpacity, Image } from 'react-native'

import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { createDrawerNavigator } from '@react-navigation/drawer'

import { HistoryMenu, SchedulingMenu, BuildMain } from './components'
import { clearDB } from './db/dbManipulation'

import CustomSidebarMenu from './CustomSidebarMenu'
import { FontAwesome } from '@expo/vector-icons';

const Stack = createStackNavigator()
const Drawer = createDrawerNavigator()

const NavigationDrawerStructure = (props) => {
  const toggleDrawer = () => {
    props.navigationProps.toggleDrawer()
  }

  return (
    <View style={{ flexDirection: 'row' }}>
      <TouchableOpacity onPress={toggleDrawer}>
        <Image
          source={require('./assets/MenuButton.png')}
          style={{ width: 30, height: 30, marginLeft: 5 }}
        />
      </TouchableOpacity>
    </View>
  )
}

const DeleteButton = () => {
  return (
    <View style={{ flexDirection: 'row' }}>
      <TouchableOpacity onPress={clearDB}>
        <FontAwesome name="trash-o" size={24} color="white" style={{ width: 30, height: 30, marginRight: 5, marginTop: 5 }}/>
      </TouchableOpacity>
    </View>
  )
}

function Build({ navigation }) {
  return (
    <Stack.Navigator
      initialRouteName="Build"
      screenOptions={{
        title:'Build',
        headerLeft: () => (
          <NavigationDrawerStructure navigationProps={navigation} />
        ),
        headerStyle: {
          backgroundColor: '#F76A6A', 
        },
        headerTintColor: '#fff', 
        headerTitleStyle: {
          fontWeight: 'bold', 
          color: '#FFF',
        },
      }}>
      <Stack.Screen
        name="build"
        component={BuildMain}
        options={{
          title: 'Build',
        }}
      />
    </Stack.Navigator>
  )
}

function HistorySection({ navigation }) {
  return (
    <Stack.Navigator initialRouteName="History">
      <Stack.Screen
        name="History"
        component={HistoryMenu}
        options={{
          title: 'History',
          headerLeft: () => (
            <NavigationDrawerStructure navigationProps={navigation} />
          ),
          headerRight: () => (
            <DeleteButton />
          ),
          headerStyle: {
            backgroundColor: '#00A86B',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Stack.Navigator>
  )
}

function SchedulingSection({ navigation }) {
  return (
    <Stack.Navigator
      initialRouteName="Schedule"
      screenOptions={{
        title:'Schedule',
        headerLeft: () => (
          <NavigationDrawerStructure navigationProps={navigation} />
        ),
        headerStyle: {
          backgroundColor: '#187BCD', 
        },
        headerTintColor: '#fff', 
        headerTitleStyle: {
          fontWeight: 'bold', 
        },
      }}>
      <Stack.Screen
        name="Schedule"
        component={SchedulingMenu}
        options={{
          title: 'Schedule',
        }}
      />
    </Stack.Navigator>
  )
}

const App = () => {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        drawerContentOptions={{
          activeTintColor: '#323F4E',
          itemStyle: { marginVertical: 5 },
        }}
        drawerContent={(props) => <CustomSidebarMenu {...props} />}>
        <Drawer.Screen
          name="Build"
          options={{ drawerLabel: 'Build' }}
          component={Build}
        />
        <Drawer.Screen
          name="HistoryMenu"
          options={{ drawerLabel: 'History' }}
          component={HistorySection}
        />
        <Drawer.Screen
          name="SchedulingMenu"
          options={{ drawerLabel: 'Schedule' }}
          component={SchedulingSection}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  )
}

export default App