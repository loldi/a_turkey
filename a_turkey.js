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
            for (i = 0; i < articles.length; i++) {
                turkey = articles[i].title;
                slicedTurkey = turkey.slice(0, turkey.indexOf(" - "));
                turkeyHeadlines.push(slicedTurkey) 
            }
            dfd.resolve(turkeyHeadlines);  
        } else {
            dfd.reject();
        }
    });
    return dfd.promise();
}

function turkeyAdjective(turkey) {
    tokenizedTurkey = r.tokenize(turkey);
    turkeyPos = r.getPosTags(tokenizedTurkey);
    if ((turkeyPos[tokenizedTurkey.indexOf('Turkey') - 1]) == "jj") {
        return true;
    } else {
        return false;
    }
}

function turkeyName(turkey) {
    tokenizedTurkey = r.tokenize(turkey);
    turkeyPos = r.getPosTags(tokenizedTurkey);
    if ((turkeyPos[tokenizedTurkey.indexOf('Turkey') - 1]) == "nnp" || (turkeyPos[tokenizedTurkey.indexOf('Turkey') + 1]) == "nns" ) {
        return true;
    } else {
        return false;
    }
}


function tweet(){
    getHeadlines().then(function(turkeyHeadlines) {
        //run checks on the words before/after Turkey BEFORE generating a headline
        //add all the "good" headlines into a separate array and replace Turkey
        //then pick out a headline from that instead
        var filteredArray = [];
        for (i = 0; i < turkeyHeadlines.length; i++){
            if (turkeyAdjective(turkeyHeadlines[i]) != true && turkeyName(turkeyHeadlines[i]) != true && turkeyHeadlines[i].indexOf("Turkey") > -1){
                var aTurkeyHeadline = turkeyHeadlines[i].replace(/\\/g, '');
                var aTurkeyHeadline2 = turkeyHeadlines[i].replace("...", "");
                var replaced = aTurkeyHeadline2.replace("Turkey", "A Turkey");
                filteredArray.push(replaced);  
            } else {
                console.log("doesnt work checking next")
            }
        }
        var tweeted = filteredArray.pickRemove();
        console.log(tweeted);
    });
}


tweet();


// setInterval(function() {
//     try {
//         tweet();
//     } catch (e) {
//         console.log(e);
//     }
// }, 60000 * 60 * 12);
