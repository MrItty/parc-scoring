/********************************************************************
 * PARC Score Reporting
 *
 * Main UI Controller
 ********************************************************************/

const SPORTS = [
    "Box Tennis",
    "Spinminton",
    "Pickleball",
    "Table Tennis"
];

let eventData = {
    player: "",
    opponent: "",
    eventType: "",
    sport: "",
    matches: []
};

$(function () {

    initializePage();

});


function initializePage() {

    $("#playerName").on("input", function () {

        eventData.player = $(this).val().trim();
        updateReport();

    });

    $("#opponentName").on("input", function () {

        eventData.opponent = $(this).val().trim();
        updateReport();

    });

    $("#eventType").on("change", eventTypeChanged);

    $("#eventSport").on("change", tournamentSportChanged);

    $("#copyButton").on("click", copyReport);

    $("#resetButton").on("click", resetForm);

    $(document).on("input", ".scoreInput", scoreChanged);

    $(document)
        .on(
            "change",
            ".playedCheckbox",
            leaguePlayedChanged
    );

    initializeMatchDragging();

}

function eventTypeChanged() {

    eventData.eventType = $("#eventType").val();

    eventData.sport = "";

    eventData.matches = [];

    $("#matchesContainer").empty().addClass("hidden");

    $("#reportSection").addClass("hidden");

    $("#statusSection").addClass("hidden");

    if (eventData.eventType === "Tournament") {

        $("#sportSelector").removeClass("hidden");

    }
    else {

        $("#sportSelector").addClass("hidden");

        buildLeague();

    }

}


function tournamentSportChanged() {

    eventData.sport = $("#eventSport").val();

    if (eventData.sport === "")
        return;

    if (eventData.sport === "Multi Sport") {

        buildMultiSport();

    }
    else {

        buildTournament();

    }

}


function buildTournament() {

    eventData.matches = [
        createMatch(eventData.sport, 1),
        createMatch(eventData.sport, 2)
    ];

    renderMatches();

}

function buildMultiSport() {

    eventData.matches = [];

    SPORTS.forEach(function (sport, index) {

        eventData.matches.push(
            createMatch(sport, index + 1)
        );

    });

    renderMatches();

}

function buildLeague() {

    eventData.matches = [];

    SPORTS.forEach(function (sport, index) {

        let match = createMatch(sport, index + 1);

        match.optional = true;

        eventData.matches.push(match);

    });

    renderMatches();

}

function createMatch(sport, number) {

    return {

        matchNumber: number,

        sport: sport,

        optional: false,

	visible: true,

	played: true,

        sets: [
            createSet(),
            createSet(),
	    {
		...createSet(),
		visible: false
	    }
        ]

    };

}

function createSet() {

    return {

        you: "",
        opponent: "",
	visible: true,
        valid: false

    };

}

function renderMatches() {

    const container = $("#matchesContainer");

    container.empty();

    eventData.matches.forEach(match => {

	if (match.visible) {

            container.append(renderMatch(match));
	
	}

    });

    container.removeClass("hidden");

    updateStatus();

}


function renderMatch(match) {

    const title =
        (eventData.eventType === "League" ||
         eventData.sport === "Multi Sport")
            ? match.sport
            : `Match ${match.matchNumber}`;

    let html = `

        <div class="matchCard"
             data-match="${match.matchNumber}">

            ${(
		    eventData.eventType === "League" || 
		    eventData.sport === "Multi Sport"
            ) ? `
            <div class="matchHeader">

                <div>
            
	            <h3>${title}</h3>
                </div>

                <button
                    type="button"
                    class="dragHandle"
                    aria-label="Drag to reorder this match"
                    title="Drag to reorder">
        ☰
                </button>

            </div>

	    ` : `

	    <h3>${title}</h3>

	    `}


		${eventData.eventType === "League" ? `

<div class="playedToggle">

    <label>

        <input
            type="checkbox"
            class="playedCheckbox"

            data-match="${match.matchNumber}"

            ${match.played ? "checked" : ""}>

        Played

    </label>

</div>

` : ""}

    `;

    match.sets.forEach((set, index) => {

        if (set.visible) {

            html += renderSet(match, set, index);

        }

    });

    html += `

        </div>

    `;

    return html;

}


let draggedMatchNumber = null;


function initializeMatchDragging() {

    $(document)
        .on("pointerdown", ".dragHandle", matchDragStart);

    $(document)
        .on("pointermove", matchDragMove);

    $(document)
        .on("pointerup pointercancel", matchDragEnd);

}

