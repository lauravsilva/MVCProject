var calendar = require('node-calendar');

var displayCalendar = function(req, res){

    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;

    var cal = new calendar.Calendar(calendar.MONDAY).monthdatescalendar(year,month);

    cal = moment(cal).format("LL");


    res.render('display', {csrfToken: req.csrfToken(), calendar: cal});

};



module.exports.displayCalender = displayCalendar;