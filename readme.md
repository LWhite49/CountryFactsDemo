# Country Fact Guesser - Demo

# Introduction

This project was made in just two days as the first test for 48hr.dev. As such, its functionality was prioritized over styling. It references a scraed data base of
Country Facts, and displays them one at a time until a user is able to guess which country the facts are based on, tracking their score based on the number of incorrect
guesses and hints needed. It uses NodeJS and puppeteer for scraping, and static HTML CSS and JS for the frontend. 

# "Hackathon" format tradeoffs

The context of making this project in a two day "Hackathon" erc structure changed a lot of how the project was built. The obvious difference is that the two day
constraint means a usable state of the app came much faster than it would have if we were normally developing the project. A negative consequence of this is that
you are generally incentivesed to use the stack you already know instead of learning a new framework alongside the development of the project, since you want to minimize
the time learning new concepts and syntax, maximizing the actually time writing usable code. An example of this is using static JS for the frontend instead of React, which
has many applications that would have made the front end cleaner and more optimized. If our team was not on a two day time restained, we could have learned React alongside the project and had a better app to present. Another downside of the hackathon structure is having to priotize functionality over features, where many aspects of the project had to be left alone as they are instead of spending the time we wanted tweaking and experimenting.

# Scraping

The Scrape Database was made with the Puppeteer Cluster library in Node, which allows for concurrent threads to scrape at the same time for optimal scrape times. For the sake of building quickly, some of the data JSON had to be parsed manually, but this sort of thing cound easily be implimented directly into the scraper if we had more time.

# Frontend

The HTML for the website was structued based on a Nested Layout of a UI designed on Canva. This results in a lot of nested containers that situate different elements where they need to be for the UI to appear how we wanted. The CSS Styling for the website is relatively simple, sticking to a purple radial gradient for the background, and coloring the other UI elements to fit that color scheme. The JS works by breaking the program into two main functions:
    - startGame(), which picks a random country from the imported scrape database, populates the array of hints, and manages the round score and total score. 

    - renderLists(), which iterates the hintList, scoreList, and guessedList to render the website based on the state of the users round and total performance. It uses generative HTML to always display the relevant hints, scores and countries from previous rounds, and a list of the countries they have guessed in the current round.

# Event Listeners

There are event listeners for a few elements that interact with the current round. The text input field has a keyup listener that submits a guess and assesses it if they click enter. The guess button has an onclick listener that submits the guess and assesses it. The Get Hint button rerenders the page with a new hint added, and deducts points from the current round. The Give Up button sets their round score to 0, and starts a new round.

# Validation

When a user submits a guess, there is some validation. If the guess is not a country inside the database, an error is thrown and they do not lose points. If they have already made that same guess, there is an error thrown and they lose no points.