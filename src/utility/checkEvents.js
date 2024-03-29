const rrule = require('rrule');
const { DateTime } = require('luxon');
const events = require('../../editables/event.json')

let eventsDateMap = updateEvents();

module.exports = {
    getEventSchedule: function(){
        return eventsDateMap;
    },
    updateSchedule: function(){
        eventsDateMap = updateEvents();
    }
};

function updateEvents(){
    let eventsDateMap = {};
    const today = DateTime.now().startOf("day");
    const tomorrow = DateTime.now().plus({days: 1}).startOf("day");
	console.log('================================================ '+today.toFormat('yyyy-LL-dd')+' ======================================================');
    const weekdays = ['一','二','三','四','五','六','日'];

    let nearestEvent = null;
    let nearestDate = null;

	events.forEach((event)=>{
        //fix rule, get time
        const fixedRule = 'DTSTART;TZID=Asia/Hong_Kong:'+today.toFormat('yyyyLLdd')+'T'+today.toFormat('HHmm00')+'\nRRULE:'+event.rrule;
        const eventRule = rrule.rrulestr(fixedRule);
        let eventDate = eventRule.after(today.toJSDate(),true);
        eventDate = DateTime.fromJSDate(eventDate).set({hours: 21, minutes: 0});

        console.log(event.title+"\r\n"+eventDate.toFormat('yyyy-LL-dd')+" 星期"+weekdays[eventDate.weekday-1]+"\r\n");

        //push into map
        eventsDateMap[event.id] = {
            title: event.title,
            id: event.id,
            date: eventDate,
            emote: event.emote,
            imageurl: event.imageurl
        }

        //search for nearest
        if(!nearestEvent || (nearestDate > eventDate)){
            nearestEvent = event.id;
            nearestDate = eventDate;
        }
        
    
        //search for today and tmr
    if(today.ordinal === eventDate.ordinal){
        Object.defineProperty(eventsDateMap, 'today',{
            get: function(){
                return eventsDateMap[event.id];
            }
        })
     }
    if(tomorrow.ordinal === eventDate.ordinal){
        Object.defineProperty(eventsDateMap, 'tomorrow',{
            get: function(){
                return eventsDateMap[event.id];
            }
        })
     }
	})

    Object.defineProperty(eventsDateMap, 'nearest',{
        get: function(){
            return eventsDateMap[nearestEvent];
        }
    })
    
	console.log('==================================================================================================================');
    return eventsDateMap;
}