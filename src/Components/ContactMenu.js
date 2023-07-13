import { connectStorageEmulator, ref } from 'firebase/storage'
import React, { useEffect, useRef, useState } from 'react'
import "../Styles/Menus.css"
import {update, set, ref as dbRef, remove} from 'firebase/database'
import  {uploadBytes, ref as sRef ,getDownloadURL} from 'firebase/storage'
import userEvent from '@testing-library/user-event'
import ImageArrayViewer from './ImageArrayViewer'
import ImageArrayEdit from './ImageArrayEdit'

function ContactMenu(props) {    


  //\\// ==================== ==================== Vars and Init ==================== ==================== \\//\\
  // #region
  
  // This is the array of images that is displayed in the image display, loaded initially in useEffect
  const [imageArray, setImageArray] = useState([])
  // this is a list of image links as they are loaded from or into the db. All added to db when menu closes (unlesss reset is pressed)
  const dbImages = useRef([])

  // Opens the image edit menu which can reorder or delete images
  const [displayImageEdit, setDisplayImageEdit] = useState(false) 

  // This flag is set so closeMenu knows if a db update is needed
  const update = useRef(false)
  // For keyboard shortcuts
  const tabDown = useRef(false)

  useEffect(()=>{

    // If there is an image array put it in state and ref
    if(props.selectedContact && Array.isArray(props.selectedContact.images)){
      setImageArray(props.selectedContact.images)
      dbImages.current = props.selectedContact.images      
    }      

    // Set initial focus on the name input so user can start typing without having to use mouse
    document.getElementById("nameInput").focus()

    setupKeyListener()

  },[])

  function setupKeyListener(){
    document.getElementById("contactMenu").addEventListener("keydown", (event)=>{      
      if(event.key == "Tab"){
        tabFocus()
        tabDown.current = true
      }      

      // Tab + o is keyboard shortcut for save and close
      if(tabDown.current && event.key == "o")
        closeMenu()

    }) 
    document.getElementById("contactMenu").addEventListener("keyup", (event)=>{      
      if(event.key == "Tab"){        
        tabDown.current = false
      }      
    })  
  }

  // #endregion

  //\\// ==================== ==================== Display ==================== ==================== \\//\\
  // #region

  // Flag var so this is only called once per tab press
  const justTabbed = useRef(false)
  // when tab is pressed (window.addEventListener("keydown", ()=>{})) index goes up and doc.getelement(idAdIndex).focus() so the window focuses on that one
  const tabIndexRef = useRef(1)
  function tabFocus(){    
    
    if(!justTabbed.current){
            
      if(tabIndexRef.current == 0)
        document.getElementById("nameInput").focus()

      if(tabIndexRef.current == 1)
        document.getElementById("notesInput").focus()
      
      if(tabIndexRef.current == 2)
        document.getElementById("statusInput").focus()
        
      tabIndexRef.current = tabIndexRef.current + 1
      
      if(tabIndexRef.current == 3)
        tabIndexRef.current = 0
    }    

    // Flag var so this is only called once per tab press
    justTabbed.current = true
    setTimeout(() => justTabbed.current = false, 100);

  }

  // #endregion

  //\\// ==================== ==================== DB ==================== ==================== \\//\\
  // #region
  
  // If a change is made the db needs to be updated when the menu is closed
  function needsUpdate(){
    update.current = true
  }

  // Updates the db and closes the menu
  function closeMenu(){

    // Save the input data into db
    if(update.current)
      updateContactDb()
    
    // Close the menu
    props.setOpen(false)
  }

  function updateContactDb(){

    // Gather the info
    var name = document.getElementById("nameInput").value
    var notes = document.getElementById("notesInput").value
    var color = document.getElementById("statusInput").value

    // Put it in the db 
    props.updateContactDb({
      name: name,
      notes: notes,
      color: color,
      images: dbImages.current,
      // If its a new contact props.selectedContact.key == null so it will push a new one and set props.selectedContact to reflect
      key: props.selectedContact.key,      
    })
  }

  // Reverts the contact to the way it was before any changes were made *!*! needs to be updated
  function revert(){     
    
    // Set the values to what they were before
    document.getElementById("nameInput").value = props.selectedContact.name
    document.getElementById("notesInput").value = props.selectedContact.notes
    document.getElementById("statusInput").value = props.selectedContact.color
    
    // reset the image array
    if(props.selectedContact && Array.isArray(props.selectedContact.images))
      setImageArray(props.selectedContact.images)

    // and the list of images to be added
    dbImages.current = props.selectedContact.images

    // should also delete the ones added from the db so there aren't unused images there
    //deleteImages() but only the new ones

  }  
  
  // Deletes the contact in the db and closes the menu
  function deleteContact(){    

    remove(dbRef(props.firebase.current.db, "images2/"+props.selectedContact.key))    
        
    deleteImages(dbImages.current)    
    
    props.setOpen(false)
    
  }

  // #endregion

  //\\// ==================== ==================== Images ==================== ==================== \\//\\
  // #region

  // Db upload 
  function addImage(file){
     // Display it immediately
    setImageArray([URL.createObjectURL(file), ...imageArray])
    
    //Upload to db (adding a random number at the end so it doesn't over write)
    uploadBytes(sRef(props.firebase.current.storage, "images2/"+props.selectedContact.key + (Math.random())*1000), file).then(imageUpload => {
      getDownloadURL(imageUpload.ref).then(imageUrl => {
        // Keep track of the current image urls so multiple can be uploaded and correct array will be put in the db (state will not be accurate here)
        dbImages.current = [imageUrl, ...dbImages.current ]
        set(dbRef(props.firebase.current.db, "images2/"+props.selectedContact.key+"/images"), dbImages.current)        

      })
    })
  }

  function updateImageOrder(_imageUrlArray){
    setImageArray(_imageUrlArray)
    dbImages.current = _imageUrlArray
    update.current = true
  }

  // Image sources
  function newImageSelected(event){    
    var file = event.target.files[0]    
    addImage(file)    
  }
  function imageDragOver(event){
    event.preventDefault()
  }
  function imageDrop(event){
    event.preventDefault()
    var file = event.dataTransfer.files[0]
    addImage(file)
  }

  function deleteImages(_imageUrlArray){
    
    _imageUrlArray.forEach( imageUrl => {
      deleteImage(imageUrl)
    })

  }
  function deleteImage(_imageUrl){
    console.log("lingering image with url: "+_imageUrl)
  }

  // #endregion

  return (
    <div className='box2 menuBox blueGlow' id="contactMenu">
      
        <div className='closeButton' onClick={()=>closeMenu()}>x</div>
        <div className='leftDiv'> 
          <div className='imageDisplayContainer' onDragOver={(e)=>imageDragOver(e)} onDrop={(e)=>imageDrop(e)}>
            <ImageArrayViewer
              imageArray={imageArray.length > 0 ? imageArray : ["https://firebasestorage.googleapis.com/v0/b/practice-79227.appspot.com/o/images2%2F-MteKD1lOtpuKqb8Dx_J?alt=media&token=bdaa5943-b7d1-4b59-a76b-b94861ed5f9e"]}
              onClick={props.openImageDetail}
            ></ImageArrayViewer>
          </div>                  
          <div className='hoverBox imageButton left' onClick={()=>setDisplayImageEdit(true)}>Edit</div>
          <label className='hoverBox imageButton right' htmlFor="imageInput">+</label>
          <input type="file" id="imageInput" style={{display:"none"}} onChange={(event)=>newImageSelected(event)}></input>
        </div>
        <div className='contactImageInfo'>                
          <input id='nameInput' placeholder='Name' defaultValue={props.selectedContact ? props.selectedContact.name : ""} onChange={needsUpdate} autoComplete="off"></input>
          <select id='statusInput' placeholder='status' defaultValue={props.selectedContact ? props.selectedContact.color : ""} onChange={needsUpdate}>
            <option>Blue</option>
            <option>Yellow</option>
            <option>Green</option>
            <option>Gray</option>
            <option>Clear</option>
            <option>Orange</option>       
            <option>Archived</option>                
          </select>                                                                                             
          <textarea id='notesInput' placeholder='Notes' defaultValue={props.selectedContact ? props.selectedContact.notes : ""} onChange={needsUpdate}></textarea>
          <div className='box hoverBox button' onClick={deleteContact}>Delete</div>
          <div className='box hoverBox button' onClick={revert}>Revert</div>                                
        </div>
        <>
          {displayImageEdit &&
              <ImageArrayEdit
                imageArray={imageArray}
                setDisplay={setDisplayImageEdit}
                saveArray={updateImageOrder}
                firebase={props.firebase}
                openImageDetail={props.openImageDetail}
              ></ImageArrayEdit>            
          }
      </>
    </div>            
  )
}
ContactMenu.defaultProps = {
    open: false,
    setOpen: (param) => {console.log("no function: setting open to " + param)}
}
export default ContactMenu

  // next steps
  // when image is added upload to the image array and display
  //   file select and drag over
  // the new one is index 0
  // can look through those images with arrow keys
  // images are uploaded when menu closes
  //   also with save button
  // those images are loaded and viewable when contact is clicked again