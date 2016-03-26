/**
 * Created by jdifebo on 3/12/2016.
 */
"use strict";

var model;

function generate() {
    var minLength = parseInt($("#minimumLength").val());
    var maxLength = parseInt($("#maximumLength").val());
    var matchingText = $("#mustContain").val();
    var matchingRegex = new RegExp(matchingText.replace(new RegExp(" ", 'g'), "|"));
    $(".generated").each(function() {
        $( this ).text(model.generateWord(minLength, maxLength, matchingRegex));
    });
}

function loadPremadeWordList() {
    var filename = "resources/" + $("#premadeWordList option:selected").val();
    $.get(filename, function( data ) {
        $("#WordList").val( data );
    });
}

function buildModelAndEnableGenerate() {
    //buildModel();
    model = buildModel2($("#WordList").val(), parseInt($("#MarkovChainOrder").val()));
    enableGenerateCard();
}

function enableGenerateCard() {
    $("#OverlayCard").hide();                               // First hide the overlay
    $("#GenerateInputs").removeClass("disabled-children");  // Then re-enable the inputs
}

$(document).ready(function() {
    $("#generate").click(generate);
    $("#BuildModel").click(buildModelAndEnableGenerate);
    loadPremadeWordList();
    $("#premadeWordList").change(loadPremadeWordList);
});