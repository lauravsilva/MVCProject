"use strict";

$(document).ready(function() {

    function handleError(message) {
        $("#errorMessage").text(message);
        $("#errorAlert").show();
    }
    
    function sendAjax(action, data) {
        $.ajax({
            cache: false,
            type: "POST",
            url: action,
            data: data,
            dataType: "json",
            success: function(result, status, xhr) {

                window.location = result.redirect;
            },
            error: function(xhr, status, error) {
                var messageObj = JSON.parse(xhr.responseText);
            
                handleError(messageObj.error);
            }
        });        
    }
    
    $("#signupSubmit").on("click", function(e) {
        e.preventDefault();
    
    
        if($("#name").val() == '' || $("#username").val() == '' || $("#pass").val() == '' || $("#pass2").val() == ''){
            $("#errorAlert").show();
            handleError("Oops! All fields are required");
            return false;
        }
        
        if($("#pass").val() !== $("#pass2").val()) {
            handleError("Passwords do not match :(");
            return false;           
        }

        sendAjax($("#signupForm").attr("action"), $("#signupForm").serialize());
        
        return false;
    });

    $("#loginSubmit").on("click", function(e) {
        e.preventDefault();
    
        if($("#user").val() == '' || $("#pass").val() == '') {
            $("#errorAlert").show();
            handleError("Oops! Username or password field is empty");
            return false;
        }
    
        sendAjax($("#loginForm").attr("action"), $("#loginForm").serialize());

        return false;
    });
    
    
    $("#pwChangeSubmit").on("click", function(e) {
        e.preventDefault();
    
        if($("#oldpass").val() == '' || $("#newpass").val() == '' || $("#newpass2").val() == ''){
            $("#errorAlert").show();
            handleError("Oops! All fields are required");
            return false;
        }
        
        if($("#newpass").val() !== $("#newpass2").val()) {
            $("#errorAlert").show();
            handleError("Passwords do not match :(");
            return false;           
        }
        
        sendAjax($('#pwChangeForm').attr("action"), $("#pwChangeForm").serialize());
        
        return false;
    });
    
    
    $("#cancel").on("click", function(e) {
        history.go(-1);
    });
});