const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { Cluster } = require('puppeteer-cluster');
const fs = require('fs').promises;
const path = require('path');
const { info } = require('console');
require('dotenv').config();
puppeteer.use(StealthPlugin());

/* Scrape function that utlizes a cluster to return an array of structuted country objects */
const scrapeWithClusters = async () => {
    try {
        /* Source URL and create cluster */
        const url = process.env.URL;
        const cluster = await Cluster.launch({concurrency: Cluster.CONCURRENCY_CONTEXT, maxConcurrency: 6, puppeteerOptions: {headless: false}});
        /* Define check for character */
        const checkCharacter = (str) => {
            if (str == '(' || str == '\n' || str == '\t' || str == '') {return false;}
            return true
        }

        /* Define task */
        cluster.task( async({page, data}) => {
            try {
                let country = data.country;
                country = country.replaceAll(" ", "_");
                await page.goto(url);
                /* Scroll to bottom */
                await page.waitForTimeout(1500 * Math.random());
                await page.evaluate(() => { window.scrollBy(0, 1500 * Math.random() + 3000) });
                await page.waitForTimeout(1500 * Math.random());
                await page.evaluate(() => { window.scrollBy(0, 1500 * Math.random() + 3000) });
                await page.waitForTimeout(1500 * Math.random());
                /* Click on relevant country page */
                await page.click(`a[href="/wiki/${country}"]`);
                await page.waitForTimeout(1500 * Math.random() + 5000);
                /* Create a JSON object for the target country */
                const tempObject = await page.evaluate( (country) => {
                    const countryName = country.replaceAll("_", " ");
                    window.scrollBy(0, 1500 * Math.random() + 6000);
                    /* Get a list of all info boxes and data boxes */
                    let infoBoxes = Array.from(document.querySelectorAll(".infobox-label")).map(infoBox => infoBox.innerText);
                    let dataBoxes = Array.from(document.querySelectorAll(".infobox-data")).map(dataBox => dataBox.innerText);
                    /* Format infoBoxes */
                    infoBoxes = infoBoxes.map(infoBox => {
                        let putStr = '';
                        for (let i = 0; infoBox[i] != '\n' && infoBox[i] != '\t' && infoBox[i] != '(' && infoBox[i] != "•" && i < infoBox.length; i++) { putStr += infoBox[i]; }
                        putStr = putStr.trim();
                        if (!putStr.localeCompare("GDP")) { return ''}
                        return putStr;
                    });
                    /* Format dataBoxes */
                    dataBoxes = dataBoxes.map((dataBox, index) => {
                        if (infoBoxes[index] == '') {return ''}
                        else {
                            let putStr = '';
                            for (let i = 0; i < dataBox.length && dataBox[i] != '(' && dataBox[i] != '[' && dataBox[i] != '\n'; i++) { putStr += dataBox[i]; }
                            return putStr.trim();
                        } 
                    });
                    /* Filter out empty strings, GPD, demonym, and ethnic groups */
                    infoBoxes = infoBoxes.filter(infoBox => infoBox != '');
                    dataBoxes = dataBoxes.filter(dataBox => dataBox != '');
                    /* Create JSON object */
                    let tempObject = {};
                    for (let i = 0; i < infoBoxes.length && i < dataBoxes.length; i++) { tempObject[infoBoxes[i]] = dataBoxes[i]; }
                    tempObject["Name"] = countryName.toLowerCase();
                    delete tempObject["Demonym"];
                    delete tempObject["Ethnic groups"];
                    delete tempObject["ISO 3166 code"];
                    delete tempObject["Internet TLD"];
                    return tempObject;
                }, country);
                /* Add tempObject to countryData */
                countryData.push(tempObject);
            } catch (err) { console.log(err) }          
        });

        /* Define Country Array that contains the name of each country to be scraped */
        const countryStrings = ["China", "India", "United States", "Indonesia", "Pakistan", "Nigeria", "Brazil", "Bangladesh", "Russia", "Mexico", "Japan",
        "Philippines", "Ethiopia", "Egypt", "Vietnam", "Democratic Republic of the Congo", "Turkey", "Iran", "Germany", "Thailand", "United Kingdom", "France", "Italy", "Tanzania",
        "South Africa", "Myanmar", "Colombia", "Kenya", "South Korea", "Spain", "Argentina", "Uganda", "Algeria", "Iraq", "Sudan", "Ukraine", "Canada", "Poland", "Morocco", "Uzbekistan",
        "Afghanistan", "Peru", "Malaysia", "Angola", "Mozambique", "Saudi Arabia", "Yemen", "Ghana", "Ivory Coast", "Nepal", "Venezuela", "Cameroon", "Madagascar", "Australia",
        "North Korea", "Niger", "Taiwan", "Syria", "Mali", "Burkina Faso", "Sri Lanka", "Malawi", "Chile", "Zambia", "Romania", "Senegal", "Somalia", "Guatemala", "Netherlands",
        "Chad", "Cambodia", "Ecuador", "Zimbabwe", "Guinea", "South Sudan", "Rwanda", "Burundi", "Benin", "Bolivia", "Tunisia", "Papua New Guinea", "Belgium", "Haiti", "Jordan",
        "Cuba", "Czech Republic", "Dominican Republic", "Sweden", "Portugal", "Greece", "Azerbaijan", "Tajikistan", "Honduras", "Hungary", "United Arab Emirates", "Belarus",
        "Austria", "Switzerland", "Sierra Leone", "Togo", "Laos", "Kyrgyzstan", "Turkmenistan", "Libya", "El Salvador", "Nicaragua", "Serbia", "Bulgaria", "Paraguay", "Republic of the Congo",
        'Denmark', "Singapore", "Central African Republic", "Finland", "Norway", "Lebanon", "State of Palestine", "Slovakia", "Republic of Ireland", "Costa Rica", "Liberia", "New Zealand", "Oman", "Kuwait",
        "Mauritania", "Panama", "Croatia", "Eritrea", "Uruguay", "Bosnia and Herzegovina", "Mongolia", "Armenia", "Jamaica", "Qatar", "Albania", "Lithuania", "Namibia", "The Gambia", "Botswana", "Lesotho",
        "Gabon", "North Macedonia", "Slovenia", "Guinea-Bissau", "Latvia", "Bahrain", "Equatorial Guinea", "Trinidad and Tobago", "Estonia", "Luxembourg", "Mauritius", "Cyprus", "Eswatini", "Djibouti", "Fiji"
    ];
        /* Define Database Array */
        const countryData = [];
        for (country of countryStrings) { cluster.queue({country: country});}
        await cluster.idle();
        /* Close cluster */
        await cluster.close();
        /* Save to JSON file */
        await fs.writeFile(path.join(__dirname, 'countryData.json'), JSON.stringify(countryData, null, 2));
    } catch (err) { console.log(err) }
}

scrapeWithClusters();
