/**
 * Created by jdifebo on 3/12/2016.
 */
"use strict";

var model;

function generate100Words(){
    $(".generated").each(function() {
        $( this ).text(model.generateWord());
    });
}

function generateSingleWord(){
    $(".single-generated-word").text(model.generateWord());
}

$(document).ready(function() {
    // We know which word list to load by looking at the link in the HTML file
    var filename = $("#linkToWords").attr("href");
    $.get(filename, function( data ) {
        var numWords = data.split("\n").length;
        var markovChainOrder;
        if (numWords > 1000){
            markovChainOrder = 4;
        }
        else {
            markovChainOrder = 3;
        }
        model = buildModel(data, markovChainOrder);
        generateSingleWord();
    });
    $("#generate").click(generateSingleWord);
    $("#generate-100").click(generate100Words);
});