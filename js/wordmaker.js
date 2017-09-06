/**
 * Created by jdifebo on 3/12/2016.
 */
"use strict";

/**
 * A Markov chain language model that builds words one letter at a time.
 * 
 * @param examples is a 1-dimentional array of strings
 */
function buildMarkovModel(examples, markovChainOrder) {
    var letterCounts = {};
    var existingWords = {};
    for (var i = 0; i < examples.length; i++) {
        var word = examples[i];
        existingWords[word] = true;
        for (var j = 0; j < word.length + 1; j++) {
            var previousLetters = word.substring(Math.max(j - markovChainOrder, 0), j);
            var currentLetter = word.charAt(j);
            if (letterCounts[previousLetters] === undefined) {
                letterCounts[previousLetters] = { total: 1 };
                letterCounts[previousLetters][currentLetter] = 1;
            }
            else {
                letterCounts[previousLetters].total += 1;
                if (letterCounts[previousLetters][currentLetter] == undefined) {
                    letterCounts[previousLetters][currentLetter] = 1;
                }
                else {
                    letterCounts[previousLetters][currentLetter] += 1;
                }
            }
        }
    }

    function generateNextLetter(previousLetters) {
        var rand = getRandomInt(0, letterCounts[previousLetters]["total"]);
        for (var y in letterCounts[previousLetters]) {
            if (y != "total") {
                if (rand < letterCounts[previousLetters][y]) {
                    return y;
                } else {
                    rand -= letterCounts[previousLetters][y];
                }
            }
        }
        return undefined;

        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        };
    }

    function generateAnyWord(){
        var word = "";
        var nextLetter = undefined;
        while (nextLetter != ""){   // generating a blank string means end of word!
            nextLetter = generateNextLetter(word.substring(Math.max(0, word.length - markovChainOrder), word.length));
            word += nextLetter;
        }
        return word;
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
            var word = generateAnyWord();
            if (existingWords[word] == undefined
                && (isNaN(minLength) || word.length >= minLength)
                && (isNaN(maxLength) || word.length <= maxLength)
                && (matchingRegex === undefined || matchingRegex.test(word))
            ) {
                return word;
            }
        }
    }

    return {generateWord: generateQualifyingWord}
}

/**
 * Currently not being used because it was slower than my noticably pervious hacky code :(
 *
 * A general purpose Markov chain language model.  You must supply an array of examples at build-time, along with the
 * Markov chain order.  At this time, there is no support for incrementally building the model.
 *
 * For now, I'm using the tab character internally, so that will break lots of things if it's actually present in
 * any of the tokens.
 *
 * @param examples a 2d array of non-empty strings.  examples[i] gives the ith example.  examples[i][j] gives the jth
 * token of the ith example.  Tokens could be letters, syllables, words, phrases, however you choose to break up each
 * example
 * @param markovChainOrder number of previous tokens that the next generated token depends on
 */
function buildMarkovModelGeneralPurpose(examples, markovChainOrder) {

    var tokenCounts = {};   // A place to hold our counts
    var existingSequences = {}; // A list of sequences we've seen while building the model

    for (var i = 0; i < examples.length; i++) {
        existingSequences[examples[i]] = true;
        for (var j = 0; j < examples[i].length; j++) {
            // We want to count the occurrence of this token, but we must look at the past tokens to know what to increment
            var previousTokens = examples[i].slice(Math.max(j - markovChainOrder, 0), j);
            if (tokenCounts[previousTokens] === undefined) {
                tokenCounts[previousTokens] = wordCounter();
            }
            var token = examples[i][j];
            tokenCounts[previousTokens].addNextToken(token);
        }
        var previousTokens = examples[i].slice(Math.max(j - markovChainOrder, 0), j);
        if (tokenCounts[previousTokens] === undefined) {
            tokenCounts[previousTokens] = wordCounter();
        }
        tokenCounts[previousTokens].addNextToken('');    // use an empty string to denote end-of-sequence
    }

    /**
     * Returns 2 functions related to counting tokens
     *
     * addNextToken is used to count what tokens we are counting
     *
     * generateNextToken randomly chooses between tokens that we've seen, where potential options are weighted by how
     * many times they have been seen in examples.
     *
     * @returns {{addNextToken: addNextToken, generateNextToken: generateNextToken}}
     */
    function wordCounter() {
        var nextTokenCounts = {};
        var total = 0;

        function addNextToken(nextToken) {
            if (nextTokenCounts[nextToken] === undefined) {
                nextTokenCounts[nextToken] = 0;
            }
            nextTokenCounts[nextToken]++;
            total++;
        }

        function generateNextToken(previousTokens) {
            var rand = getRandomInt(0, total);
            for (var potentialNext in nextTokenCounts) {
                rand -= nextTokenCounts[potentialNext];
                if (rand < 0) {
                    return potentialNext;
                }
            }
            return "ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR!";
        }
        return { addNextToken: addNextToken, generateNextToken: generateNextToken };
    }

    function generateNextToken(previousTokens) {
        return tokenCounts[previousTokens].generateNextToken();
    }

    function generateAnySequence() {
        var previousTokens = [];
        var nextToken = generateNextToken(previousTokens);
        var sequence = [];
        while (nextToken !== '') {
            sequence.push(nextToken);
            if (previousTokens.length == markovChainOrder) {
                previousTokens.shift(); // remove the first element
            }
            previousTokens.push(nextToken);
            nextToken = generateNextToken(previousTokens);
        }
        return sequence;
    }

    /**
     * Probably not the best method name but that's what comments are for.
     *
     * A sequence is qualifying if it is
     *     (a) Not already in the list of sequences that we pasted in
     *     (b) Matches our filter criteria
     */
    function generateQualifyingSequence(minLength, maxLength, matchingRegex) {
        while (true) {
            var sequence = generateAnySequence();
            if (existingSequences[sequence] == undefined
                && (isNaN(minLength) || sequence.length >= minLength)
                && (isNaN(maxLength) || sequence.length <= maxLength)
                && (matchingRegex === undefined || matchingRegex.test(sequence.join()))
            ) {
                return sequence;
            }
        }
    }

    var getRandomInt = function (min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    };

    return {
        generateWord: generateQualifyingSequence
    };
}

function buildModel(wordList, markovChainOrder) {
    var histogram = {};
    var existingWords = {};

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

    function generateAnyWord() {
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
            var word = generateAnyWord();
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

var test = buildModel(["ababacccccb", "ababacccb", "abcccccca", "d", "abababbxyz"], 3);
console.log("testing");
console.log(test.generateWord());
console.log(test.generateWord());
console.log(test.generateWord());
console.log(test.generateWord());
console.log(test.generateWord());
console.log(test.generateWord());