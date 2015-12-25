// ### GLOBALS

var feed = require("feed-read");
var _ = require('underscore.deferred');
var rita = require('rita');
var r = rita.RiTa;
var toTitleCase = require('titlecase')




turkey = 'http://news.google.com/news?cf=all&hl=en&pz=1&ned=us&q=Turkey&output=rss';

// ### Utility Functions (DOCUMENTATION FROM MR. KAZEMI)

// This function lets us call `pick()` on any array to get a random element from it.
Array.prototype.pick = function() {
    return this[Math.floor(Math.random() * this.length)];
};

// This function lets us call `pickRemove()` on any array to get a random element
// from it, then remove that element so we can't get it again.
Array.prototype.pickRemove = function() {
    var index = Math.floor(Math.random() * this.length);
    return this.splice(index, 1)[0];
};


function getHeadlines() {
    var turkeyHeadlines = [];
    var dfd = new _.Deferred();
    feed(turkey, function(err, articles) {
        if (!err) {
            // console.log(articles);
            for (i = 0; i < articles.length; i++) {
                // console.log(info.results.collection1[i].headline);
                turkey = articles[i].title;
                slicedTurkey = turkey.slice(0, turkey.indexOf(" - "));
                // escapedTitle = slicedTitle.replace(/'/g, "'")
                // in an array that's not going to work,
                // so let's save that technique for somewhere else.
                turkeyHeadlines.push(slicedTurkey)
            }
            dfd.resolve(turkeyHeadlines);
            // console.log(turkeyHeadlines);
        } else {
            dfd.reject();
        }
    });
    return dfd.promise();
}
// url = 'http://news.google.com/news?cf=all&hl=en&pz=1&ned=us&q=Turkey&output=rss';


// xray(url, 'title')
//   .write('results.json')

function turkeyAdjective(turkey) {
    tokenizedTurkey = r.tokenize(turkey);
    turkeyPos = r.getPosTags(tokenizedTurkey);
    // console.log(tokenizedTurkey);
    // console.log(turkeyPos);
    // console.log(turkeyPos[tokenizedTurkey.indexOf('Turkey') + 1]);
    if ((turkeyPos[tokenizedTurkey.indexOf('Turkey') + 1]) == "nnp") {
        return true;
    }
}

function tweet() {
    getHeadlines().then(function(turkeyHeadlines) {
        var turkeyHeadline = turkeyHeadlines.pickRemove();
        console.log(turkeyHeadline);
        if (turkeyHeadline.indexOf("Turkey") > -1 &&
            turkeyAdjective(turkeyHeadline) != true) {
            var aTurkeyHeadline = turkeyHeadline.replace("Turkey", "A Turkey");
            var aTurkeyHeadline = toTitleCase(aTurkeyHeadline);
            console.log(aTurkeyHeadline)
        } else {
            console.log("\"" + turkeyHeadline + "\" didn't really work... Looking for another Turkey...");
            tweet();
        }
    });
}

// function test() {
//     console.log(toTitleCase("Turkey's vote against Christmas"))
// }
tweet();

// setInterval(function() {
//     try {
//         tweet();
//     } catch (e) {
//         console.log(e);
//     }
// }, 60000 * 60);
