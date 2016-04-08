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
    $("#word").text(model.generateWord());
}

$(document).ready(function() {
    var filename = "resources/english.txt";
    $.get(filename, function( data ) {
        model = buildModel(data, 4);
        generateSingleWord();
    });
    $("#generate").click(generateSingleWord);
    $("#generate-100").click(generate100Words);
});