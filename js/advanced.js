/**
 * Created by jdifebo on 3/12/2016.
 */
"use strict";

var model;
var modelIsDirty = true;

function generate() {
    var minLength = parseInt($("#minimumLength").val());
    var maxLength = parseInt($("#maximumLength").val());
    var matchingText = $("#mustContain").val();
    var matchingRegex = new RegExp(matchingText);
    $(".generated").each(function() {
        $( this ).text(model.generateWord(minLength, maxLength, matchingRegex).join(''));
    });
}

function loadPremadeWordList() {
    var filename = "resources/" + $("#premadeWordList option:selected").val();
    $.get(filename, function( data ) {
        $("#WordList").val( data );
        var numWords = data.split("\n").length;
        if (numWords > 1000){
            $("#MarkovChainOrder").val(4);
        }
        else {
            $("#MarkovChainOrder").val(3);
        }
    });
    modelIsDirty = true;
}

function buildModelAndGenerateWords() {
    if (modelIsDirty) {
        modelIsDirty = false;
        var words = $("#WordList").val().split(/\s+/);  // whitespace divides the words
        var lettersFromWords = words.map(function(line){return line.split("");});   // each letter is a token
        model = buildMarkovModel(lettersFromWords, parseInt($("#MarkovChainOrder").val()));
    }
    generate();
}

$(document).ready(function() {
    $("#generate").click(buildModelAndGenerateWords);
    loadPremadeWordList();
    $("#premadeWordList").change(loadPremadeWordList);
    $("#WordList").change(function(){modelIsDirty = true});
    $("#MarkovChainOrder").change(function(){modelIsDirty = true});
});