function matchDragStart(event) {

    if (
        eventData.eventType !== "League" &&
        eventData.sport !== "Multi Sport"
    ) {
        return;
    }


    const card =
        $(this).closest(".matchCard");


    draggedMatchNumber =
        Number(card.data("match"));


    const rect =
        card[0].getBoundingClientRect();


    card.css(
        "--drag-width",
        `${rect.width}px`
    );


    card.data(
        "drag-offset-x",
        event.clientX - rect.left
    );


    card.data(
        "drag-offset-y",
        event.clientY - rect.top
    );


    card.css(
        "--drag-x",
        `${rect.left}px`
    );


    card.css(
        "--drag-y",
        `${rect.top}px`
    );


    card.addClass("dragging");


    event.preventDefault();

}

function matchDragMove(event) {

    if (draggedMatchNumber === null)
        return;


    const draggedCard =
        $(
            `.matchCard[data-match="${draggedMatchNumber}"]`
        );


    if (!draggedCard.length)
        return;


    const offsetX =
        draggedCard.data("drag-offset-x");


    const offsetY =
        draggedCard.data("drag-offset-y");


    const x =
        event.clientX - offsetX;


    const y =
        event.clientY - offsetY;


    draggedCard.css(
        "--drag-x",
        `${x}px`
    );


    draggedCard.css(
        "--drag-y",
        `${y}px`
    );


    const cards =
        $("#matchesContainer .matchCard")
            .not(draggedCard);


    let targetCard = null;


    cards.each(function () {

        const rect =
            this.getBoundingClientRect();


        const midpoint =
            rect.top + (rect.height / 2);


        if (event.clientY < midpoint) {

            targetCard = this;

            return false;

        }

    });


    cards.removeClass("dragOver");


    if (targetCard) {

        $(targetCard)
            .addClass("dragOver");

    }


    event.preventDefault();

}

function matchDragEnd(event) {

    if (draggedMatchNumber === null)
        return;


    const draggedCard =
        $(
            `.matchCard[data-match="${draggedMatchNumber}"]`
        );


    if (!draggedCard.length) {

        draggedMatchNumber = null;

        return;

    }


    const cards =
        $("#matchesContainer .matchCard")
            .not(draggedCard);


    let targetCard = null;


    cards.each(function () {

        const rect =
            this.getBoundingClientRect();


        const midpoint =
            rect.top + (rect.height / 2);


        if (event.clientY < midpoint) {

            targetCard = this;

            return false;

        }

    });


    draggedCard.removeClass("dragging");


    draggedCard.css(
        "--drag-x",
        ""
    );


    draggedCard.css(
        "--drag-y",
        ""
    );


    if (targetCard) {

        $(targetCard)
            .before(draggedCard);

    }
    else {

        $("#matchesContainer")
            .append(draggedCard);

    }


    $("#matchesContainer .matchCard")
        .removeClass("dragOver");


    reorderMatches();


    draggedMatchNumber = null;


    event.preventDefault();

}

function reorderMatches() {

    const orderedMatches = [];


    $("#matchesContainer .matchCard")
        .each(function () {

            const oldNumber =
                Number($(this).data("match"));


            const match =
                eventData.matches.find(
                    m => m.matchNumber === oldNumber
                );


            if (match)
                orderedMatches.push(match);

        });


    if (
        orderedMatches.length !==
        eventData.matches.length
    ) {
        return;
    }


    eventData.matches =
        orderedMatches;


    eventData.matches.forEach(
        function (match, index) {

            match.matchNumber =
                index + 1;

        }
    );


    updateMatchNumbers();


    updateReport();

}

function updateMatchNumbers() {

    $("#matchesContainer .matchCard")
        .each(function (index) {

            const matchNumber =
                index + 1;


            $(this)
                .attr(
                    "data-match",
                    matchNumber
                )
                .data(
                    "match",
                    matchNumber
                );


            /*
             * Update the visible Match # heading
             * only when this is a numbered
             * Multi Sport/League card.
             *
             * League/Multi Sport normally display
             * the sport name instead, so this
             * primarily keeps data attributes
             * synchronized.
             */

            $(this)
                .find(".setCard")
                .each(function () {

                    $(this)
                        .attr(
                            "data-match",
                            matchNumber
                        )
                        .data(
                            "match",
                            matchNumber
                        );

                });


            $(this)
                .find(".scoreInput")
                .each(function () {

                    $(this)
                        .attr(
                            "data-match",
                            matchNumber
                        )
                        .data(
                            "match",
                            matchNumber
                        );

                });


            $(this)
                .find(".playedCheckbox")
                .attr(
                    "data-match",
                    matchNumber
                )
                .data(
                    "match",
                    matchNumber
                );

        });

}

