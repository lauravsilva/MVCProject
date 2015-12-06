var calendar = require('node-calendar');
var moment = require('moment');

var displayCalendar = function(req, res){

    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var formatedDate = moment(date).format("LL");
    var index = 0;
    var thisWeek;

    var cal = new calendar.Calendar(calendar.MONDAY).monthdatescalendar(year,month);

    for (var x = 0; x < cal.length; x++){
        for (var j = 0; j < 7; j++){
            cal[x][j] = moment(cal[x][j]).format("LL");
            if(formatedDate == moment(cal[x][j]).format("LL")){
                index = x;
            }
        }
    }

    thisWeek = cal[index];
    
    res.render('display', {csrfToken: req.csrfToken(), calendar: thisWeek });
};

module.exports.displayCalendar = displayCalendar;
