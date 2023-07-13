import { useEffect, useRef, useState } from 'react';
import './App.css';
import Calendar from './Pages/Calendar';
import Contacts from './Pages/Contacts';
import Notes from './Pages/Notes';
import Gallery from './Pages/Gallery';
import Stats from './Pages/Stats';
import Account from './Pages/Account'
import Settings from './Pages/Settings'
import "./Styles/Vars.css"
import Sidebar from './Components/Sidebar';
import ContactMenu from './Components/ContactMenu';
import ImageDetail from './Components/ImageDetail';
import { initializeApp } from 'firebase/app'
import { getDatabase, onValue, ref as dbRef, set, push, update, orderByValue, get, ref } from 'firebase/database'
import { getStorage, uploadBytes, ref as sRef, getDownloadURL, connectStorageEmulator } from 'firebase/storage'
import moment from 'moment'
import SpaceComponent from './Components/SpaceComponent';
import userEvent from '@testing-library/user-event';
import EventMenu from './Components/EventMenu';
import Log from './Pages/Log';
import { isCompositeComponent } from 'react-dom/test-utils';
import Auth from './Pages/Auth';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Scroller from './Pages/Scroller';
import LogTest from './Pages/Log/LogTest';

function App() {
  
  //\\// ==================== ==================== Notes and TODO ==================== ==================== \\//\\
  /*

  entire app is pretty janky 
  probably should restart with redux


  DONE
  log in
  activated auth in the new db, created an account

  DONE
  created new db, loaded data from old db, downloaded it, uploaded it in firebase console, and switched to new db with firebaseSetup2
    
  DONE
  transfer events data new userID
  there is a function that loads the events array, converts it to an object, and saves it under the new userID 
  the calendar component is already set up to load from this events object instead of the events array
  DONE
  make it so new events save to the new location in the proper format
  DONE
  transfer log data to new db under userID  
  make it so new log items save in the corresponding place in the new db in the correct format

  notes

  DONE
  just move the data from the current location in the db to userID/log in the new format

  DONE
  log items load from new location

  log items save to new location when theyre updated
  from the log item menu:
    can change date of log item
    can add new log item
    can delete log item with a confirmation popup
  update live page

  update calendar data to new data location and in new format with dates as keys
  update calendar loading so it loads from new location in a more efficient way using the date range
  update where calendar data is saved to new db location
  update live page

  search feature in log
    shows log items that have matching data
  search feature in calendar
    shows events in a list that have matching names or notes or contact notes
    ability to check only match name, or note, or contact note content

  update firebase rules



  nvm with all that

  make a backup of the current database
  copy all of the contents of the old db into the new db and switch to that completly for safety
  storage won't work though, would have to download all files and reupload with the same keys

  create a project in the new account
  create a repo in the new account
  sign into the proper github account (or create a repo in the curretnly signed in account)



  create crm account with new db

  pull the data from the current database
  encrypt the data
  put it in the new database under the userID of the new crm account

  set up firebase rules to only allow the user to access their own data

  re-create the app from scratch using the new database

 */

  //\\// ==================== ==================== Vars and Init ==================== ==================== \\//\\
  // #region

  // Page
  const [page, setPage] = useState("auth")
  const [userId, setUserId] = useState(null)

  // Display
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [displayContactMenu, setDisplayContactMenu] = useState(false)  
  const [displayImageDetail, setDisplayImageDetail] = useState(false)  
  const [displayEventMenu, setDisplayEventMenu] = useState(false)

  // Data Arrays
  const [contactsArray, setContactsArray] = useState([])
  const [eventsArray, setEventsArray] = useState([])
  const [eventsObject, setEventsObject] = useState([])
  const [imageDetailArray, setImageDetailArray] = useState([])
    
  // Object Data
  const [selectedContact, setSelectedContact] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const dayOfFocusRef = useRef(moment().clone())
  const [dayOfFocus, setDayOfFocus] = useState(dayOfFocusRef.current)

  // Filters
  const [search, setSearch] = useState("")
  const [showGrayContacts, setShowGrayContacts] = useState(true)
  const [showBlueContacts, setShowBlueContacts] = useState(true)
  const [showYellowContacts, setShowYellowContacts] = useState(true)
  const [showGreenContacts, setShowGreenContacts] = useState(false)
  const [showOrangeContacts, setShowOrangeContacts] = useState(false)
  const [showClearContacts, setShowClearContacts] = useState(false)
  const [showArchivedContacts, setShowArchivedContacts] = useState(false)   
  
  const [youtubeVideoId, setYoutubeVideoId] = useState()   

  // Refs
  const tabDown = useRef(false)
  const firebase = useRef(null)
  const firebase2 = useRef(null)

  useEffect(()=>{
    
    setUpKeyListener()
    // firebaseSetup()
    firebaseSetup2()
    loadContacts()
    //loadEventsArray()
    loadEventsObject()
    
  },[userId])

  function firebaseSetup() {
    // Connect to the app and get refs to the db and storage
    var app = initializeApp({      
      // New DB:
      // apiKey: "AIzaSyDSKYWDzFjAMLRFr7tVVA1vpp9mNy_p76Y",
      // authDomain: "crm-old.firebaseapp.com",
      // databaseURL: "https://crm-old-default-rtdb.firebaseio.com",
      // projectId: "crm-old",
      // storageBucket: "crm-old.appspot.com",
      // messagingSenderId: "361196550608",
      // appId: "1:361196550608:web:9c69613406421c4da361d5"
      //
      // Old db:
      apiKey: "AIzaSyDCrQSCE91lh7GYlr7eTFbX--e1NnvF7Uw",
      authDomain: "practice-79227.firebaseapp.com",
      databaseURL: "https://practice-79227-default-rtdb.firebaseio.com",
      projectId: "practice-79227",
      storageBucket: "practice-79227.appspot.com",
      messagingSenderId: "283438782315",
      appId: "1:283438782315:web:d913f1ed9d87b5401a1e2e"
    })
    var db = getDatabase(app)
    var storage = getStorage(app)
    var auth = getAuth()    

    // var app2 = initializeApp({
    // apiKey: "AIzaSyDSKYWDzFjAMLRFr7tVVA1vpp9mNy_p76Y",
    // authDomain: "crm-old.firebaseapp.com",
    // databaseURL: "https://crm-old-default-rtdb.firebaseio.com",
    // projectId: "crm-old",
    // storageBucket: "crm-old.appspot.com",
    // messagingSenderId: "361196550608",
    // appId: "1:361196550608:web:9c69613406421c4da361d5"
    // })
    // var db2 = getDatabase(app2)
    // var storage2 = getStorage(app2)
    // var auth2 = getAuth()    

    // Save a ref to the refs
    firebase.current = {app: app, db: db, storage: storage, auth: auth}
    // firebase2.current = {app: app2, db: db2, storage: storage2, auth: auth2}
    
    onAuthStateChanged(firebase.current.auth, (user) => {
      if (user) {
        // When user is signed in save id and go to calendar
        setUserId(user.uid)
        setPage("calendar")
      } else {
        // User is signed out
        setUserId(null)
        setPage("auth")
      }
    });

  }  
  function firebaseSetup2() {
    // Connect to the app and get refs to the db and storage
    var app = initializeApp({      
      // New DB:
      apiKey: "AIzaSyDSKYWDzFjAMLRFr7tVVA1vpp9mNy_p76Y",
      authDomain: "crm-old.firebaseapp.com",
      databaseURL: "https://crm-old-default-rtdb.firebaseio.com",
      projectId: "crm-old",
      storageBucket: "crm-old.appspot.com",
      messagingSenderId: "361196550608",
      appId: "1:361196550608:web:9c69613406421c4da361d5"
      //
      // Old db:
      // apiKey: "AIzaSyDCrQSCE91lh7GYlr7eTFbX--e1NnvF7Uw",
      // authDomain: "practice-79227.firebaseapp.com",
      // databaseURL: "https://practice-79227-default-rtdb.firebaseio.com",
      // projectId: "practice-79227",
      // storageBucket: "practice-79227.appspot.com",
      // messagingSenderId: "283438782315",
      // appId: "1:283438782315:web:d913f1ed9d87b5401a1e2e"
    })
    var db = getDatabase(app)
    var storage = getStorage(app)
    var auth = getAuth()    

    // var app2 = initializeApp({
    // apiKey: "AIzaSyDSKYWDzFjAMLRFr7tVVA1vpp9mNy_p76Y",
    // authDomain: "crm-old.firebaseapp.com",
    // databaseURL: "https://crm-old-default-rtdb.firebaseio.com",
    // projectId: "crm-old",
    // storageBucket: "crm-old.appspot.com",
    // messagingSenderId: "361196550608",
    // appId: "1:361196550608:web:9c69613406421c4da361d5"
    // })
    // var db2 = getDatabase(app2)
    // var storage2 = getStorage(app2)
    // var auth2 = getAuth()    

    // Save a ref to the refs
    firebase.current = {app: app, db: db, storage: storage, auth: auth}
    // firebase2.current = {app: app2, db: db2, storage: storage2, auth: auth2}
    
    onAuthStateChanged(firebase.current.auth, (user) => {
      if (user) {
        // When user is signed in save id and go to calendar
        setUserId(user.uid)
        console.log("set user ID to user.uid")
        console.log(user.uid)
        setPage("calendar")
      } else {
        // User is signed out
        setUserId(null)
        setPage("auth")
      }
    });

  }  

  const setUpRef = useRef(false)
  function setUpKeyListener(){
    if(setUpRef.current)
      return
    setUpRef.current = true
    window.addEventListener("keydown", (event) => {      

      // Tab + Arrow keys to move around calendar
      if(tabDown.current && event.key === "ArrowRight"){        
        dayOfFocusRef.current = dayOfFocusRef.current.clone().add(1, "day")
        setDayOfFocus(dayOfFocusRef.current)        
      }
      if(tabDown.current && event.key === "ArrowLeft"){        
        dayOfFocusRef.current = dayOfFocusRef.current.clone().subtract(1, "day")
        setDayOfFocus(dayOfFocusRef.current)        
      }
      if(tabDown.current && event.key === "ArrowUp"){        
        dayOfFocusRef.current = dayOfFocusRef.current.clone().subtract(7, "day")
        setDayOfFocus(dayOfFocusRef.current)        
      }
      if(tabDown.current && event.key === "ArrowDown"){        
        dayOfFocusRef.current = dayOfFocusRef.current.clone().add(7, "day")
        setDayOfFocus(dayOfFocusRef.current)        
      } 
      

      if(event.key == "Tab"){        
        //event.preventDefault()
        tabDown.current = true                     
      }         

      if(tabDown.current)
        event.preventDefault()

      if(tabDown.current && event.key == "u")
        closeSidebar()
      if(tabDown.current && event.key == "i")
        openSidebar()
      if(tabDown.current && event.key == "h")
        setPage("calendar")
      if(tabDown.current && event.key == "j")
        setPage("contacts")
      if(tabDown.current && event.key == "k")
        setPage("log")
      if(tabDown.current && event.key == "l")
        setPage("notes")
      if(tabDown.current && event.key == ";")
        setPage("stats")   
      if(tabDown.current && event.key == "'")
        setPage("settings")  
      if(tabDown.current && event.key == "g")
        setPage("scroller")        
      if(tabDown.current && event.key == "m")
        openContact()
      if(tabDown.current && event.key == "n")
        openEvent(null)            
      if(tabDown.current && event.key == ","){  
        // Open the sidebar and focus on the search input to start filtering by search input
        setSidebarOpen(true)
        document.getElementById("searchInput").focus()
      }
      if(tabDown.current && event.key == "."){
        // Clear the search filter and input
        setSearch("")
        document.getElementById("searchInput").value = ""
      }          
      if(tabDown.current && event.key == "y")
        closeAll()
      if(event.key == "Escape"){
        // Close all menus and clear search filter
        closeAll()
        document.getElementById("searchInput").value = "" 
      }            
    })
    window.addEventListener("keyup", (event) => {
        if(event.key == "Tab"){
          //event.preventDefault()
          tabDown.current = false
        }                
    })
  }
  // #endregion

  //\\// ==================== ==================== Data Conversion (New DB Migration) ==================== ==================== \\//\\
  // #region

  // This logs the entire database and saves the json in state to be downloaded
  const [fullJson, setFullJson] = useState({})
  function logDatabase(){
    onValue(ref(firebase.current.db, "/"), snap => {
      console.log("all data:")
      console.log(snap.val())
      setFullJson(snap.val())
    })
  }

  // Load the events array and convert it to a object, then save that object under the userID
  function loadEventsArray(){
    if(firebase.current)
      onValue(dbRef(firebase.current.db, "events"), eventsSnap => {       
        console.log("eventsSnap") 
        console.log(eventsSnap.val()) 
        var tempArray = []        
        eventsSnap.forEach(eventSnap => {
          
          var tempEvent = eventSnap.val()

          tempEvent.name = NumbersToString(tempEvent.name)
          tempEvent.notes = NumbersToString(tempEvent.notes)
          tempEvent.key = eventSnap.key

          tempArray.push(tempEvent)

        })
        setEventsArray(tempArray)

        let eventsObject = {}
        tempArray.forEach(event => {
          if(!eventsObject[event.date])
            eventsObject[event.date] = {}
          eventsObject[event.date][event.key] = event
        })
        
        console.log("eventsObject")
        console.log(eventsObject)
        saveEventsObject(eventsObject)

        console.log(Object.values(eventsObject["2022-01-18"]))
      })
  }
  function saveEventsObject(_eventsObject){    
    set(ref(firebase.current.db, userId+"/events"), _eventsObject)

  }

  // #endregion

  //\\// ==================== ====================    Display    ==================== ==================== \\//\\
  // #region
  
  function DisplayPage(){    
    if(page === "auth")
      return(
        <Auth      
          firebase={firebase}
        ></Auth>
      )
    if(page === "calendar")
      return(
        <Calendar          
          firebase={firebase}          
          getContactData={getContactData}
          eventArray={eventsArray}
          eventsObject={eventsObject}
          // Used to open events. If there is no event creates one
          openEvent={openEvent}

          // Can move the things that use this into app
          NumbersToString={NumbersToString}
          StringToNumbers={StringToNumbers}
          
          // For the contact selector (might move that here)
          contactsArray={contactsArray}

          // idk why this is here and not in Calendar.js
          dayOfFocus={dayOfFocus}
          setDayOfFocus={setDayOfFocus}
          
          // This will be used in the event menu which is maybe moving here 
          updateContactDb={updateContactDb}

        ></Calendar>
      )
    if(page === "contacts")
      return(
        <Contacts
          firebase={firebase}
          contactsArray={filterContacts(contactsArray)}  

          openContact={openContact}    
          updateContactDb={updateContactDb}

          showGrayContacts={showGrayContacts} 
          setShowGrayContacts={setShowGrayContacts} 

          showBlueContacts={showBlueContacts} 
          setShowBlueContacts={setShowBlueContacts} 

          showYellowContacts={showYellowContacts} 
          setShowYellowContacts={setShowYellowContacts}

          showGreenContacts={showGreenContacts} 
          setShowGreenContacts={setShowGreenContacts} 

          showOrangeContacts={showOrangeContacts} 
          setShowOrangeContacts={setShowOrangeContacts} 

          showClearContacts={showClearContacts} 
          setShowClearContacts={setShowClearContacts} 

          showArchived={showArchivedContacts} 
          setShowArchivedContacts={setShowArchivedContacts} 

        ></Contacts>
      )
      if(page === "log")
      return(
        // <Log
        //   firebase={firebase}
        // ></Log>        
        <LogTest firebase={firebase} userId={userId} StringToNumbers={StringToNumbers} NumbersToString={NumbersToString}></LogTest>
      )
    if(page === "notes")
      return(
        <Notes
          firebase={firebase}
          NumbersToString={NumbersToString}
          StringToNumbers={StringToNumbers}
        ></Notes>
      )
    if(page === "gallery")
      return(
        <Gallery
        contactsArray={contactsArray}  
        ></Gallery>
      )
    if(page === "stats")
      return(
        <Stats
          eventsArray={eventsArray}
          getContactData={getContactData}
        ></Stats>
      )
    if(page === "account")
      return(        
        <Account
          firebase={firebase}
        ></Account>
      )
    if(page === "settings")
      return(        
        <Settings
          setYoutubeVideoId={setYoutubeVideoId}
        ></Settings>
      )
    if(page === "scroller")
      return(        
        <Scroller
          contactsArray={contactsArray}
        ></Scroller>
      )

  }

  // Open
  function openSidebar(event){
    setSidebarOpen(true)
    if(event)
      event.stopPropagation()
  }
  function openContact(_contact){    

    var newContact = {
      key: null,
      name: "",
      color: "Gray",
      notes: "",        
      images: [],      
    }

    if(_contact)
      setSelectedContact(_contact)
    else      
      setSelectedContact(newContact)
    
    setDisplayContactMenu(true)
  }
  function openEvent(_event){  
    if(_event)
      setSelectedEvent(_event)
    else
        setSelectedEvent({
        key: null,
        name: "",
        notes: "",
        imageKey: null,
        date: dayOfFocusRef.current.clone().format("YYYY-MM-DD"),
        dateEnd: dayOfFocusRef.current.clone().format("YYYY-MM-DD"),
      })
    setDisplayEventMenu(true)
  }
  const imageDetailIndex = useRef(0)
  function openImageDetail(_imageUrlArray, _index){
    if(!_index)
      imageDetailIndex.current = 0
    else
      imageDetailIndex.current = _index

    setImageDetailArray(_imageUrlArray)
    setDisplayImageDetail(true)
  }

  // Close
  function closeAll(){
    setSidebarOpen(false)
    setDisplayEventMenu(false)
    setDisplayContactMenu(false)
  }
  function closeSidebar(event){        
      setSidebarOpen(false)
      if(event)
          event.stopPropagation()
  }    

  // #endregion

  //\\// ==================== ==================== Load ==================== ==================== \\//\\
  // #region
  function loadContacts(){
    onValue(dbRef(firebase.current.db, "images2"), imagesSnap => {
      var images = []
      imagesSnap.forEach(imageSnap => {

        // Get the name of the image and convert it if necessary
        var imageSnapName = imageSnap.child("name").val()        
        if(imageSnapName)
          if(imageSnapName.includes(","))
            imageSnapName=NumbersToString(imageSnapName)

        // Get the image notes and convert it if necessary
        var imageSnapNotes = imageSnap.child("notes").val()        
        if(imageSnapNotes)
          if(imageSnapNotes.includes(","))
            imageSnapNotes=NumbersToString(imageSnapNotes)
            
        // Put the values in an object and push it in a temp array which will be added to state

        images.unshift({
          name: imageSnapName,
          notes: imageSnapNotes,
          color: imageSnap.child("color").val(),
          url: imageSnap.child("url").val(),
          images: imageSnap.child("images").val(),
          key: imageSnap.key,
          archived: imageSnap.child("archived").val()
        })
      })

      // Add the temp array to state
      setContactsArray(images)            
    })
  }    
  function filterContacts(_contactsArray){

    if(!Array.isArray(_contactsArray))
      return

    // Filter by search
    var tempArray = []
    _contactsArray.forEach(contact => {      
      if( contact.name && typeof contact.name === 'string' && contact.name.toLowerCase().includes(search.toLocaleLowerCase()))
        tempArray.push(contact)
    })

    // Sort into arrays by status
    var grayContacts = []
    var blueContacts = []
    var yellowContacts = []
    var darkGreenContacts = []
    var orangeContacts = []
    var clearContacts = []
    var greenContacts = []
    var otherContacts = []
    var archivedContacts = []
    tempArray.forEach(contact => {
      if(contact.color == "Gray")
        grayContacts.push(contact)
      else if(contact.color == "Blue")
        blueContacts.push(contact)
      else if(contact.color == "Yellow")
        yellowContacts.push(contact)
      else if(contact.color == "Orange")
        orangeContacts.push(contact)
      else if(contact.color == "Green")
        greenContacts.push(contact)      
      else if(contact.color == "Clear")
        clearContacts.push(contact)
      else if(contact.color == "Archived")
        archivedContacts.push(contact)
      else
        otherContacts.push(contact)
    })

    // Put them back in by order and filter
    tempArray = []
    if(showGrayContacts)
      tempArray = [...tempArray, ...grayContacts]
    if(showBlueContacts)
      tempArray = [...tempArray, ...blueContacts]
    if(showYellowContacts)
      tempArray = [...tempArray, ...yellowContacts]
    if(showGreenContacts)
      tempArray = [...tempArray, ...greenContacts]
    if(showOrangeContacts)
      tempArray = [...tempArray, ...orangeContacts]
    if(showClearContacts)
      tempArray = [...tempArray, ...clearContacts]
    if(showArchivedContacts)
      tempArray = [...tempArray, ...archivedContacts]
    tempArray = [...tempArray, ...otherContacts]

    //tempArray = [...grayContacts, ...blueContacts, ...yellowContacts, ...orangeContacts, ...greenContacts, ...clearContacts, ...otherContacts,]    

    return tempArray
  }

  function loadEventsObject(){
    console.log("loadEventsObject")
    onValue(dbRef(firebase.current.db, userId+"/events"), eventsSnap => {      
      setEventsObject(eventsSnap.val())      
    })
  }
  // #endregion
  
  //\\// ==================== ==================== Save / Delete ==================== ==================== \\//\\
  // #region

  function updateContactDb(_contactData){

    // If theres no key its a new contact so create it
    if(!_contactData.key){

      var newRef = push(dbRef(firebase.current.db, "images2"))

      var tempContactData = {
        name: _contactData.name,
        notes: _contactData.notes,      
        color: _contactData.color,
        images:_contactData.images,
        key: newRef.key,
        dateCreated: moment().format("DD-MMMM-YYYY"),
      }

      update(dbRef(firebase.current.db, "images2/"+tempContactData.key), tempContactData)
            
      setSelectedContact(tempContactData)
    }
    // else just upload it
    else{
      var tempContactData = _contactData
      
      if(_contactData.name)
        tempContactData.name = StringToNumbers(_contactData.name)
      if(_contactData.notes)
        tempContactData.notes = StringToNumbers(_contactData.notes)    
  
      update(dbRef(firebase.current.db, "images2/"+_contactData.key), _contactData)
    }
  }
  
  function updateEventDb(_eventData){
    console.log("updateEventDb")
    console.log(_eventData)

    if(!_eventData)
      return

    // If the key is null crate a new event
    if(_eventData.key == null){
      
      // Create a ref for a new event
      var ref = push(dbRef(firebase.current.db, userId+"/events/" + _eventData.date))
      console.log(userId+"/events/")
      console.log(ref)

      // Add the key to the event data
      var tempEventData = _eventData
      tempEventData.key = ref.key

      // tempEventData.name = StringToNumbers(tempEventData.name)
      // tempEventData.notes = StringToNumbers(tempEventData.notes)
      
      // Put it in the db
      set(ref, tempEventData)

    }else{

      var tempEventData = _eventData
      // tempEventData.name = StringToNumbers(tempEventData.name)
      // tempEventData.notes = StringToNumbers(tempEventData.notes)
      
      var ref = dbRef(firebase.current.db, userId+"/events/"+ _eventData.date+"/"+_eventData.key)

      // Put it in the db
      set(ref, tempEventData)

    }
    
  }

  // #endregion
  
  //\\// ==================== ==================== Auth ==================== ==================== \\//\\
  // #region

  // #endregion
  
  //\\// ==================== ==================== Helper Functions ==================== ==================== \\//\\
  // #region

  var word = "theWord24&B"
  function NumbersToString(string){    
    
    // If there is no string just return
    if(!string)
      return ""

    if(typeof(string) !== 'string')
      return

    // Initial values
    var c = 0
    var returnString =""    

    // Make a list of char codes from the string
    var charCodes = string.split(',')

    c=0
    // Convert and place each character
    for(var i = 0; i<charCodes.length; i++){
        returnString += String.fromCharCode(parseInt(charCodes[i])-word.charCodeAt(c++))            
        c = c%word.length
    }                                    
    // Return
    return returnString
  }
  function StringToNumbers(string){      
    // If there is no string just return
    if(!string)
      return ""
    if(typeof(string) !== 'string')
      return

    // Initial values
    var c = 0
    var returnString = ""

    // Go through each one
    for(var i = 0; i<string.length; i++){
         returnString += string.charCodeAt(i)+word.charCodeAt(c++)+","
         c = c%word.length
    }
    returnString = returnString.slice(0, returnString.length-1)        

    // Return the result
    return returnString;
  }

  function getContactData(_key){
    if(_key == "None")
      return {name:""}
        
    var tempContactData = {name:""}
    contactsArray.forEach(contact => {     
      // console.log(contact.key + " =? " + _key) 
      if(contact.key == _key){        
        tempContactData = contact        
      }
    })
    
    return tempContactData
  }
  // #endregion

  return (
    <div className="App" id='mainApp' onClick={closeSidebar}>            
      {/* <div onClick={()=>logDatabase()}>Log DBs</div> */}
      {/* <div onClick={()=>loadEventsArray()}>Transfer Events</div> */}
      {/* <a type="button"
        href={`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(fullJson))}`}
        download={"db.json"}
        >
          download json
      </a> */}
      <div>
        {userId &&  <Sidebar
          setPage={setPage}
          open={sidebarOpen}
          openFunction={openSidebar}
          closeFunction={closeSidebar}
          setSearch={setSearch} 
          setSidebarOpen={setSidebarOpen} 
        ></Sidebar>}
        {DisplayPage()}
        {displayContactMenu && 
          <ContactMenu
            setOpen={setDisplayContactMenu}
            open={displayContactMenu}            
            selectedContact={selectedContact}
            firebase={firebase}
            StringToNumbers={StringToNumbers}
            updateContactDb={updateContactDb}               
            openImageDetail={openImageDetail}
          ></ContactMenu>
        }
        {displayEventMenu &&
          <EventMenu
            selectedEvent={selectedEvent}            
            updateEventDb={updateEventDb}
            setDisplayEventMenu={setDisplayEventMenu}
            getContactData={getContactData}
            firebase={firebase}
            contactsArray={contactsArray}
            updateContactDb={updateContactDb} 
            userId={userId}              
          ></EventMenu>
        }        
        {displayImageDetail &&
          <ImageDetail
            imageArray={imageDetailArray}
            setOpen={setDisplayImageDetail}
            startingIndex={imageDetailIndex.current}
          ></ImageDetail>
        }
        {/* <SpaceComponent></SpaceComponent> */}
      </div>
    </div>
  );
}

export default App;

