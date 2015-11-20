var _ = require('underscore');
var models = require('../models');
var url = require('url');
var moment = require('moment');

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
        if (err) {
            console.log(err);
            return res.status(400).json({error: "An error occurred"});
        }

        res.render('display', {csrfToken: req.csrfToken(), tasks: docs});
    });
};

var makeTask = function(req, res){
    var currentDate = new Date();

    if(!req.body.name || !req.body.importance || !req.body.date) {
        return res.status(400).json({error: "Oops! All fields are required"});
    }

    //  console.log(currentDate);
    //  console.log(req.body.date);
    //  if(req.body.date < currentDate){
    //    return res.status(400).json({error: "Oops! You can't create a task for the past"});
    //  }

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

        //    req.session.task = newTask.toAPI();

        res.json({redirect: '/display'});
    });

};


var removeTask = function(req, res){

    parsedURL = url.parse(req.url, true);

    Task.TaskModel.findOne({id: parsedURL.query.id}, function(err, docs){
        if (err) {
            console.log(err);
            return res.status(400).json({error: "An error occurred"});
        }

        //also check it belongs to the user
        docs.remove();
        docs.save();

        res.redirect(req.get('referer'));
    });

};

module.exports.makerPage = makerPage;
module.exports.make = makeTask;
module.exports.removeTask = removeTask;
module.exports.displayPage = displayPage;