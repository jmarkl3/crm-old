import React, { useEffect, useState } from 'react'
import "../Styles/Calendar.css"
import Day from '../Components/Day'
import moment from "moment"
import ArrowButtons from '../Components/ArrowButtons'
import EventMenu from '../Components/EventMenu'

/*

  A better data structure:
  userID/events/date: [{event1}, {event2}, ...]
  load events into object
  create calendar array
  put events into calendar array based on O(1) access with date as key 
  map calendar array to screen

  or
  userID/events/year/month{
    day: [{event1}, {event2}, ...],
    ...
  }

  TODO
  DONE
  convert existing events to new data structure
  DONE
  save, load, and display existing date

  update add and update event functions to save in new db location


*/

function Calendar(props) {
  
  const [calendarArray, setCalendarArray] = useState([])

  useEffect(()=>{    

    // Builds a calendar (array of days) and places events in those days. Puts that in state and maps it to screen
    refreshCalendar(props.dayOfFocus)

  },[props.eventsObject, props.dayOfFocus])
  
  function createMonthArray(_day){        

    if(!_day)
      _day = moment().clone()    
    var start = _day.clone().startOf("month").startOf("week").subtract(1, "day")
    var counter = start.clone()
    var end = _day.clone().endOf("month").endOf("week")
    
    var tempArray = []
    while(counter.isBefore(end, "day"))
      tempArray.push({
        moment: counter.add(1, "day").clone(), 
        events: [],
      })

    return tempArray
  }

  function nextMonth(){
    var newDay = props.dayOfFocus.clone().add(1, "month")
    refreshCalendar(newDay)
    props.setDayOfFocus(newDay)
  }
  function lastMonth(){    
    var newDay =props.dayOfFocus.clone().subtract(1, "month")
    refreshCalendar(newDay)
    props.setDayOfFocus(newDay)
  }

  function refreshCalendar(_day){    
    setCalendarArray(createCalendarArray(createMonthArray(_day), props.eventArray))
  }

 

  function createCalendarArray(_monthArray, _eventArray){  
    var temCalendarArray = [..._monthArray]
    temCalendarArray.forEach(dayData => {
      // console.log("checking "+dayData.moment.format("YYYY-MM-DD"))
      // console.log("props.eventsObject["+dayData.moment.format("YYYY-MM-DD")+"]")
      // console.log(props.eventsObject[dayData.moment.format("YYYY-MM-DD")])

      if(props.eventsObject && props.eventsObject[dayData.moment.format("YYYY-MM-DD")]){
        dayData.events = Object.values(props.eventsObject[dayData.moment.format("YYYY-MM-DD")])
      }
      // _eventArray.forEach(eventData => {
      //   if(dayData.moment.isSame(eventData.date, "day") && dayData.moment.isSame(eventData.date, "month"))
      //     dayData.events.push(eventData)
      // })
    })

    return temCalendarArray
  }

  return (
    <div className='calendarContainer' id='calendarContainer'>      
      <div>
        <ArrowButtons
          message={ props.dayOfFocus.format("MMMM YYYY") }
          arrowLeft={lastMonth}
          arrowRight={nextMonth}
        ></ArrowButtons>
      </div>
      <div className='calendar' id='calendar'>

          {calendarArray.map((dayData, index) => (          
            <Day
              key={"day"+index}
              dayData={dayData}
              index={index}
              openEvent={props.openEvent}            
              selectedDay={props.dayOfFocus}
              getContactData={props.getContactData}              
            >
            </Day>
          ))}
      </div>

    </div>
  )
}

export default Calendar