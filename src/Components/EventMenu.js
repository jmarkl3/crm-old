import React, { useEffect, useRef, useState } from 'react'
import ContactMenu from './ContactMenu'
import { set, update, ref as dbRef, push } from 'firebase/database'
import ImageArrayViewer from './ImageArrayViewer'
import TypeSelect from './TypeSelect'
import TypeSelectContacts from './TypeSelectContacts'

function EventMenu(props) {

  const [eventContact, setEventContct]= useState(null)
  const eventContactRef = useRef()
  const needsUpdate = useRef(false)

  useEffect(()=>{

    // If theres no key its a new contact so put focus on the contact selector
    if (!props.selectedEvent.key){
      document.getElementById("textInput").focus()
    }
    // If its an existing event get the contact data
    else{
      var contactData = props.getContactData(props.selectedEvent.imageKey)

      setEventContct(contactData)
      eventContactRef.current = contactData
    }

    setUpKeyListener()

    console.log("props.userId")
    console.log(props.userId)

  },[])

  const tabDown = useRef(false)
  function setUpKeyListener(){    
    
    // Keydown listener
    document.getElementById("eventMenu").addEventListener("keydown", event => {  

      if(event.key == "Tab"){
        tabDown.current = true                  
        tabFocus()
      }

      if(tabDown.current && event.key == "o")        
        closeMenu()
      
    })

    // Keyup listener
    document.getElementById("eventMenu").addEventListener("keyup", event => {      
      if(event.key == "Tab")
        tabDown.current = false
    })

  }

  // Flag var so this is only called once per tab press
  const justTabbed = useRef(false)
  // when tab is pressed (window.addEventListener("keydown", ()=>{})) index goes up and doc.getelement(idAdIndex).focus() so the window focuses on that one
  const tabIndexRef = useRef(1)
  function tabFocus(){    
    
    if(!justTabbed.current){

      if(tabIndexRef.current == 0)
        document.getElementById("textInput").focus()

      if(tabIndexRef.current == 1)
        document.getElementById("notesInput").focus()
      
      if(tabIndexRef.current == 2)
        document.getElementById("eventStatusSelector").focus()

      if(tabIndexRef.current == 3)
        document.getElementById("nameInput").focus()
        
      tabIndexRef.current = tabIndexRef.current + 1
        
      if(tabIndexRef.current == 4)
        tabIndexRef.current = 0
    }    

    // Flag var so this is only called once per tab press
    justTabbed.current = true
    setTimeout(() => justTabbed.current = false, 100);

  }


  function deleteEvent(){
    console.log("delete event "+props.userId+"/events/"+props.selectedEvent.date+"/"+props.selectedEvent.ke)    
    if(props.selectedEvent.key)      
      set(dbRef(props.firebase.current.db, props.userId+"/events/"+props.selectedEvent.date+"/"+props.selectedEvent.key), null)
    
      props.setDisplayEventMenu(false)    
    
  }

  // Helper Functions

  function updatedSomething(){
    needsUpdate.current = true
  }


  function closeMenu(){
    
    if(needsUpdate.current)
      updateEventDb()
    props.setDisplayEventMenu(false)
  }
  
  function updateEventDb(){
    
    // gather the data
    try{ 
      var name = document.getElementById("nameInput").value    
      var date = document.getElementById("dateStartSelector").value
      var dateEnd = document.getElementById("dateEndSelector").value
      var color = document.getElementById("eventStatusSelector").value
      var notes = document.getElementById("notesInput").value  
      var imageKey = eventContactRef.current.key
    }catch(err){}    

    // Firebase gives an error if there are any undefined values
    if (imageKey == undefined)
      imageKey = null

    // put it in the db
    props.updateEventDb({
      name: name,
      date: date,
      dateEnd: dateEnd,
      color: color,
      notes: notes,
      imageKey: imageKey,
      key: props.selectedEvent.key,
    })

    // Update the status of the contact when changing their event status
    if(imageKey && document.getElementById("updateContactStatusCheckbox").value)
      update(dbRef(props.firebase.current.db, "images2/"+imageKey), {color: color.replace("event", "")})
  }

  function selectContact(_contact){
    updatedSomething()
    setEventContct(_contact)   
    eventContactRef.current = _contact
  }

  const contactNotesRef = useRef()
  const updateContactsNoteTimer = useRef()

  function changedContactNotes(){

    // If there is a pending save clear it
    if(updateContactsNoteTimer.current)
      clearTimeout(updateContactsNoteTimer.current)
    
    // Save in 2 seconds (2 seconds of inactivity)
    updateContactsNoteTimer.current = setTimeout(() => {
      updateContactNotes()
    }, 1000);
  }

  function updateContactNotes(){    
    // If there is no selected event contact don't update anything
    if(!eventContact)
      return

    props.updateContactDb({
      name: eventContact.name,
      notes: contactNotesRef.current.value,
      color: eventContact.color,
      images: eventContact.images,
      // If its a new contact key == null so it will push a new one and set props.selectedContact (accessed by ContactManu)to reflect
      key: eventContact.key,      
    })
  }

  return (
    <>        
      <div className='box2 menuBox blueGlow eventMenu' id='eventMenu'>
          <div className='closeButton' onClick={closeMenu}>x</div>
          <div className='leftDiv'>
            <div className='leftDivImgArrayContainer'>
              <ImageArrayViewer
                imageArray={eventContact && eventContact.images}
              ></ImageArrayViewer>
            </div>
            <TypeSelectContacts
              optionArray={props.contactsArray}
              selectContact={selectContact}
              defaultContact={eventContact}
            ></TypeSelectContacts>     
            <textarea 
              placeholder='notes' 
              defaultValue={eventContact && eventContact.notes} 
              ref={contactNotesRef} 
              onChange={changedContactNotes}
            ></textarea>                  
          </div>
          <div className='contactImageInfo'>
            <input id='nameInput' placeholder='Name' defaultValue={props.selectedEvent && props.selectedEvent.name} onChange={updatedSomething} autoComplete="off"></input>            
            <select id='eventStatusSelector' placeholder='status' className='eventStatusSelect' defaultValue={props.selectedEvent && props.selectedEvent.color} onChange={updatedSomething}>
              <option value="eventBlue">Blue</option>                    
              <option value="eventYellow">Yellow</option>
              <option value="eventLightGreen">Light Green</option>
              <option value="eventGreen">Green</option>
              <option value="eventGray">Gray</option>
              <option value="eventLightBlue">LightBlue</option>
              <option value="eventClear">Clear</option>
              <option value="eventOrange">Orange</option>
              <option value="eventDarkGreen">DarkGreen</option>
            </select>
            <input type={"checkbox"} className="eventCheckbox" defaultChecked={true} id={"updateContactStatusCheckbox"}></input>
            <input id='dateStartSelector' type={"date"} className="eventDateInput" defaultValue={props.selectedEvent && props.selectedEvent.date} onChange={updatedSomething}></input>
            <input id='dateEndSelector' type={"date"} className="eventDateInput" onChange={updatedSomething}></input>
            <textarea id='notesInput' placeholder='Notes'  defaultValue={props.selectedEvent && props.selectedEvent.notes} onChange={updatedSomething}></textarea>
            <div className='hoverBox button' onClick={deleteEvent}>Delete</div>
            <div className='hoverBox button' onClick={()=>props.setDisplayEventMenu(false)}>Cancel</div>
          </div>
      </div>        
    </>
  )
}
EventMenu.defaultProps = {
  open: false,
    setOpen: (param) => {console.log("no function: setting open to " + param)}
}
export default EventMenu