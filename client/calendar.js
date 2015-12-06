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

    $("#back").on("click", function(e) {
        e.preventDefault();

        console.log("baaack");

        return false;
    });


    $("#next").on("click", function(e) {
        e.preventDefault();

        console.log("next");

        return false;
    });


});