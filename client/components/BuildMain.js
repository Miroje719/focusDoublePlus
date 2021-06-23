import React, {useState, useRef, useEffect} from 'react'
import moment from 'moment'
import { 
  openDatabase, 
  createDB, 
  endSuccessfulBuilding, 
  startBuild
} from '../db/dbManipulation'

import {
  Vibration,
  StatusBar,
  Easing,
  TextInput,
  Dimensions,
  Animated,
  TouchableOpacity,
  FlatList,
  Text,
  View,
  StyleSheet,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons'
import { block, color } from 'react-native-reanimated';
const { width, height } = Dimensions.get('window');

const colors = {
  black: '#323F4E',
  red: '#F76A6A',
  text: '#ffffff',
}

const timers = [...Array(12).keys()].map((i) => (i === 0 ? 10 : i * 10 + 10));
const ITEM_SIZE = width * 0.25;
const ITEM_SPACING = (width - ITEM_SIZE) / 2;

const getDateTime = () => {
  var date = moment(); 
  return date;
}

const Build = () => {
  const scrollX = useRef(new Animated.Value(0)).current
  const [duration, setDuration] = useState(timers[0])
  const inputRef = useRef()
  const timerAnimation = useRef(new Animated.Value(height)).current
  const textinputAnimation = useRef(new Animated.Value(timers[0])).current
  const buttonAnimation = useRef(new Animated.Value(0)).current

  const movingobject_first = useRef(new Animated.Value(-100)).current
  const movingobject_second = useRef(new Animated.Value(width)).current

  useEffect(() => {
    const db = createDB();
    const listener = textinputAnimation.addListener(({value}) => {
      inputRef?.current?.setNativeProps({
        text: Math.ceil(value).toString()
      })
    })

    return () => {
      textinputAnimation.removeAllListeners(listener)
      textinputAnimation.removeAllListeners()
    }
  })

  const animation = React.useCallback(() => {
    textinputAnimation.setValue(duration)
    Animated.sequence([
      Animated.timing(buttonAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(timerAnimation, {
        toValue: -1,
        duration: 300,
        useNativeDriver: true
      }),

      Animated.timing(movingobject_first, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(movingobject_second, {
        toValue: width,
        duration: 300,
        useNativeDriver: true
      }),

      Animated.parallel([
        Animated.timing(textinputAnimation, {
          toValue: 0,
          duration: duration * 1000,
          useNativeDriver: true
        }),
        Animated.timing(movingobject_first, {
          toValue: width,
          duration: duration * 1000,
          useNativeDriver: true
        }),
        Animated.timing(movingobject_second, {
          toValue: -100,
          duration: duration * 1000,
          useNativeDriver: true
        }),
      ]),
      Animated.delay(400)
    ]).start(() => {
      // Building process ending
      const date= getDateTime().toString();
      // updating database
      endSuccessfulBuilding(date);

      Vibration.cancel()
      Vibration.vibrate()
      textinputAnimation.setValue(duration)
      timerAnimation.setValue(height)
      movingobject_second.setValue(width)
      movingobject_first.setValue(-100)
      Animated.timing(buttonAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start();
    })
  }, [duration])

  const opacity = buttonAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0]
  })

  const translateY = buttonAnimation.interpolate({
    inputRange:[0, 1],
    outputRange: [0, 200]
  })

  const textOpacity = buttonAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  })

  return (
    <View style={styles.container}>
      <StatusBar hidden />
     

      {/* button */}
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            justifyContent: 'flex-end',
            alignItems: 'center',
            paddingBottom: 100,
            opacity,
            transform:[{
              translateY
            }]
          },
        ]}>
        <TouchableOpacity
        // Building process start var duration stores how long
          onPress={() => {animation(); const date = getDateTime().toString(); startBuild(date); }}>
          <View style={styles.roundButton}>
            <MaterialCommunityIcons size={80} color="#fff" name="hammer-wrench"/>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* scroll */}
      <View
        style={{
          position: 'absolute',
          top: height / 3,
          left: 0,
          right: 0,
          flex: 1,
        }}>
          <Animated.View style={{
            position: "absolute",
            width: ITEM_SIZE,
            justifyContent: "center",
            alignSelf: "center",
            alignItems: "center",
            opacity: textOpacity,
          }}>
            <TextInput
              ref={inputRef}
              style={{
                ...styles.text,
                fontWeight: '100',
                marginTop: 180
              }}
              defaultValue={duration.toString()}
            />
          </Animated.View>
          <Animated.FlatList
            data={timers}
            keyExtractor={item => item.toString()}
            horizontal
            bounces={false}
            onScroll={Animated.event(
              [{nativeEvent: {contentOffset: {x: scrollX}}}],
              { useNativeDriver: true }
            )}
            onMomentumScrollEnd={ev => {
              const index = Math.round(ev.nativeEvent.contentOffset.x / ITEM_SIZE)
              setDuration(timers[index])
            }}
            showsHorizontalScrollIndicator={false}
            snapToInterval={ITEM_SIZE}
            style={{flexGrow: 0, opacity}}
            decelerationRate="fast"
            contentContainerStyle={{
              paddingHorizontal: ITEM_SPACING
            }}
            renderItem={({item, index}) => {
              const inputRange = [
                (index - 1) * ITEM_SIZE,
                index * ITEM_SIZE,
                (index + 1) * ITEM_SIZE,
              ]

              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [.4, 1, .4]
              })
              const scale = scrollX.interpolate({
                inputRange,
                outputRange: [.7, 1, .7]
              })
              return <View style={{width: ITEM_SIZE, justifyContent: "center", alignItems: "center"}}>
                <Animated.Text style={[styles.text, {
                  opacity,
                  transform: [{
                    scale
                  }]
                }]}>
                  {item}
                </Animated.Text>
              </View>
            }}
          />
        </View>

      <Animated.Image
        source={require("./../assets/background.png")}
        style={[StyleSheet.absoluteFillObject, {
          height: 250,
          width: 250,
          borderRadius: 150,
          zIndex: -1,
          marginLeft: width / 4 - 30,
          marginTop: height / 6,
          transform: [{
            translateY: timerAnimation
          }]
        }]}
      />
      <Animated.Image
        source={require("./../assets/movingobject1.png")}
        style={[StyleSheet.absoluteFillObject, {
          height: 100,
          width: 100,
          marginTop: height - 200,
          transform: [{
            translateX: movingobject_first
          }]
        }]}
      />
      <Animated.Image
        source={require("./../assets/movingobject2.png")}
        style={[StyleSheet.absoluteFillObject, {
          height: 100,
          width: 100,
          marginTop: height - 180,
          transform: [{
            translateX: movingobject_second
          }]
        }]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  roundButton: {
    width: 85,
    height: 85,
    borderRadius: 85,
    backgroundColor: '#F76A6A'
  },
  text: {
    fontSize: ITEM_SIZE * 0.4,
    color: colors.text,
    fontWeight: '900',
  }
})

export default Build