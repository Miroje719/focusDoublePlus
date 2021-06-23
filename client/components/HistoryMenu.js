import React, {useEffect, useState, useRef} from 'react'

import { readDB } from "../db/dbManipulation"
import { 
  View, 
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Image,
  FlatList, 
  RefreshControl,
  ImageBackground,
  Animated, 
  Easing, 
  SafeAreaViewBase  
} from 'react-native'

import { MaterialCommunityIcons } from '@expo/vector-icons'
import moment from 'moment';
import { cos, diff } from 'react-native-reanimated';

const { width, height } = Dimensions.get('screen');

const wait = timeout => {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
};

const SPACING = 20
const AVATAR_SIZE = 70
const ITEM_SIZE = AVATAR_SIZE + SPACING * 3

function difference(date1, date2) {
  return Math.abs(date2 - date1) / 1000 * 60
}

const HistoryMenu = ({ navigation }) => {
  const scrollY = useRef(new Animated.Value(0)).current
  const [listData, setlistData] = useState([])
  const [refreshing, setRefreshing] = useState(false);

  // Onrefresh
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setlistData(readDB());
    wait(2000).then(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    setlistData(readDB());
  }, [])

  return (
    <View style={{flex: 1, backgroundColor: '#A9A9A9'}}>
      {/* <ImageBackground 
        source={require('./../assets/background.png')}
        style={StyleSheet.absoluteFillObject}
      /> */}
      <Animated.FlatList 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        data={listData}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          { useNativeDriver: true }
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={{
          padding: SPACING,
          // paddingTop: StatusBar.currentHeight || 42
        }}
        renderItem={({item, index}) => {
          const inputRange = [ -1, 0, ITEM_SIZE * index, ITEM_SIZE * (index + 3) ]
          const opacityInputRange = [ -1, 0, ITEM_SIZE * index, ITEM_SIZE * (index + 0.5) ]

          const scale = scrollY.interpolate({
            inputRange, outputRange: [1, 1, 1, 0]
          })
          const opacity = scrollY.interpolate({
            inputRange:opacityInputRange , outputRange: [1, 1, 1, 0]
          })

          return <Animated.View style={{
              flexDirection: "row",
              padding: SPACING, 
              marginBottom: SPACING, 
              // backgroundColor: 'rgba(255,255,255,0.6)', 
              backgroundColor: "#C0C0C0",
              borderRadius: 12,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 10
              },
              shadowOpacity: .3,
              shadowRadius: 20,
              opacity,
              transform: [{scale}]

            }}>
            {(new Date(item.end_time).getTime() - new Date(item.start_time).getTime()) / 1000 < 71 
              ? <Image 
                  source={require("./../assets/Small.png")}
                  size={AVATAR_SIZE}
                  style={{width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE, marginRight: SPACING / 2}}
              />
              : <Image 
                  source={require("./../assets/Big.png")}
                  size={AVATAR_SIZE}
                  style={{width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE, marginRight: SPACING / 2}}
              />
            }
            <View>
              <Text style={{fontSize: 22, fontWeight: '700'}}>Building number: {item.id}</Text>
              <Text style={{fontSize: 12, opacity: .7}}>Starting time: {moment(item.start_time).format('YYYY-MM-DD HH:mm') }</Text>
              <Text style={{fontSize: 12, opacity: .8}}>Ending time: {moment(item.end_time).format('YYYY-MM-DD HH:mm') }</Text>
            </View>
          </Animated.View>
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  taskListContent: {
    height: 100,
    width: 327,
    alignSelf: 'center',
    borderRadius: 10,
    shadowColor: '#2E66E7',
    backgroundColor: '#ffffff',
    marginTop: 10,
    marginBottom: 10,
    shadowOffset: {
      width: 3,
      height: 3,
    },
    shadowRadius: 5,
    shadowOpacity: 0.2,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default HistoryMenu