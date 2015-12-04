var calendar = require('node-calendar');
//var cal = new calendar.Calendar(calendar.SUNDAY);
//var yearCalendar = cal.yeardayscalendar(2015);
//console.log(calendar.day_name);



var cal = new calendar.Calendar().itermonthdates(2015, 12);
//console.log(cal);

console.log(new calendar.Calendar().monthdatescalendar(2015,12)[0]);


//module.exports