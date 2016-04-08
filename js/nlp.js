/**
 * Created by jdifebo on 3/12/2016.
 */
"use strict";

function buildModel(wordList, markovChainOrder) {
    var histogram = {};
    var existingWords = {};

    wordList = wordList.toLowerCase().match(/[a-z']+/g);
    var padStart = Array(markovChainOrder + 1).join("[");
    var paddedText;

    for (var i = 0; i < wordList.length; i++) {
        existingWords[wordList[i]] = true;
        paddedText = padStart + wordList[i] + "]";
        for (var j = 0; j < paddedText.length - (markovChainOrder); j++) {
            var sub = paddedText.substr(j, markovChainOrder);
            if (histogram[sub] == undefined)
                histogram[sub] = {
                    "total" : 0
                };
            var next = histogram[sub];
            next["total"] += 1;
            var nextChar = paddedText[j + markovChainOrder];
            if (next[nextChar] == undefined)
                next[nextChar] = 1;
            else
                next[nextChar] += 1;
        }
    }

    var getNextLetter = function(string) {
        var substring = string.substr(-1 * markovChainOrder, markovChainOrder);
        var rand = getRandomInt(0, histogram[substring]["total"]);
        for ( var y in histogram[substring]) {
            if (y != "total") {
                if (rand < histogram[substring][y]) {
                    return y;
                } else {
                    rand -= histogram[substring][y];
                }
            }
        }
        return undefined;
    };

    function generateWord() {
        var word = Array(markovChainOrder + 1).join("[");
        while (word[word.length - 1] != "]") {
            word += getNextLetter(word);
        }
        var trimmed = word.substring(markovChainOrder, word.length - 1); // erase the brackets
        return trimmed;
    }

    /**
     * Probably not the best method name but that's what comments are for.
     *
     * A word is qualifying if it is
     *     (a) Not already in the list of words that we pasted in
     *     (b) Matches our filter criteria
     */
    function generateQualifyingWord(minLength, maxLength, matchingRegex) {
        while (true) {
            var word = generateWord();
            if (existingWords[word] == undefined
                && (isNaN(minLength) || word.length >= minLength)
                && (isNaN(maxLength) || word.length <= maxLength)
                && (matchingRegex === undefined || matchingRegex.test(word))
            ) {
                return word;
            }
        }
    }

    // Returns a random integer between min (included) and max (excluded)
    // Using Math.round() will give you a non-uniform distribution!
    var getRandomInt = function(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    };


    return {
        generateWord : generateQualifyingWord
    }
}
