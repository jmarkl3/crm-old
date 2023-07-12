import React, { useEffect, useState } from 'react'
import moment from 'moment'
import "../Styles/Stats.css"

function Stats(props) {

  const [statsObject2, setStatsObject2] = useState({      
    // All d: gray, green, dark green, yellow, lightBlue
    totalD: 0,
    // All C: first: gray, green, dark green, yellow, lightBlue 
    totalC: 0,
    // got results: gray, green, dark green
    completeC: 0,
    // waiting on results on cycle: yellow
    openC: 0,
    // waiting on meeting: blue
    scheduled: 0,
    // got result on cycle: green
    greenC: 0,
    // got result on cycle: gray
    grayC: 0,
    // got result on cycle: darkGreen
    darkGreenC: 0,
    // event: lightBlue
    lightBlue: 0,
    // Got initial result of green: green, darkGreen
    positiveRate: 0,
    // Result is currently green
    currentPositiveRate: 0,
    sixMData: {
      totalD: 0,
      totalC: 0,
      completeC: 0,
      openC: 0,
      scheduledC: 0,
      greenC: 0, 
      grayC:  0,
      darkGreenC: 0,          
      lightBlue: 0,          
      avgPerMonth: 0,
      avgPerMonthTTl: 0,
      positiveRate: 0,          
      currentPositiveRate: 0,  
    },
    // list of objects that keep track of each month
    months: {},
    // idk why there is an array also, maybe for a map      
    monthsArray: [],
    // keeps track of the number of contacts cycled
    contactKeys: {},
    // an array of numbers representing the number of cycles it took to get the green
    cyclesTilG: {},
    cyclesTilArray: {},
  })

  useEffect(()=>{
    buildStatObject()
  },[])

  function buildStatObject(){
    
    // This object will hold the stats data
    var tempStatsObject2 = {
      // All d: gray, green, dark green, yellow, lightBlue
      totalD: 0,
      // All C: first: gray, green, dark green, yellow, lightBlue 
      totalC: 0,
      // got results: gray, green, dark green
      completeC: 0,
      // waiting on results on cycle: yellow
      openC: 0,
      // waiting on meeting: blue
      scheduledC: 0,
      // got result on cycle: green
      greenC: 0,
      // got result on cycle: gray
      grayC: 0,
      // got result on cycle: darkGreen
      darkGreenC: 0,
      // event: lightBlue
      lightBlue: 0,
      // Got initial result of green: green, darkGreen
      positiveRate: 0,
      // Result is currently green
      currentPositiveRate: 0,
      sixMData: {
        totalD: 0,
        totalC: 0,
        completeC: 0,
        openC: 0,
        scheduledC: 0,
        greenC: 0, 
        grayC:  0,
        darkGreenC: 0,          
        lightBlue: 0,          
        avgPerMonth: 0,
        avgPerMonthTTl: 0,
        positiveRate: 0,          
        currentPositiveRate: 0,  
      },
      // list of objects that keep track of each month
      months: {},
      // idk why there is an array also, maybe for a map      
      monthsArray: [],
      // keeps track of the number of contacts cycled
      contactKeys: {},
      greenContactKeys: {},
      cyclesTilG: {},
      cyclesTilArray: {},
    }

    // Creating a more usable array O(n) (around 400). Filters out events that do not factor in, puts date object instead of string
    var tempEventsArray = []
    props.eventsArray.forEach( event => {
      var tempEvent = {        
        date: moment(event.date, "YYYY-MM-DD").clone(),
        color: event.color,
        imageKey: event.imageKey,
        key: event.key,
        name: event.name,
      }
      // Not adding the clear or orange events becasue they do not factor in with these statistics
      if(tempEvent.color !== "eventClear" && tempEvent.color !== "eventOrange" && tempEvent.color !== "eventPurple")
        tempEventsArray.push(tempEvent)
    })    
    
    // Add event data to object
    tempEventsArray.forEach(event => {

      // Get the month of this event and add it to the data object
      var month = event.date.format("YYYY MMMM")   
      // If the event is something that should be put in a month object
      if(  event.color === "eventGray" 
        || event.color === "eventLightGreen" 
        || event.color === "eventGreen" 
        || event.color === "eventDarkGreen"
        || event.color === "eventYellow"         
        || event.color === "eventLightBlue"         
      )
        // If the month is not already in the data object add it
        if(tempStatsObject2.months[month] === undefined){
          tempStatsObject2.months[month] = {
            name: month,                    
            totalD: 0,
            totalC: 0,
            completeC: 0,
            openC: 0,
            yellowCArray: [],
            scheduledC: 0,
            blueCArray: [],
            greenC: 0, 
            greenCArray: [],
            grayC:  0,
            grayCArray: [],
            darkGreenC: 0,          
            lightBlue: 0,          
            positiveRate: 0,          
            currentPositiveRate: 0,
            // Save the moment object for sorting later
            momentDate: event.date,
          }   
        }

      // Determine if it is the first event in the cycle
      var isFirst = true
      // Look through all the other events to see if there is one with the same contact within 2 weeks
      for(var index in tempEventsArray){
        // If the second event is not the same one as the focus event
        if(tempEventsArray[index].key != event.key)
          // If the image key is the same
          if(tempEventsArray[index].imageKey == event.imageKey){
            // Look to see if the second event is within 14 days before
            var earlierDaysBefore = event.date.diff(tempEventsArray[index].date, "days")
            // If it is than the event of focus is not the first one for the given cycle
            if(earlierDaysBefore > 0 && earlierDaysBefore < 14)
              isFirst = false
          }            
      }        

      // These are the event types that count as a d
      if(  event.color === "eventGray" 
        || event.color === "eventLightGreen" 
        || event.color === "eventGreen" 
        || event.color === "eventDarkGreen"
        || event.color === "eventYellow" 
        || event.color === "lightBlue" 
      ){
        tempStatsObject2.months[month].totalD++
        tempStatsObject2.totalD++
      }


      // Each light blue counts as 1 light blue
      if(event.color == "eventLightBlue"){
        tempStatsObject2.months[month].lightBlue++
        tempStatsObject2.lightBlue++
      }

      // If it is first add it to the tally of c depending on type
      if(isFirst){     
        
        // Keep track of number of contacts met and how many c each contact was met                
        if(tempStatsObject2.contactKeys[event.imageKey])
          tempStatsObject2.contactKeys[event.imageKey]++
        else
          tempStatsObject2.contactKeys[event.imageKey] = 1  

        // These are the event types that count as c
        if(  event.color === "eventGray" 
          || event.color === "eventLightGreen" 
          || event.color === "eventGreen" 
          || event.color === "eventDarkGreen"
          || event.color === "eventYellow" 
        ){
          tempStatsObject2.months[month].totalC++
          tempStatsObject2.totalC++
        }

        // These are the event types that count as c
        if(  event.color === "eventGray" 
          || event.color === "eventLightGreen" 
          || event.color === "eventGreen" 
          || event.color === "eventDarkGreen"          
        ){
          tempStatsObject2.months[month].completeC++
          tempStatsObject2.completeC++
        }
          
        // These are the event types that count as waiting on c
        if(  event.color === "eventYellow" ){
          tempStatsObject2.months[month].openC++
          tempStatsObject2.openC++
          // Add event to an array that can be displayed on the bars
          tempStatsObject2.months[month].yellowCArray?.push(event)

        }

        // These are the event types that count as scheduled c
        if(  event.color === "eventBlue" ){

          tempStatsObject2.scheduledC++
        
          // Add event to an array that can be displayed on the bars
          tempStatsObject2.months[month]?.blueCArray?.push(event)

        }

        // For green events
        if(event.color == "eventLightGreen" || event.color == "eventGreen"){

          // Add to the overall and month tally 
          tempStatsObject2.months[month].greenC++
          tempStatsObject2.greenC++

          // Add to list of the contact keys with green cycles
          tempStatsObject2.greenContactKeys[event.imageKey] = true     

          // Add event to an array that can be displayed on the bars
          tempStatsObject2.months[month]?.greenCArray?.push(event)
          
          // Get the number of cycles before, add 1, push onto array          
          // only add if there is none before (so maybe use an object)          
          
          // but what if the green event comes first in the list? Theyre not sorted by date so this number could be inaccurate.

          // If the contact is not yet in the list add with the initial number of times it took
          if(!tempStatsObject2.cyclesTilG[event.imageKey]){

            tempStatsObject2.cyclesTilG[event.imageKey] = tempStatsObject2.contactKeys[event.imageKey]
            var contactData = props.getContactData(event.imageKey)
            //console.log(contactData.name+" after "+tempStatsObject2.contactKeys[event.imageKey]+" trys")
            // console.log()
          }
          // Else add them with (times it took this time) - (time it took before)
          else
            // Making the imageKey unique so it adds it twice
            tempStatsObject2.cyclesTilG[event.imageKey +""+ tempStatsObject2.contactKeys[event.imageKey]] = tempStatsObject2.contactKeys[event.imageKey] - tempStatsObject2.cyclesTilG[event.imageKey]


        }

        if(event.color == "eventGray"){
          tempStatsObject2.months[month].grayC++
          tempStatsObject2.grayC++
          // Add event to an array that can be displayed on the bars
          tempStatsObject2.months[month]?.grayCArray?.push(event)
        }
                    
        if(event.color == "eventDarkGreen"){
          tempStatsObject2.months[month].darkGreenC++
          tempStatsObject2.darkGreenC++

          if(!tempStatsObject2.cyclesTilG[event.imageKey])
            tempStatsObject2.cyclesTilG[event.imageKey] = tempStatsObject2.contactKeys[event.imageKey]
          // Else add them with (times it took this time) - (time it took before)
          else
            // Making the imageKey unique so it adds it twice
            tempStatsObject2.cyclesTilG[event.imageKey +""+ tempStatsObject2.contactKeys[event.imageKey]] = tempStatsObject2.contactKeys[event.imageKey] - tempStatsObject2.cyclesTilG[event.imageKey]

        }                        

      }       

    })                 

    // Turn the months object into an array for sorting and mapping and put it in the stats object
    var tempMonthsArray = []
    for(var index in  tempStatsObject2.months){
      tempMonthsArray.push(tempStatsObject2.months[index])
    }
    tempMonthsArray = sortMonthsArray(tempMonthsArray)
    tempStatsObject2.monthsArray = tempMonthsArray

    // Calculate the rates
    tempStatsObject2.currentPositiveRate = tempStatsObject2.greenC / tempStatsObject2.completeC
    tempStatsObject2.positiveRate = (tempStatsObject2.greenC + tempStatsObject2.darkGreenC) / tempStatsObject2.completeC
    
    // Calculate the last 6 months (not including most recent one)
    var monthArrayLength = tempStatsObject2.monthsArray.length
    var c = 0
    var last6Months = []
    tempStatsObject2.monthsArray.forEach(month => {
      if(c >= monthArrayLength-7 && c!= monthArrayLength-1){
        console.log(month.name)
        last6Months.push(month)
      }
      c++
    })

    var sixMData = {
      totalD: 0,
      totalC: 0,
      completeC: 0,
      openC: 0,
      scheduledC: 0,
      greenC: 0, 
      grayC:  0,
      darkGreenC: 0,          
      lightBlue: 0,          
      avgPerMonth: 0,
      avgPerMonthTTl: 0,
      positiveRate: 0,          
      currentPositiveRate: 0,      
    }
    last6Months.forEach(month => {
      sixMData.totalD += month.totalD
      sixMData.totalC += month.totalC
      sixMData.completeC += month.completeC
      sixMData.openC += month.openC
      sixMData.scheduledC += month.scheduledC
      sixMData.greenC += month.greenC
      sixMData.grayC += month.grayC
      sixMData.darkGreenC += month.darkGreenC
      sixMData.lightBlue += month.lightBlue
      sixMData.positiveRate += month.positiveRate
      sixMData.currentPositiveRate += month.currentPositiveRate
    })
    sixMData.currentPositiveRate = (sixMData.greenC / sixMData.completeC)
    sixMData.positiveRate = (sixMData.greenC + sixMData.darkGreenC) / sixMData.completeC
    sixMData.avgPerMonth = sixMData.greenC / 6
    sixMData.avgPerMonthTTl = (sixMData.greenC + sixMData.darkGreenC) / 6

    tempStatsObject2.sixMData = sixMData

    // Put in object in state
    setStatsObject2(tempStatsObject2)
        
    console.log(tempStatsObject2)

    // A cool reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object

    // Create an array with the data for each month
    
  }

  // Sorts and filters an array of month data and return the sorted array
  function sortMonthsArray(_monthsArray){        

    // Place each month in the temp array based on its momentDate
    var tempArray = []
    _monthsArray.forEach( month => {

      // Don't worry about stray events with no data
      if(month.grayC == 0 && month.greenC == 0 && month.lightBlue == 0)
        return

      // Get the index of the first month thats before this one
      var c = 0   
      tempArray.forEach( placedMonth => {            
        if(placedMonth.momentDate.isAfter(month.momentDate))
          return                  
        c++
      })

      // Insert the month into the array at the found index
      tempArray.splice(c, 0, month)
      
    })

    // Return the sorted and filtered array
    return tempArray
  }

  return (
    <div className='box statsBox'>
        <div>
          <div className='statNumber'>Completed</div>
          <div className='barGreen statNumber'>{statsObject2.greenC} Green</div>
          <div className='barGray statNumber'>{statsObject2.grayC} Gray</div> 
          <div className='statNumber'> {statsObject2.completeC} Ttl</div>            
        </div>
        <div>
          <div className='statNumber'>Open</div>
          <div className='statNumber barBlue'> {statsObject2.scheduledC + " scheduled"}</div>   
          <div className='statNumber barYellow'> {statsObject2.openC + " open"}</div>      
          <div className='statNumber'> {(statsObject2.openC * statsObject2.positiveRate).toFixed(0) + " projected"}</div>             
        </div>
        <div>
          <div className='statNumber'>Green</div>
          <div className='barGreen statNumber'>{statsObject2.greenC} Ttl</div>
          <div className='statNumber barGreen'> {Array.isArray(statsObject2.monthsArray) && (statsObject2.greenC / statsObject2.monthsArray.length).toFixed(2) + " / month"}</div>    
          <div className='statNumber barGreen'> {Array.isArray(statsObject2.monthsArray) && (statsObject2.greenC / (statsObject2.monthsArray.length / 12)).toFixed(2) + " / year"}</div>              
        </div>
        <div>
          <div className='statNumber'>Gray</div>
          <div className='barGray statNumber'>{statsObject2.grayC} Ttl</div>
          <div className='statNumber barGray'> {Array.isArray(statsObject2.monthsArray) && (statsObject2.grayC / statsObject2.monthsArray.length).toFixed(2) + " / month"}</div>    
          <div className='statNumber barGray'> {Array.isArray(statsObject2.monthsArray) && (statsObject2.grayC / (statsObject2.monthsArray.length / 12)).toFixed(2) + " / year"}</div>              
        </div>
        <div>
          <div className='statNumber'>Cryo</div>          
          <div className='barLightBlue statNumber'>Light Blue: {statsObject2.lightBlue}</div>
          <div className='statNumber barLightBlue'> {Array.isArray(statsObject2.monthsArray) && (statsObject2.lightBlue / statsObject2.monthsArray.length).toFixed(2) + " / month"}</div>    
          <div className='statNumber barLightBlue'> {Array.isArray(statsObject2.monthsArray) && (statsObject2.lightBlue / (statsObject2.monthsArray.length  / 12)).toFixed(2) + " / year"}</div>    
        </div>        
        <div>
          <div className='statNumber'>Rates</div>          
          <div className='statNumber'> {typeof statsObject2.positiveRate == "number" && statsObject2.currentPositiveRate.toFixed(2)+"% final "}</div>      
          <div className='statNumber'> {typeof statsObject2.currentPositiveRate == "number" && statsObject2.positiveRate.toFixed(2) + "% positive "}</div>      
          <div className='statNumber'> {statsObject2.completeC +" cycles"}</div>  
        </div>                  
        <div>
          <div className='statNumber'>Totals</div>          
          <div className='statNumber'> {Array.isArray(statsObject2.monthsArray) && statsObject2.monthsArray.length + " months "}</div>  
          <div className='statNumber'> {statsObject2.contactKeys && Object.keys(statsObject2.contactKeys).length + " contacts "}</div>      
          <div className='statNumber'> {statsObject2.totalD + " donations "}</div>      
        </div>
        <div>
          <div className='statNumber'>+</div>          
          <div className='statNumber'>Last 6 Months</div>
          <div className='statNumber'>+</div>          
        </div>
        <div>          
          <div className='statNumber'> {statsObject2.sixMData.totalC} Ttl</div>            
          <div className='barGreen statNumber'>{statsObject2.sixMData.greenC} Green</div>
          <div className='barDarkGreen statNumber'>{statsObject2.sixMData.darkGreenC} dg</div> 
          <div className='barGray statNumber'>{statsObject2.sixMData.grayC} Gray</div> 
        </div>            
        <div>          
          <div className=' statNumber'>{statsObject2.sixMData.currentPositiveRate.toFixed(2)}% current</div>
          <div className=' statNumber'>{statsObject2.sixMData.positiveRate.toFixed(2)}% ttl</div>
          <div className=' statNumber'>{statsObject2.sixMData.avgPerMonth.toFixed(1)} / month</div>
          <div className=' statNumber'>{(statsObject2.sixMData.avgPerMonth * 12).toFixed(1)} /y (proj)</div>
        </div>  
        
        <div>
          <div>
            {statsObject2.monthsArray.map( month => (
              <div className='monthStatBox'>                             
                <div className='container'>
                  <div className='columnContainer'>
                    <div>{month.greenC < 2 && month.greenC}</div>
                    <div className='column barGreen' style={{height: (month.greenC * 20)+"px"}}>{month.greenC >= 2 && month.greenC}
                      <div className="barHover">
                        {month.greenCArray.map(event => (
                          <div>{props.getContactData(event?.imageKey)?.name}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className='columnContainer'>
                    <div>{month.lightBlue < 2 && month.lightBlue}</div>
                    <div className='column barLightBlue' style={{height: (month.lightBlue * 20)+"px"}}>{month.lightBlue >= 2 && month.lightBlue}</div>
                  </div>
                  <div className='columnContainer'>
                    <div>{month.darkGreenC < 2 && month.darkGreenC}</div>
                    <div className='column barDarkGreen' style={{height: (month.darkGreenC * 20)+"px"}}>{month.darkGreen >= 2 && month.darkGreen}</div>
                  </div>
                  <div className='columnContainer'>
                    {month.grayC < 2 && month.grayC}                    
                    <div className='column barYellow' style={{height: (month.openC * 20)+"px"}}>{month.openC >= 2 && month.openC}
                      <div className="barHover">
                        {month.yellowCArray.map(event => (
                          <div>{props.getContactData(event?.imageKey)?.name}</div>
                        ))}
                      </div>
                    </div>
                    <div className='column barGray' style={{height: (month.grayC * 20)+"px"}}>{month.grayC > 2 && month.grayC}
                      <div className="barHover">
                        {month.grayCArray.map(event => (
                          <div>{props.getContactData(event?.imageKey)?.name}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {month.name}
              </div>
              
            ))}
          </div>
        </div>    
    </div>
  ) 
}

export default Stats