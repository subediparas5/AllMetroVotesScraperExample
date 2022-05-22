const express = require('express')
const cheerio = require('cheerio')
const axios = require('axios')



const app = express()
const url = 'https://localelection.ekantipur.com/?lng=eng';
const PORT = 8000;

let ii = 0
var minutes = .10, the_interval = minutes * 60 * 1000;
var ktm_highest = 0
const hashtag = `#LocalElections2022\n#LocalElections2079`

setInterval(async function () {
    axios(url)
        .then(
            async response => {
                console.log(`I am doing my ${minutes} minutes check ` + ii++);
                var html = await response.data;
                var metropolitian_substring = await html.substring(
                    html.indexOf("Metropolitan"), html.lastIndexOf("Submetropolitan")
                )
                var $ = cheerio.load(metropolitian_substring);
                var metro_data = [];

                function numberWithCommas(x) {
                    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                }

                $("#pills-pramukh2").find(".card--2")
                    .each(async function () {
                        var metro_name = $(this).find(".card-header.bg-white").find(".card-header-label").find("a").text().substring(1)
                        var candidates = []
                        $(this).find('.col').each(async function () {
                            var candidate_name = $(this).find(".candidate-name").text()
                            var candidate_votes = $(this).find(".vote-numbers").text().slice(0, -1)
                            candidates.push({
                                candidate_name,
                                candidate_votes
                            })
                        })
                        candidates.sort(function (b, a) {
                            return a.candidate_votes - b.candidate_votes
                        })
                        metro_data.push({
                            metro_name,
                            candidates
                        })
                    })
                if (ktm_highest != Number(metro_data[0].candidates[0].candidate_votes)) {
                    ktm_highest = Number(metro_data[0].candidates[0].candidate_votes)
                    console.log(ktm_highest);
                    let metro_text = ''
                    for (i = 0; i <= 5; i++) {
                        metro_text += `${metro_data[i].metro_name}:\n${'-'.repeat([10])}\n`
                        for (j = 0; j <= 1; j++) {
                            metro_text += `${metro_data[i].candidates[j].candidate_name}: ${numberWithCommas(metro_data[i].candidates[j].candidate_votes)}\n`
                        }
                        metro_text += "\n"
                    }
                    console.log(metro_text + hashtag + '\n');
                    // tweet()
                }
            }
        )
        .catch(err => {
            console.log(err);
        })
}, the_interval);

app.listen(PORT, () => {

})