import React, { useEffect, useRef, useState } from 'react'
import "./Log.css"
import { data } from '@tensorflow/tfjs'
import { onValue, ref, set } from 'firebase/database'
import moment from 'moment'
import LogItem from './LogItem'

function LogTest(props) {

  const dateStartInput = useRef()
  const dateEndInput = useRef()

  const [logEntries, setLogEntries] = useState({})
  const [hasToday, setHasToday] = useState(false)

  // Load the log data on start
  useEffect(()=>{
    loadLog()
    // This loads, converts, and saves the old log into the new log location
    //loadOldLog()
  }, [])
  function loadLog(){       
    onValue(ref(props.firebase.current.db, props.userId+"/log"), snap => {                
      setLogEntries(snap.val())
      addToday(snap.val())
    })
  }

  // Create two dates for starting and ending date position
  const tempDate = new Date()
  const tempDate2 = new Date()
  tempDate2.setDate(tempDate2.getDate() - 7)
  // Create state based on those dates
  const [dateRange, setDateRange] = useState([
    tempDate2.toISOString().split("T")[0],
    tempDate.toISOString().split("T")[0], 
  ])

  // Create an array of dates based on the date range in state
  const date = new Date()
  function logRangeArray(){
    // Create an array of date strings within the range
    let tempDataStringArray = []
    // If the first data is after the second date
    if(dateRange[0] > dateRange[1]){      
      let tempDate = new Date(dateRange[1])
      while(tempDate.toISOString().split('T')[0] <= dateRange[0]){
        tempDataStringArray = [tempDate.toISOString().split('T')[0], ...tempDataStringArray]
        //tempDataStringArray.push(tempDate.toISOString().split('T')[0])
        tempDate.setDate(tempDate.getDate() + 1)
      }
    }
    else{
      // Create an array of date strings
      let tempDate = new Date(dateRange[0])
      while(tempDate.toISOString().split('T')[0] <= dateRange[1]){
        //tempDataStringArray.push(tempDate.toISOString().split('T')[0])
        tempDataStringArray = [tempDate.toISOString().split('T')[0], ...tempDataStringArray]
        tempDate.setDate(tempDate.getDate() + 1)
      }
    }

    // Look for data for those dates    
    let tempDataArray = []
    
    if(logEntries && logEntries["0000-00-00"])
      tempDataArray.push(logEntries["0000-00-00"])

    tempDataStringArray.forEach(dateString => {
      if(logEntries && logEntries[dateString] && logEntries[dateString].content != undefined){
        let dataObject = logEntries[dateString]
        dataObject.date = dateString
        tempDataArray.push(dataObject)
      }
    })  

    return tempDataArray
  }

  // For when the data range in the top bar is changed
  function updateDateRange(amount){

    if(amount){
      
      // Move the date range by the amount
      let tempStartDate = new Date(dateStartInput.current.value)
      tempStartDate.setDate(tempStartDate.getDate() + amount)

      let tempEndDate = new Date(dateEndInput.current.value)
      tempEndDate.setDate(tempEndDate.getDate() + amount)
      
      const newDateRange = [
        tempStartDate.toISOString().split("T")[0],
        tempEndDate.toISOString().split("T")[0]
      ]

      // Update the inputs
      dateStartInput.current.value = newDateRange[0]
      dateEndInput.current.value = newDateRange[1]

      // Update the state so the log items refresh
      setDateRange(newDateRange)

    }
    else{
      // Update the state based on the inputs
      setDateRange([dateStartInput.current.value, dateEndInput.current.value])
    }
  }  
  // Add a log entry for today if there isn't one (automatic)
  function addToday(_logEntries){
    return
    if(!props.userId){
      console.log("no user ID")
      return
    }
    let today = moment().format("YYYY-MM-DD")
    console.log("adding log entry at "+props.userId+"/log/"+today)
    if(!_logEntries || !_logEntries[today]){
      set(ref(props.firebase.current.db, props.userId+"/log/"+today), {date: today, content: ""})
    }
  }
  // Add a log entry at the top if there isn't one (manual)
  function addEntry(){
    if(!props.userId){
      console.log("no user ID")
      return
    }
    // let today = moment().format("YYYY-MM-DD")

    if(!logEntries["0000-00-00"]){
      set(ref(props.firebase.current.db, props.userId+"/log/"+"0000-00-00"), {date: "0000-00-00", content: ""})
    }
  }

  function updateEntryDate(content, currentDate, newDate){
    if(!props.userId){
      console.log("no user ID")
      return
    }
    if(logEntries[newDate]){
      console.log("date already exists")
      window.alert("date already exists")
      return
    }
    if(!newDate || currentDate === newDate){
      console.log("invalid target date")
      // window.alert("date already exists")
      return
    }    

    // Put it in the new location
    set(ref(props.firebase.current.db, props.userId+"/log/"+newDate), {date: newDate, content: props.StringToNumbers(content)})
    // Delte it in its current date location
    set(ref(props.firebase.current.db, props.userId+"/log/"+currentDate), null)
      
    
  }

  // Dev functions
  const [logArray, setLogArray] = useState([])
  useEffect(()=>{

    convertData()
  }, [logArray])
  function loadOldLog(){       
    onValue(ref(props.firebase.current.db, "log"), snap => {            
            
      console.log(snap.val())
      return
      var tempArray = []
      for(var v in snap.val()){
          tempArray.push(snap.val()[v])
      }       
      
      setLogArray(sortLogEntries(tempArray))

  })
  }
  function sortLogEntries(_logEntryArray){

    var tempArray = []
    _logEntryArray.forEach( entry => {
        
        // Get the index of the entry in the sorted array that is before the entry that is being placed
        var c = 0
        var placeIndex = tempArray.length
        tempArray.forEach( placedEntry => {
            if(moment(placedEntry.date, "YYYY-MM-DD").isBefore(moment(entry.date, "YYYY-MM-DD"))){
                placeIndex = c
                //console.log(moment(placedEntry.date,"YYYY-MM-DD").format("YYYY-MM-DD") + " is before " + moment(entry.date,"YYYY-MM-DD").format("YYYY-MM-DD"))
                return
            }
  
            c++
        })
  
        // Place the new entry            
        tempArray.splice(placeIndex, 0, entry)
  
        // Check to see if there is an entry for today
        if(entry.date === moment().format("YYYY-MM-DD"))
            setHasToday(true)            
    })
  
    let logObject = {}
    tempArray.forEach(logItem => {
      if(logItem.date){
        logObject[logItem.date] = logItem
        logObject[logItem.date].content = props.StringToNumbers(logItem.content)
  
      }
    })
    // console.log("logObject")
    // console.log(logObject)
    saveLogObject(logObject)
  
    return tempArray
  }
  function convertData(){
    if(!logArray)
      return
    console.log(logArray.length)
  }
  function saveLogObject(logObject){
    set(ref(props.firebase.current.db, props.userId+"/log"), logObject)
  }
  function logLog(){
    console.log(logEntries)
  }

  function transferLog(){
    onValue(ref(props.firebase.current.db, "p04DCguNXTeLSI2xx7pCqdqiFv23/log"), snap => {
      set(ref(props.firebase.current.db, props.userId+"/log"), snap.val())
    }, {
      onlyOnce: true
    })
  }


  return (
    <div className='logPage'>
        <div className='logTopBar'>
          <div className='arrowButton' onClick={()=>updateDateRange(-7)}>{"<"}</div>          
          <input type="date" defaultValue={dateRange[0]} ref={dateStartInput} onChange={()=>updateDateRange()}></input>
          <input type="date"  defaultValue={dateRange[1]} ref={dateEndInput} onChange={()=>updateDateRange()}></input>
          <div className='arrowButton' onClick={()=>updateDateRange(7)}>{">"}</div>
          <div className='search'>
            <input placeholder={"search"}></input>
            <div className='arrowButton'>{"🔍"}</div>
          </div>
          <div className='arrowButton' onClick={addEntry}>{"New"}</div>
          {/* <div className='arrowButton' onClick={logLog}>{"Log Log"}</div> */}
          {/* <div className='arrowButton' onClick={()=>setShowAuthMenu(true)}>{"👤"}</div> */}
        </div>
        <div onClick={transferLog}>transferLog</div>
        {logRangeArray().map(data => (
          <>
            <LogItem updateEntryDate={updateEntryDate} data={data} NumbersToString={props.NumbersToString} key={data.date} firebase={props.firebase} StringToNumbers={props.StringToNumbers} userId={props.userId}></LogItem>            
          </>
        ))}
    </div>
  )
}

export default LogTest