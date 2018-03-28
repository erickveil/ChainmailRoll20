/**
 * meleeMorale.js
 * Erick Veil
 * 2018-03-27
 *
 * Calculates Chainmail Morale that happens after every melee exchange.
 *
 * @param msg
 */

function meleeMorale(msg) {
    if(msg.type === "api" && msg.content.indexOf("!melee") !== -1) {

        var argStr = msg.content.replace("!melee ", "");
        var argList = argStr.split(",");
        var isLowUnits;
        if (argList.length !== 1) {
            log("ERROR: melee api command takes 1 arguments.");
            isLowUnits = true;
        }
        else {
            isLowUnits = (argList[0] === "Yes");
        }


        /*
        var selectedId = argList[0];
        var targetId = argList[1];
        var tokenType = "graphic";
        var sheetType = "character";
        var tokenLink = "_defaulttoken";
        */
        if (typeof msg.selected === "undefined" || msg.selected.length !== 2) {
            sendChat(msg.who, "You need to select 2 tokens before you check morale between them");
            return;
        }

        try {
            var selectedObjs = validate2ItemsInList(msg.selected);

            // TODO: note and resolve heavy loss casualties

            resolveMeleeMorale(msg.who, selectedObjs, isLowUnits);
        }
        catch(err) {
            if (typeof err === "string") {
                log("String error caught: " + err);
            }
            else if (typeof err === "object" && typeof err.chatMsg !== "undefined") {
                log(err);
                sendChat(msg.who, err.chatMsg);
            }
            else {
                log("Unknown error type: " + err);
            }
        }
    }
}


/**
 * The most insane calculation for morale I have ever seen.
 * Written by Gary Gygax himself, I can't believe people actually
 * calculated this every single melee.
 *
 * @param sender msg.who. Name of the speaker.
 * @param selectedObjList array of 2 token IDs involved in the battle.
 * @param isLowUnits "yes" if there are "less than 20 units per side, "no" if not.
 */
