import { ref, set } from 'firebase/database'
import React, { useRef, useState } from 'react'
import ConfirmationBox from "./ConfirmationBox"

function LogItem({data, NumbersToString, StringToNumbers, updateEntryDate, firebase, userId}) {

  let contentInput = useRef()
  const [showConfirmationBox, setShowConfirmationBox] = useState()

  let timer = useRef()
  function contentChanged(){
    timer.current && clearTimeout(timer.current)
    timer.current = setTimeout(()=>{
      updateEntry(contentInput.current.value, data.date)
    }, 500)
  }
  // Update one log item based on the date and content
  function updateEntry(content, currentDate, newDate){
    if(!userId){
      console.log("no user ID")
      return
    }
    // also need to make sure the new date is not overrwriting an existing date
    if(!newDate || currentDate === newDate){
      set(ref(firebase.current.db, userId+"/log/"+currentDate), {date: currentDate, content: StringToNumbers(content)})
      
    }
  }
  let dateInput = useRef()
  function updateDateFunction(){
    console.log(data)
    updateEntryDate(data.content, data.date, dateInput.current.value)
  }
  function deleteLogItem(){
    set(ref(firebase.current.db, userId+"/log/"+data.date), null)
  }

  return (
    <div className='logItem'>
      <div className='infoCircle'>
        i
        <div className='logEntryMenu'>
          {/* <div className='infoCircleInfo'>
            {data.date}
          </div> */}
          <input type='date' defaultValue={data.date} ref={dateInput} onChange={updateDateFunction}></input>
          <div onClick={()=>setShowConfirmationBox(true)}>Delete</div>
        </div>
      </div>
      <textarea defaultValue={NumbersToString(data.content)} ref={contentInput} onChange={contentChanged}>
          
      </textarea>
      {showConfirmationBox && <ConfirmationBox message={"delete log item at date "+data.date+"?"} confirm={deleteLogItem} cancel={()=>setShowConfirmationBox(false)}></ConfirmationBox>}
    </div>
  )
}

export default LogItem