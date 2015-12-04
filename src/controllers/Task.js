var _ = require('underscore');
var models = require('../models');
var url = require('url');
var moment = require('moment');
var calendar = require('node-calendar');

var util = require('../utilities');

var Task = models.Task;

var makerPage = function(req, res){

  Task.TaskModel.findByOwner(req.session.account._id, function(err, docs) {
    if (err) {
      console.log(err);
      return res.status(400).json({error: "An error occurred"});
    }

    //util.displayCalendar();

    res.render('app', {csrfToken: req.csrfToken()});
  });
};

var displayPage = function(req, res){

  Task.TaskModel.findByOwner(req.session.account._id, function(err, docs) {
    if (err) {
      console.log(err);
      return res.status(400).json({error: "An error occurred"});
    }

    var i;
    for(i = 0; i < docs.length; i++){
      docs[i] = docs[i].toAPI();
    }


    res.render('display', {csrfToken: req.csrfToken(), tasks: docs});
  });
};

var makeTask = function(req, res){
  var currentDate = new Date();
  currentDate = moment(currentDate).format('LL');

  if(!req.body.name || !req.body.importance || !req.body.date) {
    return res.status(400).json({error: "Oops! All fields are required"});
  }

  //    if(req.body.date < currentDate){
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

    //also check it belongs to the user
    //console.log("Removed: " + doc);

    doc.remove();
    doc.save();

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
    doc.importance = req.body.importance
    doc.date = req.body.date;
    doc.save();

    res.json({redirect: '/display'});
  });
};


module.exports.makerPage = makerPage;
module.exports.make = makeTask;
module.exports.editPage = editPage;
module.exports.edit = editTask;
module.exports.removeTask = removeTask;
module.exports.checkTask = checkTask;
module.exports.displayPage = displayPage;