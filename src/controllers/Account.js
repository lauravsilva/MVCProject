var models = require('../models');

var Account = models.Account;

// render log in page
var loginPage = function(req, res){
    res.render('login', { csrfToken: req.csrfToken() });
};

// render sign up page
var signupPage = function(req, res){
    res.render('signup', { csrfToken: req.csrfToken() });
};

// render profile page
var profilePage = function(req, res){

    Account.AccountModel.findByUsername(req.session.account.username, function(err, doc) {
        if (err) {
            console.log(err);
            return res.status(400).json({error: "An error occurred"});
        }

        doc = doc.toAPI();

        res.render('profile', {profileInfo: doc, csrfToken: req.csrfToken() });
    });
};

// log out user by destroying session
var logout = function(req, res){
    req.session.destroy();
    res.redirect('/');
};

// log in a user
var login = function(req, res){

    if(!req.body.username || !req.body.pass){
        return res.status(400).json({error: "Oops! All fields are required"});
    }

    Account.AccountModel.authenticate(req.body.username, req.body.pass, function(err, account) {
        if (err || !account){
            return res.status(401).json({error: "Invalid username or password"});
        }

        req.session.account = account.toAPI();

        res.json({redirect: '/display'});
    });
};

// account sign up
var signup = function(req, res){

    // error checking
    if(!req.body.username || !req.body.pass || !req.body.pass2 || !req.body.name){
        return res.status(400).json({error: "Oops! All fields are required"});
    }

    if(req.body.pass !== req.body.pass2){
        return res.status(400).json({error: "Passwords do not match :("});
    }

    // check if username already exists
    Account.AccountModel.findByUsername(req.body.username, function(err, doc){
        if(err || doc){
            return res.status(400).json({error: "Username already exists. Try again!"});
        }

        //if not, create account
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
    });
};

// change password and redirect to profile page
var changePassword = function(req, res){
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

        Account.AccountModel.authenticate(req.session.account.username, req.body.oldpass, function(err, account) {
            if (err || !account){
                return res.status(401).json({error: "Current password is incorrect"});
            }

            if(req.body.newpass == req.body.newpass2){
                Account.AccountModel.generateHash(req.body.newpass, function(salt, hash){
                    account.salt = salt;
                    account.password = hash;
                    account.save();
                });
            }

            res.json({redirect: '/profile', csrfToken: req.csrfToken() });

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