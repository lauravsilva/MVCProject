var calendar = require('node-calendar');

var displayCalendar = function(req, res){

  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + 1;

  var cal = new calendar.Calendar(calendar.MONDAY).monthdatescalendar(year,month);

  for (var x = 0; x < cal.length; x++){
    for (var j = 0; j < 7; j++){
      cal[x][j] = moment(cal[x][j]).format("LL");
    }
  }

  console.log("in display cal");

  res.render('display', {csrfToken: req.csrfToken(), calendar: cal});

};



module.exports.displayCalender = displayCalendar;