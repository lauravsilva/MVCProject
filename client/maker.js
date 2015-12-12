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
                $("#errorAlert").hide();

                window.location = result.redirect;
            },
            error: function(xhr, status, error) {
                var messageObj = JSON.parse(xhr.responseText);

                handleError(messageObj.error);
            }
        });        
    }

    $("#makeTaskSubmit").on("click", function(e) {
        e.preventDefault();


        if($("#taskName").val() == '' || $("#taskImportance").val() == '' || $("#taskDate").val() == '') {
            $("#errorAlert").show();
            handleError("Oops! All fields are required");
            return false;
        }

        sendAjax($("#taskForm").attr("action"), $("#taskForm").serialize());

        return false;
    });


    $("#cancel").on("click", function(e) {
        history.back();
    });

});