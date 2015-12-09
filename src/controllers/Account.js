var models = require('../models');

var Account = models.Account;

var loginPage = function(req, res){
   res.render('login', { csrfToken: req.csrfToken() });
};

var signupPage = function(req, res){
   res.render('signup', { csrfToken: req.csrfToken() });
};

var profilePage = function(req, res){

   console.log("in profile page");
   
   Account.AccountModel.findByUsername(req.session.account.username, function(err, doc) {
      if (err) {
         console.log(err);
         return res.status(400).json({error: "An error occurred"});
      }
      
      doc = doc.toAPI();

      res.render('profile', {profileInfo: doc});
   });
};

var logout = function(req, res){
   req.session.destroy();
   res.redirect('/');
};

var login = function(req, res){

   if(!req.body.username || !req.body.pass){
      return res.status(400).json({error: "Oops! All fields are required"});
   }

   Account.AccountModel.authenticate(req.body.username, req.body.pass, function(err, account) {
      if (err || !account){
         return res.status(401).json({error: "Wrong username or password"});
      }

      req.session.account = account.toAPI();

      res.json({redirect: '/display'});
   });
};

var signup = function(req, res){

   if(!req.body.username || !req.body.pass || !req.body.pass2 || !req.body.name){
      return res.status(400).json({error: "Oops! All fields are required"});
   }

   if(req.body.pass !== req.body.pass2){
      return res.status(400).json({error: "Passwords do not match :("});
   }

   Account.AccountModel.generateHash(req.body.pass, function(salt, hash){

      var accountData = {
         name: req.body.name,
         username: req.body.username,
         salt: salt,
         password: hash
      };

      var newAccount = new Account.AccountModel(accountData);

      newAccount.save(function(err){
         if(err) {
            console.log(err);
            return res.status(400).json({error: 'An error occurred'});
         }

         req.session.account = newAccount.toAPI();

         res.json({redirect: '/maker'});
      });
   });
};

var changePassword = function(req, res){

   console.log("in change pw");

   Account.AccountModel.findByUsername(req.session.account.username, function(err, doc) {
      if (err) {
         console.log(err);
         return res.status(400).json({error: "An error occurred"});
      }

      if(!req.body.newpass || !req.body.newpass2 || !req.body.oldpass){
         return res.status(400).json({error: "Oops! All fields are required"});
      }

      if(req.body.newpass !== req.body.newpass2){
         return res.status(400).json({error: "Passwords do not match :("});
      }
      
      Account.AccountModel.authenticate(req.session.account._id, req.body.oldpass, function(err, account) {
         if (err || !account){
            return res.status(401).json({error: "Current password is incorrect"});
         }

         console.log("authenticate");

         if(req.body.newpass == req.body.newpass2){
            Account.AccountModel.generateHash(req.body.newpass, function(salt, hash){
               account.salt = salt;
               account.password = hash;
               account.save();
               console.log("new password saved");
            });
         };

         res.json({redirect: '/profile'});

      });
   });

};

module.exports.loginPage = loginPage;
module.exports.login = login;
module.exports.logout = logout;
module.exports.signupPage = signupPage;
module.exports.signup = signup;
module.exports.profilePage = profilePage;
module.exports.changePassword = changePassword;