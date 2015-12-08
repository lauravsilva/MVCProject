var _ = require('underscore');
var models = require('../models');
var url = require('url');
var moment = require('moment');
var calendar = require('node-calendar');

moment.locale('en', {
    calendar : {
        lastDay : 'L',
        sameDay : 'L',
        nextDay : 'L',
        lastWeek : 'L',
        nextWeek : 'L',
        sameElse : 'L'
    }
});

var Task = models.Task;

var makerPage = function(req, res){

    Task.TaskModel.findByOwner(req.session.account._id, function(err, docs) {
        if (err) {
            console.log(err);
            return res.status(400).json({error: "An error occurred"});
        }

        res.render('app', {csrfToken: req.csrfToken()});
    });
};

var displayPage = function(req, res){

    Task.TaskModel.findByOwner(req.session.account._id, function(err, docs) {

        var date, year, month, thisWeek;
        var index = 0;

        // If no parameters, use today's date
        if (!req.params.dateParam){
            date = new Date();
            var formatedDate = moment(date).format("L");
            req.params.dateParam = formatedDate.replace("/", '').replace("/", '');
        }

        if (err) {
            console.log(err);
            return res.status(400).json({error: "An error occurred"});
        }

        for(var i = 0; i < docs.length; i++){
            docs[i] = docs[i].toAPI();
        }


        //Format parameter date back to "LL"
        var parameterDate = req.params.dateParam.substring(0,2) + "/" + req.params.dateParam.substring(2,4) + "/" + req.params.dateParam.substring(4,8);
        parameterDate = moment(parameterDate).format("LL");

        // Calendar
        year = req.params.dateParam.substring(4,8);
        month = req.params.dateParam.substring(0,2);

        var newMonthAdd = month;
        var newMonthSub = month;
        var newYearAdd = year;
        var newYearSub = year;

        // Get calendar for current, previous and next month
        var cal = new calendar.Calendar(calendar.MONDAY).monthdatescalendar(year,month);
        if (month - 1 < 1){
            newMonthSub = 12;
            newYearSub = year - 1;
        }
        else{
            newMonthSub--;
            newYearSub = year;
        }
        var calPrev = new calendar.Calendar(calendar.MONDAY).monthdatescalendar(newYearSub,newMonthSub);

        if (month + 1 > 12){
            newMonthAdd = 1;
            newYearAdd = year + 1;
        }
        else{
            newMonthAdd++;
            newYearAdd = year;
        }

        var calNext = new calendar.Calendar(calendar.MONDAY).monthdatescalendar(newYearAdd,newMonthAdd);

        cal = cal.concat(calPrev);
        cal = cal.concat(calNext);

        // Get current week
        for (var x = 0; x < cal.length; x++){
            for (var j = 0; j < 7; j++){
                cal[x][j] = moment(cal[x][j]).format("LL");
                if(parameterDate == cal[x][j]){
                    index = x;
                }
            }
        }

        thisWeek = cal[index];


        // dateParam passes the parameter for current, previous and next week
        // 0: current, 1: prev, 2: next
        var dateParam = [];
        dateParam.push( moment(thisWeek[0]).format("L").replace("/", '').replace("/", ''));
        var prev = moment(thisWeek[0]).subtract(1, 'week').calendar();
        dateParam.push(moment(prev).format("L").replace("/", '').replace("/", ''));
        var next = moment(thisWeek[0]).add(1, 'week').calendar();
        dateParam.push(moment(next).format("L").replace("/", '').replace("/", ''));

        // Get today's date in parameter form
        var today = moment().format("L").replace("/", '').replace("/", '');

        res.render('display', {csrfToken: req.csrfToken(), tasks: docs, calendar: thisWeek, currentWeek: dateParam, todaysDate: today});
    });
};


var displayCompletedPage = function(req, res){

    var completed = [];

    Task.TaskModel.findByOwner(req.session.account._id, function(err, docs) {
        if (err) {
            console.log(err);
            return res.status(400).json({error: "An error occurred"});
        }

        for(var i = 0; i < docs.length; i++){
            docs[i] = docs[i].toAPI();
            if (docs[i].completed === true){
                completed.push(docs[i]);      
            }
        }

        res.render('completedTasks', {csrfToken: req.csrfToken(), completedTasks: completed});
    });
};


var makeTask = function(req, res){

    if(!req.body.name || !req.body.importance || !req.body.date) {
        return res.status(400).json({error: "Oops! All fields are required"});
    }

    //    var today = moment(new Date()).format("L");
    //    var inputDate = req.body.date
    //    if(moment(inputDate).format("L") < today){
    //        return res.status(400).json({error: "Make sure the task you're creating is for the future!"});
    //    }

    if(req.body.importance < 1 || req.body.importance > 3){
        return res.status(400).json({error: "Oops! Importance must be between 1 and 3"});
    }

    var taskData = {
        name: req.body.name,
        importance: req.body.importance,
        date: req.body.date,
        owner: req.session.account._id
    };

    var newTask = new Task.TaskModel(taskData);

    newTask.save(function(err) {
        if (err) {
            console.log(err);
            return res.status(400).json({error: "An error occurred"});
        }

        req.session.task = newTask.toAPI();

        res.json({redirect: '/display'});
    });

};


var removeTask = function(req, res){

    Task.TaskModel.findOne({_id: req.params.id}, function(err, doc){
        if (err) {
            console.log(err);
            return res.status(400).json({error: "An error occurred"});
        }

        doc.remove();
        doc.save();

        res.redirect(req.get('referer'));
    });

};


var clearTasks = function(req, res){

    Task.TaskModel.findByOwner(req.session.account._id, function(err, docs) {
        if (err) {
            console.log(err);
            return res.status(400).json({error: "An error occurred"});
        }

        for(var i = 0; i < docs.length; i++){
            if (docs[i].completed === true){
                docs[i].remove();
                docs[i].save();    
            }
        }

        res.redirect(req.get('referer'));
    });  

};


var checkTask = function(req, res){

    Task.TaskModel.findOne({_id: req.params.id}, function(err, doc){
        if (err) {
            console.log(err);
            return res.status(400).json({error: "An error occurred"});
        }

        doc.completed = true;
        doc.save();

        res.redirect(req.get('referer'));
    });

};


var editPage = function(req, res){
    Task.TaskModel.findOne({_id: req.params.id}, function(err, doc){
        if (err) {
            console.log(err);
            return res.status(400).json({error: "An error occurred"});
        }

        doc = doc.toAPI();

        res.render('editTask', {csrfToken: req.csrfToken(), t: doc});
    });
};


var editTask = function(req, res){
    Task.TaskModel.findOne({_id: req.params.id}, function(err, doc){

        doc.name = req.body.name;
        doc.importance = req.body.importance;
        doc.date = req.body.date;
        doc.save();

        res.json({redirect: '/display'});
    });
};


var sortTasksPriority = function(req, res){
    
}

module.exports.makerPage = makerPage;
module.exports.make = makeTask;
module.exports.editPage = editPage;
module.exports.edit = editTask;
module.exports.removeTask = removeTask;
module.exports.clearTasks = clearTasks;
module.exports.checkTask = checkTask;
module.exports.displayPage = displayPage;
module.exports.displayCompletedPage = displayCompletedPage;