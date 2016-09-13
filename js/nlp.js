/**
 * Created by jdifebo on 3/12/2016.
 */
"use strict";

/**
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
function buildMarkovModel(examples, markovChainOrder) {

    var tokenCounts = {};   // A place to hold our counts
    var existingSequences = {}; // A list of sequences we've seen while building the model

    for (var i = 0; i < examples.length; i++){
        existingSequences[examples[i]] = true;
        for (var j = 0; j < examples[i].length; j++){
            // We want to count the occurrence of this token, but we must look at the past tokens to know what to increment
            var previousTokens = examples[i].slice(Math.max(j - markovChainOrder, 0), j);
            if (tokenCounts[previousTokens] === undefined){
                tokenCounts[previousTokens] = wordCounter();
            }
            var token = examples[i][j];
            tokenCounts[previousTokens].addNextToken(token);
        }
        var previousTokens = examples[i].slice(Math.max(j - markovChainOrder, 0), j);
        if (tokenCounts[previousTokens] === undefined){
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
    function wordCounter(){
        var nextTokenCounts = {};
        var total = 0;

        function addNextToken(nextToken){
            if (nextTokenCounts[nextToken] === undefined){
                nextTokenCounts[nextToken] = 0;
            }
            nextTokenCounts[nextToken]++;
            total++;
        }

        function generateNextToken(previousTokens){
            var rand = getRandomInt(0, total);
            for (var potentialNext in nextTokenCounts) {
                rand -= nextTokenCounts[potentialNext];
                if (rand < 0){
                    return potentialNext;
                }
            }
            return "ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR!";
        }
        return {addNextToken: addNextToken, generateNextToken: generateNextToken};
    }

    function generateNextToken(previousTokens){
        return tokenCounts[previousTokens].generateNextToken();
    }

    function generateAnySequence(){
        var previousTokens = [];
        var nextToken = generateNextToken(previousTokens);
        var sequence = [];
        while (nextToken !== ''){
            sequence.push(nextToken);
            if (previousTokens.length == markovChainOrder){
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

    var getRandomInt = function(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    };

    return {
        generateWord : generateQualifyingSequence
    };
}
