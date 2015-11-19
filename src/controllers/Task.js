var _ = require('underscore');
var models = require('../models');
var url = require('url');

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

    if(!req.body.name || !req.body.importance || !req.body.date) {
        return res.status(400).json({error: "Oops! All fields are required"});
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

        res.json({redirect: '/display'});
    });

};


var removeTask = function(req, res){

    parsedURL = url.parse(req.url, true);

    Task.TaskModel.findOne({id: parsedURL.query['id']}, function(err, docs){
        if (err) {
            console.log(err);
            return res.status(400).json({error: "An error occurred"});
        }
        
        //also check it belongs to the user
        docs.remove();
        docs.save();

        //res.json({redirect: '/display'});
        res.render('display', {csrfToken: req.csrfToken()});
    });

};

module.exports.makerPage = makerPage;
module.exports.make = makeTask;
module.exports.removeTask = removeTask;
module.exports.displayPage = displayPage;