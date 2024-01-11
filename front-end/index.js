import {CountryData} from './countryData.js';
/* Import relevant HTML elements for listeners */
const countryInputElem = document.querySelector(".country-input-field");
const guessButtonElem = document.querySelector(".submit-guess-button");
const hintButtonElem = document.querySelector(".hint-button");
const giveUpButtonElem = document.querySelector(".give-up-button");
/* Import relevant HTML elements for updating */
const totalScoreElem = document.querySelector(".score-styling");
const countryListElem = document.querySelector(".guesses-display");
const scoreListElem = document.querySelector(".current-score-display");
const hintListElem = document.querySelector(".right-fact-display");
const errorElem = document.querySelector(".error-text");
/* Initialize lists for HTML generation */
let guessedList = [];
let scoreList = [10000];
let hintList = [];
let totalScore = 0;
let roundCount = 0;
let hintCount = 3;
let currentCountry = null;
const countryData = CountryData;
const countryNames = countryData.map((country) => country["Name"]);


/* Function for updating HTML by generating it referencing guessedList & hintList */
const renderLists = () => {
    /* Update totalScore */
    totalScoreElem.innerHTML = totalScore;
    /* Update countryList */
    let putStr = '';
    for (let i = 0; i < guessedList.length; i++) { putStr += `<p class="guesses-display-text">${guessedList[i]}</p>`; }
    countryListElem.innerHTML = putStr;
    /* Update scoreList */
    putStr = '';
    for (let i = 0; i < scoreList.length; i++) { putStr += `<p class="current-score-display-text">Round ${i+1}: <span class="current-score-styling">${scoreList[i]}</span></p>`; }
    scoreListElem.innerHTML = putStr;
    /* Update hintList */
    putStr = '';
    for (let i = 0; i < hintCount; i++) { putStr += `<p class="fact-display-text">${hintList[i]} : ${currentCountry[hintList[i]]}</p>`; }
    hintListElem.innerHTML = putStr;
}  
/* Function for initializing site / refreshing for a new round when they get a correct guess */
const startNewRound = () => {
    /* Update Score */
    if (roundCount > 0) { 
        totalScore += scoreList[scoreList.length - 1];
        scoreList.push(10000);
    }
    /* Update global variables */
    roundCount++;
    guessedList = [];
    hintList = [];
    hintCount = 3;
    hintButtonElem.innerHTML = "Get Another Hint";
    /* Pick a new country, and populate the hintlist */
    currentCountry = countryData[Math.floor(Math.random() * countryData.length)];
    hintList = Object.keys(currentCountry);
    hintList = hintList.slice(0, hintList.length - 1); // Remove "Name" from the hintList
    /* Shuffle hintList */
    for (let i = hintList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = hintList[i];
        hintList[i] = hintList[j];
        hintList[j] = temp;
    }
    /* Update HTML */
    renderLists();
}

/* Event listener for submitting a guess */
const submitGuess = () => {
    const guess = countryInputElem.value;
    /* If guess is not a country */
    if (!countryNames.includes(guess.toLowerCase())) {
        countryInputElem.value = '';
        errorElem.innerHTML = "Not Found in Database.";
        return;
    }
    /* If guess has been guessed already */
    if (guessedList.includes(guess)) {
        countryInputElem.value = '';
        errorElem.innerHTML = "Already Guessed.";
        return;
    }
    /* Remove error if guess is valid */
    errorElem.innerHTML = "";
    /* If correct */
    if (guess.toLowerCase().localeCompare(currentCountry["Name"]) == 0) {
        countryInputElem.value = '';
        startNewRound();
    }
    /* If incorrect */
    else {
        /* Update score */
        if (scoreList[scoreList.length - 1] > 0) {scoreList[scoreList.length - 1] -= 1000;}
        if (scoreList[scoreList.length - 1] < 0) {scoreList[scoreList.length - 1] = 0;}
        countryInputElem.value = '';
        guessedList.push(guess);
        /* Update HTML */
        renderLists();
    }
}

/* Event listener for hint button */
const getHint = () => {
    if (hintCount < hintList.length) {
        hintCount++;
        if (scoreList[scoreList.length - 1] > 0) { scoreList[scoreList.length - 1] -= 500; }
        renderLists();
    }
    else {hintButtonElem.innerHTML = "Out Of Hints!";}
}

/* Event listener for give up button */
const giveUp = () => {
    scoreList[scoreList.length - 1] = 0;
    startNewRound();
}

/* Apply listeners to relevant HTML elements */
guessButtonElem.addEventListener("click", submitGuess);
countryInputElem.addEventListener("keyup", (event) => { if (event.keyCode === 13) { submitGuess(); } });
hintButtonElem.addEventListener("click", getHint);
giveUpButtonElem.addEventListener("click", giveUp);
startNewRound();