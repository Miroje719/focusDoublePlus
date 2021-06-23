import React, {useEffect, useState, useRef} from 'react'
import { 
  Button, 
  View, 
  Text, 
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  TouchableHighlight,
  StatusBar,
  Image,
  FlatList, RefreshControl,
  ImageBackground,
  Animated, 
  TextInput,
  Easing, SafeAreaViewBase } from 'react-native';

import * as Calendar from 'expo-calendar';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';

const {width, height } = Dimensions.get('screen');

const wait = timeout => {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
};

const addEventToCalendar = async eventDetails => {
  const eventIdInCalendar = await Calendar.createEventAsync();
  Calendar.openEventInCalendar(eventIdInCalendar);
}

async function getDefaultCalendarSource() {
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const defaultCalendars = calendars.filter(each => each.source.name === 'Default');
  return defaultCalendars[0].source;
}

async function createCalendar() {
  const defaultCalendarSource =
    Platform.OS === 'ios'
      ? await getDefaultCalendarSource()
      : { isLocalAccount: true, name: 'focus calendar' };
  const newCalendarID = await Calendar.createCalendarAsync({
    title: 'focus calendar',
    color: 'blue',
    entityType: Calendar.EntityTypes.EVENT,
    sourceId: defaultCalendarSource.id,
    source: defaultCalendarSource,
    name: 'focus calendar',
    ownerAccount: 'personal',
    accessLevel: Calendar.CalendarAccessLevel.OWNER,
  });
  return newCalendarID;
}

const SPACING = 20
const AVATAR_SIZE = 70
const ITEM_SIZE = AVATAR_SIZE + SPACING * 3

const SchedulingMenu = ({ navigation }) => {
  const [calendarID, setCalendarID] = useState('');
  const [listData, setListData] = useState([])
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);

  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);

  const [text, onChangeText] = useState("Name");
  const [number, onChangeNumber] = useState(null);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode('date');
  };

  const showTimepicker = () => {
    showMode('time');
  };

  const addEventToCalendar = async () => {
    var t = new Date();
    const eventIdInCalendar = await Calendar.createEventAsync(calendarID, {title: text, startDate: date, endDate: t.setTime(date.getTime() + 30 * 6000), alarms: [{date: t.setTime(date.getTime() - 5 * 6000)}]});
  };

  const scrollY = useRef(new Animated.Value(0)).current


  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    const events = await Calendar.getEventsAsync([calendarID],new Date('2000-08-10T00:00:00'), new Date('2030-08-10T00:00:00'));
    setListData(events);
    wait(2000).then(() => setRefreshing(false));
  },  []);

  useEffect(() => {
    (async () => {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        var calendarFound = false;
        calendars.forEach((calendar, i) => {
          if (calendar.name === "focus calendar" && !calendarFound) {
            calendarFound = true;
            setCalendarID(calendar.id);
          }
        })

        if (!calendarFound) {
          const newCalendarID = createCalendar();
          setCalendarID(newCalendarID);
        }

        const events = await Calendar.getEventsAsync([calendarID],new Date('2000-08-10T00:00:00'), new Date('2030-08-10T00:00:00'));
        
        setListData(events);
      }
    })();
  },[]);

  return (
    <View style={{flex: 1, backgroundColor: '#fff'}}>
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

          return <Animated.View style={styles.taskListContent}>
            <Image 
              source={require("./../assets/schedule.png")}
              size={AVATAR_SIZE}
              style={{width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE, marginRight: SPACING / 2 + 10, marginLeft: SPACING}}
            />
            <View>
              <Text style={{fontSize: 22, fontWeight: '700'}}>{item.title}</Text>
              <Text style={{fontSize: 18, opacity: .8}}>{moment(item.endDate).format('YYYY-MM-DD HH:mm')}</Text>
            </View>
          </Animated.View>
        }}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text>Event name:</Text>
            <TextInput  
              style={{height: 40, margin: 12, borderWidth: 1, width: 150,padding: 5, }} 
              onChangeText={onChangeText}
              value={text}/>
            <View style={{display: "flex", flexDirection: "row",}}>
              <Button onPress={showDatepicker} title="set date" />
              <Button onPress={showTimepicker} title="set time" />  
            </View>
            
            {show && (
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode={mode}
                is24Hour={true}
                display="default"
                onChange={onChange}
              />
            )}
            
            <View style={{display: "flex", flexDirection: "row",}}>
              <TouchableHighlight
                style={{ ...styles.openButton, backgroundColor: '#2196F3', marginTop: 30 }}
                onPress={() => {
                  setModalVisible(!modalVisible);
                }}>
                <Text style={styles.textStyle}>Close</Text>
              </TouchableHighlight>
              <TouchableHighlight
                style={{ ...styles.openButton, backgroundColor: '#2196F3', marginTop: 30 }}
                onPress={() => {
                  addEventToCalendar();
                  setModalVisible(!modalVisible);
                }}>
                <Text style={styles.textStyle}>Submit</Text>
              </TouchableHighlight>
            </View>
            
          </View>
        </View>
      </Modal>
      <TouchableOpacity
                onPress={() =>
                  setModalVisible(true)
                }
                style={styles.viewTask}
              >
                <Image
                  source={require('../assets/plus.png')}
                  style={{
                    height: 30,
                    width: 30,
                  }}
                />
        </TouchableOpacity>
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
    alignItems: 'center',
  },
  viewTask: {
    position: 'absolute',
    bottom: 40,
    right: 17,
    height: 60,
    width: 60,
    backgroundColor: '#2E66E7',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2E66E7',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowRadius: 30,
    shadowOpacity: 0.5,
    elevation: 5,
    zIndex: 999,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 5,
    paddingTop: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: width / 1.2,
    height: height / 3,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  openButton: {
    backgroundColor: '#F194FF',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
});

export default SchedulingMenu