import React, { useRef, useEffect } from 'react'

function LogItem(props) {

    const saveTimout = useRef(null)

    
    useEffect(()=>{
        
        console.log("props: ")
        console.log(props)
    },[])

    function keyPress(){
        // Clear the save timer
        clearTimeout(saveTimout.current)        
        // Set another timer (if no more keys are pressed in the next 1/2 second it will auto-save)
        saveTimout.current = setTimeout(() => {
            props.saveLogItem({
                title: document.getElementById("logTitle"+props.logData.key).value,
                content: document.getElementById("logContent"+props.logData.key).value,
                date: document.getElementById("logDate"+props.logData.key).value,
                key: props.logData.key,
            })
        }, 1000);
    }

  return (
    <div className='logItem' key={'logItem'+((props.logData.key == null) ? Math.random() : props.logData.key)}>
        <div className='closeButton' title="Delete Entry" onClick={() => props.deleteLogItem(props.logData)}>x</div>        
        <input id={'logDate' + props.logData.key} type={"date"} defaultValue={props.logData.date} onChange={keyPress}></input>
        <input id={'logTitle' + props.logData.key} placeholder='title' defaultValue={props.logData.title} onChange={keyPress}></input>
        <textarea id={'logContent' + props.logData.key} placeholder='Day events: ' defaultValue={props.data.content} onChange={keyPress}></textarea>    
    </div>
  )
}

LogItem.defaultProps = {
    logData:{
        title: null,
        content: null,
        date: null,
    },
    deleteLogItem: () => {console.log("no item to delte")}
}

export default LogItem