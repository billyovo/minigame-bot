const rrule = require('rrule');
var { DateTime } = require('luxon');
const events = require('../editables/event.json')

var eventsDateMap = {};

module.exports = {
    getEventSchedule: function(){
        return eventsDateMap;
    },
    updateSchedule: updateEvents
};

function updateEvents(){
    eventsDateMap = {};
    const today = DateTime.now().startOf("day");
    const tomorrow = DateTime.now().plus({days: 1}).startOf("day");
	console.log('================================================ '+today.toFormat('yyyy-LL-dd')+' ======================================================');
    const weekdays = ['一','二','三','四','五','六','日'];

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
            date: eventDate,
            emote: event.emote
        }

        //search for nearest
        if(!Object.prototype.hasOwnProperty.call(eventsDateMap, "nearest")){
            eventsDateMap["nearest"] = event.id;
        }
        else{
            if(eventsDateMap[eventsDateMap.nearest].date> eventsDateMap[event.id].date){
                eventsDateMap["nearest"] = event.id;
            }
        }
    
        //search for today and tmr
    if(today.ordinal === eventDate.ordinal){
        eventsDateMap["today"] = event.id;
     }
    if(tomorrow.ordinal === eventDate.ordinal){
        eventsDateMap["tomorrow"] = event.id;
     }
	})
	console.log('==================================================================================================================');
}