function renderSet(match, set, index) {

    const setNumber = index + 1;

    return `

<div
    class="setCard"
    data-match="${match.matchNumber}"
    data-set="${setNumber}">

    <h4>Set ${setNumber}</h4>
    <div class="setError hidden"></div>

    <div class="scoreGrid">

        <div></div>

        <div>You</div>

        <div>Opponent</div>

        <div>Score</div>

        <input
            type="number"
            min="0"
            class="${set.valid ? "scoreInput valid" : "scoreInput"}"

            data-match="${match.matchNumber}"
            data-set="${setNumber}"
            data-player="you"

            value="${set.you}">

        <input
            type="number"
            min="0"
            class="${set.valid ? "scoreInput valid" : "scoreInput"}"

            data-match="${match.matchNumber}"
            data-set="${setNumber}"
            data-player="opponent"

            value="${set.opponent}">

    </div>

</div>

`;

}

function scoreChanged() {

    const matchNumber =
        Number($(this).data("match"));

    const setNumber =
        Number($(this).data("set"));

    const player =
        $(this).data("player");

    const value =
        $(this).val();


    const match =
        eventData.matches.find(m =>
            m.matchNumber === matchNumber
        );


    if (!match)
        return;


    const set =
        match.sets[setNumber - 1];


    set[player] = value;


    validateSetInput(set);

    updateSetValidationMessage(
        match,
        setNumber
    );

    updateThirdSetVisibility(match);

    updateSetVisibility(match);


    updateSetDisplay(match, setNumber);


    updateMatchVisibility();


    checkTournamentProgress();


    updateReport();

}


function checkTournamentProgress() {

    if (eventData.eventType !== "Tournament")
        return;


    if (eventData.sport === "Multi Sport")
        return;


    const match1 =
        eventData.matches[0];

    const match2 =
        eventData.matches[1];


    const match1Winner =
        getMatchWinner(match1);

    const match2Winner =
        getMatchWinner(match2);


    // If either of the first two matches is incomplete,
    // Match 3 should not be available.
    if (!match1Winner || !match2Winner) {

        if (eventData.matches.length >= 3) {

            eventData.matches[2].visible = false;

            hideMatch(eventData.matches[2]);

        }

        return;

    }


    // Same player won both matches.
    // Tournament is over.
    if (match1Winner === match2Winner) {

        if (eventData.matches.length >= 3) {

            eventData.matches[2].visible = false;

            hideMatch(eventData.matches[2]);

        }

        return;

    }


    // The first two matches were split.
    // A third match is required.
    if (eventData.matches.length < 3) {

        const match3 =
            createMatch(
                eventData.sport,
                3
            );

        eventData.matches.push(match3);

    }


    eventData.matches[2].visible = true;

    showMatch(eventData.matches[2]);

}



function updateStatus() {

    let text = "";

    if (eventData.eventType === "Tournament") {

        if (eventData.sport !== "") {

            text =
                "Tournament • " +
                eventData.sport;

        }

    }
    else if (eventData.eventType === "League") {

        text = "League";

    }

    $("#eventStatus").text(text);

    $("#statusSection").removeClass("hidden");

}

function copyReport() {

    const text =
        $("#reportOutput").val();


    navigator.clipboard.writeText(text);

}


function resetForm() {

    location.reload();

}

function updateSetDisplay(match, setNumber) {

    const set =
        match.sets[setNumber - 1];


    const selector = 
        `.setCard[data-match="${match.matchNumber}"][data-set="${setNumber}"]`;


    const card =
        $(selector);


    if (!set.visible) {

        card.addClass("hidden");

        return;

    }


    card.removeClass("hidden");


    card.find(".scoreInput")
        .each(function () {

            const player =
                $(this).data("player");


            $(this).val(set[player]);


            if (set.valid) {

                $(this)
                    .addClass("valid")
                    .removeClass("invalid");

            }
            else {

                $(this)
                    .removeClass("valid");

            }

        });

}

function updateMatchVisibility() {

    eventData.matches.forEach(match => {

        if (match.visible) {

            showMatch(match);

        }
        else {

            hideMatch(match);

        }

    });

}

