import React, { useEffect, useRef, useState } from 'react'
import LogItem from '../Components/LogItem'
import {onValue, push, ref, update, set} from 'firebase/database'
import "../Styles/Log.css"
import moment from 'moment'
/*

    log entries encrypted
    log entries saved with the date as the key
      when its saved its based on the date
      if the date changes it deletes that data and adds it in the new place
    only load the specified dates

    load once for all encrypted data
    unencrypt and display the ones based on the data range

    data converter
    takes the data and saves it with the date as the key
    also encrypts it

    firebase rules so only the user with the same ID can access the data
    so maybe save it in a log/userID area

*/

function Log2(props) {

    const [logArray, setLogArray] = useState([])
    const [hasToday, setHasToday] = useState(false)

    useEffect(()=>{
        loadLog()
    }, [])

    // Load the log items from the db and put in state to be mapped
    function loadLog(){        

        // once

        onValue(ref(props.firebase.current.db, "log"), snap => {            
            
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

        return tempArray
    }

    // Save given log item to the db
    function saveLogItem(_logData){

        if(_logData.date == null)    
            return        

        // If there no key the logitem is new, so create and add it
        if(_logData.key == null){

            // push a new one to the db and save the key
            var newLogitemRef = push(ref(props.firebase.current.db, "log")) 
            _logData.key = newLogitemRef.key

            // update the db to add it
            update(ref(props.firebase.current.db, "log/"+_logData.key), _logData)
        }   
        // If there is a key updte it
        else
            set(ref(props.firebase.current.db, "log/"+_logData.key), _logData)        

    }
    function deleteLogItem(_logData){
        if(!_logData.key)
            return

        // Add it to the archive
        set(ref(props.firebase.current.db, "logArchive/"+_logData.key), _logData)

        // Delete it from the log
        set(ref(props.firebase.current.db, "log/"+_logData.key), null)
    }

  return (
    <div className='logContainer'>
        {!hasToday &&
            <LogItem
                logData={{
                    date: moment().format("YYYY-MM-DD"),
                    title: moment().format("YYYY-MM-DD dddd"),                    
                    content:"",
                    key: null,
                }}
                saveLogItem={saveLogItem}
            ></LogItem>
        }
        {logArray.map( logData => (
            <LogItem
                logData={logData}
                saveLogItem={saveLogItem}
                deleteLogItem={deleteLogItem}
            ></LogItem>
        ))}
        <LogItem
            logData={{
                date: null,
                title:"New Entry",
                content:"",
                key: null,
            }}
            saveLogItem={saveLogItem}
        ></LogItem>
    </div>
  )
}

Log2.defaultProps = {
    firebase: {
        db: null,
    }
}

export default Log2