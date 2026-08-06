/********************************************************************
 * PARC Score Reporting
 *
 * Scoring Rules Engine
 ********************************************************************/

/*************************************************************
 * Returns:
 *
 *  "you"
 *  "opponent"
 *  null
 *************************************************************/
function getSetWinner(set) {

    const you = Number(set.you);
    const opponent = Number(set.opponent);

    if (isNaN(you) || isNaN(opponent))
        return null;

    if (!isValidSet(set))
        return null;

    return (you > opponent)
        ? "you"
        : "opponent";

}

/*************************************************************
 * Is this a legal PARC set?
 *************************************************************/
function isValidSet(set) {

    const you = Number(set.you);
    const opponent = Number(set.opponent);

    if (isNaN(you) || isNaN(opponent))
        return false;

    if (you < 0 || opponent < 0)
        return false;

    if (you === opponent)
        return false;

    const high = Math.max(you, opponent);
    const low = Math.min(you, opponent);

    if (high < 11)
        return false;

    if ((high - low) < 2)
        return false;

    if (high === 11 && low > 9)
        return false;

    return true;

}


function getSetWins(match) {

    let you = 0;
    let opponent = 0;

    match.sets.forEach(set => {

        const winner = getSetWinner(set);

        if (winner === "you")
            you++;

        if (winner === "opponent")
            opponent++;

    });

    return {

        you,
        opponent

    };

}

function needsThirdSet(match) {

    const first = getSetWinner(match.sets[0]);
    const second = getSetWinner(match.sets[1]);

    if (!first || !second)
        return false;

    return first !== second;

}

function getMatchWinner(match) {

    const wins = getSetWins(match);

    if (wins.you >= 2)
        return "you";

    if (wins.opponent >= 2)
        return "opponent";

    return null;

}

function isMatchComplete(match) {

    return getMatchWinner(match) !== null;

}

function getEventScore() {

    let you = 0;
    let opponent = 0;


    getCompletedMatches()
        .forEach(match => {

            const winner =
                getMatchWinner(match);


            if (winner === "you")
                you++;


            if (winner === "opponent")
                opponent++;

        });


    return {

        you,
        opponent

    };

}


function getEventWinner() {


    if (eventData.eventType === "Tournament") {

        if (!isTournamentComplete())
            return null;


        const score =
            getEventScore();


        if (score.you > score.opponent)
            return "you";


        if (score.opponent > score.you)
            return "opponent";


        return null;

    }



    if (eventData.eventType === "League") {

        if (!isLeagueComplete())
            return null;


        return getLeagueWinner();

    }


    return null;

}


function needsThirdMatch() {

    if (eventData.eventType !== "Tournament")
        return false;

    if (eventData.sport === "Multi Sport")
        return false;

    if (eventData.matches.length < 2)
        return false;

    const first = getMatchWinner(eventData.matches[0]);
    const second = getMatchWinner(eventData.matches[1]);

    if (!first || !second)
        return false;

    return first !== second;

}

function getPlayerName(which) {

    return which === "you"
        ? eventData.player
        : eventData.opponent;

}

function normalizeSetScore(set, matchWinner) {

    const you = Number(set.you);
    const opponent = Number(set.opponent);

    if (matchWinner === "you") {

        return `${Math.max(you, opponent)}-${Math.min(you, opponent)}`;

    }

    return `${Math.max(you, opponent)}-${Math.min(you, opponent)}`;

}

function updateThirdSetVisibility(match) {

    const firstWinner =
        getSetWinner(match.sets[0]);

    const secondWinner =
        getSetWinner(match.sets[1]);


    /*
       Until both first sets are complete,
       leave Set 3 alone.
    */

    if (!firstWinner || !secondWinner) {

        match.sets[2].visible = false;

        return;

    }


    /*
       Split sets = need Set 3
    */

    if (firstWinner !== secondWinner) {

        match.sets[2].visible = true;

    }

    else {

        match.sets[2].visible = false;

    }

}


function validateSetInput(set) {

    if (
        set.you === "" ||
        set.opponent === ""
    ) {

        set.valid = false;

        return false;

    }


    set.valid = isValidSet(set);

    return set.valid;

}



function formatSetScore(set, matchWinner) {

    if (matchWinner === "you") {

        return `${set.you}-${set.opponent}`;

    }


    return `${set.opponent}-${set.you}`;

}


function formatMatchScore(match) {

    const winner =
        getMatchWinner(match);


    if (!winner)
        return "";


    return match.sets

        .filter(set => set.visible)

        .filter(set => set.valid)

        .map(set =>
            formatSetScore(set, winner)
        )

        .join("; ");

}

function getCompletedMatches() {

    return eventData.matches.filter(match => {

        return match.visible &&
	       match.played &&
               getMatchWinner(match) !== null;

    });

}

function isTournamentComplete() {

    if (eventData.eventType !== "Tournament")
        return false;


    const score =
        getEventScore();


    if (eventData.sport === "Multi Sport") {

        return (
            getCompletedMatches().length === 4
        );

    }


    return (
        score.you === 2 ||
        score.opponent === 2
    );

}

function isLeagueComplete() {

    const completed =
        getCompletedMatches();


    return completed.length > 0;

}

function getLeagueStats() {

    const stats = {

        you: {
            matches: 0,
            sets: 0,
            points: 0
        },

        opponent: {
            matches: 0,
            sets: 0,
            points: 0
        }

    };


    getCompletedMatches()
        .forEach(match => {

            const winner =
                getMatchWinner(match);


            if (winner === "you")
                stats.you.matches++;


            if (winner === "opponent")
                stats.opponent.matches++;



            match.sets

                .filter(set => set.valid)

                .forEach(set => {


                    const youScore =
                        Number(set.you);


                    const opponentScore =
                        Number(set.opponent);



                    stats.you.points += youScore;

                    stats.opponent.points += opponentScore;



                    const setWinner =
                        getSetWinner(set);



                    if (setWinner === "you")
                        stats.you.sets++;


                    if (setWinner === "opponent")
                        stats.opponent.sets++;


                });

        });


    return stats;

}

function getLeagueWinner() {

    const stats =
        getLeagueStats();



    const categories = [

        "matches",

        "sets",

        "points"

    ];



    for (const category of categories) {


        if (
            stats.you[category] >
            stats.opponent[category]
        ) {

            return "you";

        }


        if (
            stats.opponent[category] >
            stats.you[category]
        ) {

            return "opponent";

        }

    }


    return "tie";

}