function updateSetVisibility(match) {

    match.sets.forEach((set, index) => {

        const setNumber = index + 1;

        const selector =
            `.setCard[data-match="${match.matchNumber}"][data-set="${setNumber}"]`;

        let card = $(selector);


        // Set does not exist in DOM yet
        if (card.length === 0 && set.visible) {

            const matchCard =
                $(`.matchCard[data-match="${match.matchNumber}"]`);


            matchCard.append(
                renderSet(
                    match,
                    set,
                    index
                )
            );


            card = $(selector);

        }


        if (card.length === 0)
            return;


        if (set.visible) {

            card.removeClass("hidden");

        }
        else {

            card.addClass("hidden");
            card
                .find(".setError")
                .text("")
                .addClass("hidden");
        
            card.removeClass("hasError");

        }

    });

}

function showMatch(match) {

    const selector =
        `.matchCard[data-match="${match.matchNumber}"]`;


    let card =
        $(selector);


    // Match has not yet been rendered
    if (card.length === 0) {

        $("#matchesContainer")
            .append(
                renderMatch(match)
            );


        return;

    }


    card.removeClass("hidden");

}


function hideMatch(match) {

    const selector =
        `.matchCard[data-match="${match.matchNumber}"]`;


    const card =
        $(selector);


    if (card.length === 0)
        return;


    card.addClass("hidden");

}


function updateReport() {

    const winner =
        getEventWinner();


    if (!winner) {

        $("#reportSection")
            .addClass("hidden");

	$("#reportOutput").val("");

        return;

    }


    const report =
        buildReport();


    $("#reportOutput")
        .val(report);


    $("#reportSection")
        .removeClass("hidden");

}

function buildReport() {

    const winner =
        getEventWinner();


    let loser;

    if (winner === "tie") {
        loser = "tie";
    }
    else {
        loser =
        winner === "you"
            ? "opponent"
            : "you";
    }


    let text = "";


    text +=
        `Winner: @${getPlayerName(winner)}\n`;


    text +=
        `Loser: @${getPlayerName(loser)}\n`;


    text +=
        `Event Type: ${eventData.eventType}\n`;


    if (eventData.eventType === "Tournament") {

        text +=
            `Event Sport: ${eventData.sport}\n`;

    }


    //text += "\n";


    getCompletedMatches()
        .forEach(match => {


            if (
                eventData.eventType === "League" ||
                eventData.sport === "Multi Sport"
            ) {

                text +=
                    `Match #${match.matchNumber} Sport: ${match.sport}\n`;

            }


            text +=
                `Match #${match.matchNumber} Score: `;


            text +=
                formatMatchScore(match, winner);


            text += "\n";


        });


    return text.trim();

}


function leaguePlayedChanged() {

    const matchNumber =
        Number($(this).data("match"));


    const match =
        eventData.matches.find(m =>
            m.matchNumber === matchNumber
        );


    if (!match)
        return;


    match.played =
        $(this).is(":checked");


    if (!match.played) {

        match.sets.forEach(set => {

            set.you = "";
            set.opponent = "";
            set.valid = false;

        });

    }


    updateMatchVisibility();

    match.sets.forEach((set, index) => {
    
        updateSetDisplay(match, index + 1);
    
    });

    updateReport();

}

function getPlayerName(player) {


    if (player === "tie")
        return "tie";


    return player === "you"
        ? eventData.player
        : eventData.opponent;

}



function updateSetValidationMessage(match, setNumber) {

    const set =
        match.sets[setNumber - 1];


    const card =
        $(`.setCard[data-match="${match.matchNumber}"][data-set="${setNumber}"]`);


    const error =
        card.find(".setError");


    card.removeClass("hasError");


    if (
        set.you === "" ||
        set.opponent === ""
    ) {

        error
            .addClass("hidden")
            .text("");

        return;

    }


    const you =
        Number(set.you);

    const opponent =
        Number(set.opponent);


    let message = "";


    const winner =
        Math.max(you, opponent);

    const loser =
        Math.min(you, opponent);


    if (winner < 11) {

        message =
            "One player must score at least 11.";

    }
    else if (winner === loser) {

        message =
            "A set cannot end in a tie.";

    }
    else if (winner === 11 && loser > 9) {

        message =
            "An 11-point win must be by at least 2.";

    }
    else if (winner > 11 && loser !== winner - 2) {

        message =
            "Scores above 11 must win by exactly 2.";

    }


    if (message === "") {

        error
            .addClass("hidden")
            .text("");

        return;

    }


    card.addClass("hasError");

    error
        .removeClass("hidden")
        .text(message);

}
