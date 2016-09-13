/**
 * Created by jdifebo on 3/12/2016.
 */
"use strict";

var model;

function generate100Words(){
    $(".generated").each(function() {
        $( this ).text(model.generateWord().join(''));
    });
}

function generateSingleWord(){
    $(".single-generated-word").text(model.generateWord().join(''));
}

$(document).ready(function() {
    // We know which word list to load by looking at the link in the HTML file
    var filename = $("#linkToWords").attr("href");
    console.time("fetching");
    $.get(filename, function( data ) {
        console.timeEnd("fetching");
        console.time("building");
        var words = data.split(/\s+/);
        var lettersFromWords = words.map(function(line){return line.split("");});
        var markovChainOrder = words.length > 1000 ? 4 : 3;
        model = buildMarkovModel(lettersFromWords, markovChainOrder);
        generateSingleWord();
        console.timeEnd("building");
    });
    $("#generate").click(generateSingleWord);
    $("#generate-100").click(generate100Words);
});