function resolveMeleeMorale(sender, selectedObjList, isLowUnits) {

    // get the actual tokens referred to in chat
    var token = [];
    var tokenType = "graphic";
    token[0] = getObj(tokenType, selectedObjList[0]["_id"]);
    token[1] = getObj(tokenType, selectedObjList[1]["_id"]);

    // validate objects are graphics
    validateObjectType(token[0], tokenType);
    validateObjectType(token[1], tokenType);

    // announce the battle start
    var names = [];
    names[0] = getPropertyValue(token[0], "name");
    names[1] = getPropertyValue(token[1], "name");
    sendChat(sender, "**" +names[0] + "** and **" + names[1]
        + "** are engaged in a melee battle!");

    // get bar values from tokens
    var casualties = [];
    var maxCasualties = [];
    var troops = [];

    troops[0] = getTokenBarValue(token[0], 1);
    troops[1] =  getTokenBarValue(token[1], 1);
    casualties[0] =  getTokenBarValue(token[0], 3);
    casualties[1] =  getTokenBarValue(token[1], 3);
    maxCasualties[0] = getTokenBarMax(token[0], 1) / 3;
    maxCasualties[1] = getTokenBarMax(token[1], 1) / 3;

    var icon_retreat = "tread";
    var icon_rout = "broken-heart";
    var icon_surrender = "dead";

    announceMoraleFactors(sender, names[0], casualties[0], troops[0]);
    announceMoraleFactors(sender, names[1], casualties[1], troops[1]);

    // get side with fewer casualties
    var fewerCasualtiesSide = getSideWithFewerCasualties(casualties[0], casualties[1]);

    // get casualties difference
    var casualtyDiff = Math.abs(casualties[0] - casualties[1]);

    // award casualty score to side with lowest casualties
    var score = [];
    score[0] = 0;
    score[1] = 0;

    // nobody gets this in a tie
    if (casualtyDiff !== 0) {
        var dieResult = randomInteger(6);
        sendChat(sender, "**Rolling 1d6: ``" + dieResult + "``**");
        var casualtyBonus = (dieResult * casualtyDiff);
        score[fewerCasualtiesSide] += casualtyBonus;

        sendChat(sender, names[fewerCasualtiesSide] + " has suffered fewer casualties: +"
            + casualtyBonus + " casualty bonus.");
    }

    // get side with more troops and award difference
    var mostTroops = -1;
    if (troops[0] < troops[1]) { mostTroops = 1; }
    if (troops[0] > troops[1]) { mostTroops = 0; }
    var troopsDiff = Math.abs(troops[0] - troops[1]);

    // nobody gets this in a tie
    if (troopsDiff !== 0) {
        sendChat(sender, names[mostTroops] + " has the most troops: +"
            + troopsDiff + " troop bonus.");
        score[mostTroops] += troopsDiff;
    }

    // get character object for each token
    var sheetId = [];
    sheetId[0] = getPropertyValue(token[0], "represents");
    sheetId[1] = getPropertyValue(token[1], "represents");

    // get morale rating attribute from each character
    var moraleAttr = [];
    moraleAttr[0] = getAttrByName(sheetId[0], "Morale Rating");
    moraleAttr[1] = getAttrByName(sheetId[1], "Morale Rating");

    var survivalMorale = [];
    survivalMorale[0] = troops[0] * moraleAttr[0];
    survivalMorale[1] = troops[1] * moraleAttr[1];
    score[0] += survivalMorale[0];
    score[1] += survivalMorale[1];
    sendChat(sender, names[0] + " has a morale rating of "
        + moraleAttr[0] + " and their survivor morale is " + survivalMorale[0]);
    sendChat(sender, names[1] + " has a morale rating of "
        + moraleAttr[1] + " and their survivor morale is " + survivalMorale[1]);

    var lowMultiplier = isLowUnits === true ? 2 : 1;
    score[0] *= lowMultiplier;
    score[1] *= lowMultiplier;

    sendChat(sender, names[0] + " total morale score is **" + score[0] + "**");
    sendChat(sender, names[1] + " total morale score is **" + score[1] + "**");

    // get looser
    var winner;
    var loser;
    if (score[0] > score[1]) {
        winner = 0;
        loser = 1;
    }
    else if (score[0] < score[1]) {
        winner = 1;
        loser = 0;
    }
    else {
        sendChat(sender, "**No winner this round.**");
        return;
    }
    sendChat(sender, "**" + names[winner] + "** is the winner!");

    // get difference between scores
    var scoreDiff = Math.abs(score[0] - score[1]);

    // TODO: find a way to tally how many rounds the token has been in retreat/rout
    var retreatRounds=0;

    // look up difference on table and report losing side and result.
    if (scoreDiff < 20) {
        sendChat(sender, "**Melee continues.**");
    }
    else if (scoreDiff >= 20 && scoreDiff <= 39) {
        sendChat(sender, "**" + names[loser] + "** moves back 2 move, good order");
    }
    else if (scoreDiff >= 40 && scoreDiff <= 59) {
        sendChat(sender, "**" + names[loser] + "** moves back 1 move, good order");
    }
    else if (scoreDiff >= 60 && scoreDiff <= 79) {
        sendChat(sender, "**" + names[loser] + "** retreat 1 move");
        token[loser].set("status_" + icon_retreat, true, retreatRounds);
    }
    else if (scoreDiff >= 80 && scoreDiff <= 99) {
        sendChat(sender, "**" + names[loser] + "** rout 1 1/2 move");
        token[loser].set("status_" + icon_rout, true, retreatRounds);
    }
    else {
        sendChat(sender, "**" + names[loser] + "** surrenders. Remove unit from play.");
        token[loser].set("status_" + icon_surrender, true);
    }

    // TODO: auto clear casualties
}


/**
 *
 * @param selectedArray
 * @returns {*}
 */
function validate2ItemsInList(selectedArray) {
    if (selectedArray.length !== 2) {
        var logMsg = "SelectedArray is invalid for 2 tokens: " + selectedArray;
        var chatMsg = "You must select two tokens before checking for morale. Try again.";
        throw new roll20Exception(logMsg, chatMsg);
    }
    return selectedArray;
}

/**
 * @param selected
 * @param target
 * @returns {number}
 */
function getSideWithFewerCasualties(selected, target) {
    if (selected < target) { return 0; }
    if (selected > target) { return 1; }
}


/**
 *
 * @param speaker
 * @param tokenName
 * @param tokenCasualties
 * @param tokenTroops
 */
function announceMoraleFactors(speaker, tokenName, tokenCasualties, tokenTroops) {
    sendChat(speaker, tokenName + " has lost " + tokenCasualties + " troops this round and has " + tokenTroops + " troops remaining.");
}


