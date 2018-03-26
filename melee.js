/**
 * melee.js
 * Manages Chainmail melee attacks
 */


/**
 * Set to true when listening for API triggered melee dice roll
 * Then immediately set false again so we don't capture any
 * other rolls.
 * @type {boolean}
 * @private
 */
var _isMeleeAttacking = false;

/**
 * Set to listen for counter attacks
 * @type {boolean}
 * @private
 */
var _isMeleeDefending = false;

/**
 * Gets set to the last selected object after a melee attack
 * @type {object}
 * @private
 */
var _selectedObj;

/**
 * Gets set to the last targeted object after a melee attack
 * @type {object}
 * @private
 */
var _targetObj;


/**
 * On Chat Listener
 */
on("chat:message", function(msg) {
    //meleeMorale(msg);
    try {
        meleeAttack(msg);
        meleeDiceListener(msg);
    }
    catch(err) {
        if (typeof err === "string") {
            log("String error caught: " + err);
        }
        else if (typeof err === "object" && typeof err.chatMsg !== "undefined") {
            log(err);
            sendChat(msg.who, err.chatMsg);
        }
        else if (typeof err === "undefined") {
            log("Threw an undefined exception: Probably forgot to use 'new'.");
        }
        else {
            log("Unknown error type: " + err);
        }
    }
});

function postCasualties(msg, unitObj)
{
    // check for dead unit before heavy loss

    // apply casualties
    // resolve melee morale
    // end of melee
    sendChat(msg.who, "Done");
}

function heavyLossMoraleCheck(msg, unitObj) {
    var typeAttribute = "Unit Type";
    var unitType = getAttributeWithError(unitObj, typeAttribute);
    var casualties = getTokenBarValue(unitObj, 3);
    var maxTroops = getTokenBarValue(unitObj, 1, "max");
    var targetLoss;
    var targetSave;
    if (unitType === "Light Foot"
        || unitType === "Peasant"
        || unitType === "Levies"
        || unitType === "Light Horse"
        ) {
        targetLoss = 1/4;
        targetSave = 8;
    }
    else if (unitType === "Heavy Foot"
        || unittype === "Medium Horse"
    ) {
        targetLoss = 1/3;
        targetSave = 7;
    }
    else if (unitType === "Armored Foot") {
        targetLoss = 1/3;
        targetSave = 6;
    }
    else if (unitType === "Heavy Horse") {
        targetLoss = 1/2;
        targetSave = 6;
    }
    else if (unitType === "Knight") {
        targetLoss = 1/2;
        targetSave = 4;
    }
    else {
        var chatMsg = "Failed to recognize unit type for heavy loss morale check: "
            + unitType;
        var logMsg = "";
        throw new roll20Exception(logMsg, chatMsg);
    }

    var threshold = Math.ceil(targetLoss * maxTroops);
    if (casualties <= threshold) { return; }

    sendChat(msg.who, "/r (2d6>" + targetSave + ") save vs. massive casualties");

}

/**
 * Listens for the dice rolled during a melee attack.
 *
 * Listening for dice this way, rather than using the sendChat callback, allows us to
 * show the dice rolls that we act on.
 *
 *  {
 *      "type":"V",
 *      "rolls":[{
 *          "type":"R",
 *          "dice":20,
 *          "sides":6,
 *          "mods":{
 *              "success":{
 *                  "comp":">=",
 *                  "point":6
 *              }
 *          },
 *          "results":[
 *              {"v":2},
 *              {"v":2},
 *              {"v":1},
 *              {"v":4},
 *              {"v":1},
 *              {"v":5},
 *              {"v":2},
 *              {"v":2},
 *              {"v":3},
 *              {"v":4},
 *              {"v":5},
 *              {"v":3},
 *              {"v":5},
 *              {"v":5},
 *              {"v":3},
 *              {"v":3},
 *              {"v":2},
 *              {"v":2},
 *              {"v":6},
 *              {"v":6}
 *          ]
 *      }],
 *      "resultType":"success",
 *      "total":2
 *  }
 *
 * @param msg
 */
function meleeDiceListener(msg) {
    var rollData;
    var kills;
    var priorCasualties;
    var totalCasualties;
    var barnum = 3;
    var casualtiesBarValue = "bar"+ barnum + "_value";
    var selectedName;
    var targetName;

    if (msg.type === "rollresult" && _isMeleeAttacking === true) {
        _isMeleeAttacking = false;
        selectedName = getPropertyValue(_selectedObj, "name");
        targetName = getPropertyValue(_targetObj, "name");
        rollData = JSON.parse(msg.content);
        kills = rollData.total;

        // add casualties to defender
        priorCasualties = getTokenBarValue(_targetObj, barnum);
        totalCasualties = (priorCasualties*1) + (kills*1);
        _targetObj.set(casualtiesBarValue, totalCasualties);

        // announce casualties
        sendChat(msg.who, selectedName + " attacks " + targetName + " and kills "
            + kills + " troops.");
        heavyLossMoraleCheck(msg, _targetObj);
    }
    else if (msg.type === "rollresult" && _isMeleeDefending === true) {
        _isMeleeDefending = false;
        selectedName = getPropertyValue(_selectedObj, "name");
        targetName = getPropertyValue(_targetObj, "name");
        rollData = JSON.parse(msg.content);
        kills = rollData.total;

        // add casualties to defender
        priorCasualties = getTokenBarValue(_selectedObj, barnum);
        totalCasualties = (priorCasualties*1) + (kills*1);
        _selectedObj.set(casualtiesBarValue, totalCasualties);

        // announce casualties
        sendChat(msg.who, targetName + " counterattacks " + selectedName + " and kills "
            + kills + " troops.");

        heavyLossMoraleCheck(msg, _selectedObj);

        postCasualties(msg);
    }

}

function meleeAttack(msg) {
    if (msg.type === "api" && msg.content.indexOf("!melee ") !== -1) {
        var argStr = msg.content.replace("!melee ", "");
        var argList = argStr.split(",");
        var format = "!melee @{selected|token_id},@{target|token_id},?{Are there less than 20 Units per side|Yes|No}";
        if (argList.length !== 3) {
            var logMsg = "Not enough argumentsin !melee command: " + msg.content;
            var chatMsg = "The !melee macro is set up incorrectly.";
            throw new roll20Exception(logMsg, chatMsg);
        }
        var selectedId = argList[0];
        var targetId = argList[1];
        var isLowUnits = argList[2] === "Yes";
        var tokenType = "graphic";
        _selectedObj = getObjectWithReport(tokenType, selectedId);
        _targetObj = getObjectWithReport(tokenType, targetId);
        var selectedSheetId = getPropertyValue(_selectedObj, "represents");
        var targetSheetId = getPropertyValue(_targetObj, "represents");
        var typeAttribute = "Unit Type";
        var selectedUnitType = getAttributeWithError(selectedSheetId, typeAttribute);
        var targetUnitType = getAttributeWithError(targetSheetId, typeAttribute);

        // TODO: these are affected by flanking
        var attackDiceFactor = getAttackDiceFactor(selectedUnitType, targetUnitType);
        var selectedTroops = getTokenBarValue(_selectedObj, 1);

        /* TODO: All troops formed in close order with pole arms can only take frontal melee
         * damage from like-armed troops.
         */
        var weaponAttribute = "Weapon";
        var selectedWeapon = getAttributeWithError(selectedSheetId, weaponAttribute);
        var pikeMod = (selectedWeapon === "Pike"
            || selectedWeapon === "Halbard"
            || selectedWeapon === "Pole"
            ) ? 1 : 0;
        var numberOfDice = Math.ceil(selectedTroops * attackDiceFactor) + pikeMod;

        var targetNumber = getAttackerTargetNumber(selectedUnitType, targetUnitType);

        // start attack dice roll listener
        _isMeleeAttacking = true;
        sendChat(msg.who, "/r " + numberOfDice + "d6>" + targetNumber);

        // counterattack:
        // TODO: affected by flanking
        attackDiceFactor = getAttackDiceFactor(targetUnitType, selectedUnitType);
        var targetTroops = getTokenBarValue(_targetObj, 1);
        // TODO: close order pole arms and frontal damage
        var targetWeapon = getAttributeWithError(targetSheetId, weaponAttribute);
        pikeMod = (targetWeapon === "Pike"
            || targetWeapon === "Halbard"
            || targetWeapon === "Pole"
            ) ? 1 : 0;
        numberOfDice = Math.ceil(targetTroops * attackDiceFactor) + pikeMod;
        targetNumber = getAttackerTargetNumber(targetUnitType, selectedUnitType);
        _isMeleeDefending = true;
        sendChat(msg.who, "/r " + numberOfDice + "d6>" + targetNumber);
    }
}

function getAttackerTargetNumber(selectedUnitType, targetUnitType) {

    var logMsg = "";
    var chatMsg = "Unrecognized target unit type: " + targetUnitType;

    if (selectedUnitType === "Light Foot") {
        if (targetUnitType === "Light Foot") { return 6; }
        if (targetUnitType === "Heavy Foot") { return 6; }
        if (targetUnitType === "Armored Foot") { return 6; }
        if (targetUnitType === "Light Horse") { return 6; }
        if (targetUnitType === "Medium Horse") { return 6; }
        if (targetUnitType === "Heavy Horse") { return 6; }
        throw new roll20Exception(logMsg, chatMsg);
    }
    else if (selectedUnitType === "Heavy Foot") {
        if (targetUnitType === "Light Foot") { return 5; }
        if (targetUnitType === "Heavy Foot") { return 6; }
        if (targetUnitType === "Armored Foot") { return 6; }
        if (targetUnitType === "Light Horse") { return 6; }
        if (targetUnitType === "Medium Horse") { return 6; }
        if (targetUnitType === "Heavy Horse") { return 6; }
        throw new roll20Exception(logMsg, chatMsg);
    }
    else if (selectedUnitType === "Armored Foot") {
        if (targetUnitType === "Light Foot") { return 4; }
        if (targetUnitType === "Heavy Foot") { return 5; }
        if (targetUnitType === "Armored Foot") { return 6; }
        if (targetUnitType === "Light Horse") { return 6; }
        if (targetUnitType === "Medium Horse") { return 6; }
        if (targetUnitType === "Heavy Horse") { return 6; }
        throw new roll20Exception(logMsg, chatMsg);
    }
    else if (selectedUnitType === "Light Horse") {
        if (targetUnitType === "Light Foot") { return 5; }
        if (targetUnitType === "Heavy Foot") { return 6; }
        if (targetUnitType === "Armored Foot") { return 6; }
        if (targetUnitType === "Light Horse") { return 6; }
        if (targetUnitType === "Medium Horse") { return 6; }
        if (targetUnitType === "Heavy Horse") { return 6; }
        throw new roll20Exception(logMsg, chatMsg);
    }
    else if (selectedUnitType === "Medium Horse") {
        if (targetUnitType === "Light Foot") { return 4; }
        if (targetUnitType === "Heavy Foot") { return 5; }
        if (targetUnitType === "Armored Foot") { return 6; }
        if (targetUnitType === "Light Horse") { return 5; }
        if (targetUnitType === "Medium Horse") { return 6; }
        if (targetUnitType === "Heavy Horse") { return 6; }
        throw new roll20Exception(logMsg, chatMsg);
    }
    else if (selectedUnitType === "Heavy Horse") {
        if (targetUnitType === "Light Foot") { return 5; }
        if (targetUnitType === "Heavy Foot") { return 5; }
        if (targetUnitType === "Armored Foot") { return 5; }
        if (targetUnitType === "Light Horse") { return 5; }
        if (targetUnitType === "Medium Horse") { return 5; }
        if (targetUnitType === "Heavy Horse") { return 6; }
        throw new roll20Exception(logMsg, chatMsg);
    }

    chatMsg = "Unrecognized selected unit type: " + selectedUnitType;
    throw new roll20Exception(logMsg, chatMsg);
}

/**
 * Appendix A - Get the number of melee dice to fire against a defender
 *
 * @param selectedUnitType
 * @param targetUnitType
 */
function getAttackDiceFactor(selectedUnitType, targetUnitType) {

    var logMsg = "";
    var chatMsg = "Unrecognized target unit type: " + targetUnitType;

    if (selectedUnitType === "Light Foot") {
        if (targetUnitType === "Light Foot") { return 1; }
        if (targetUnitType === "Heavy Foot") { return 1/2; }
        if (targetUnitType === "Armored Foot") { return 1/3; }
        if (targetUnitType === "Light Horse") { return 1/2; }
        if (targetUnitType === "Medium Horse") { return 1/3; }
        if (targetUnitType === "Heavy Horse") { return 1/4; }
        throw new roll20Exception(logMsg, chatMsg);
    }
    else if (selectedUnitType === "Heavy Foot") {
        if (targetUnitType === "Light Foot") { return 1; }
        if (targetUnitType === "Heavy Foot") { return 1; }
        if (targetUnitType === "Armored Foot") { return 1/2; }
        if (targetUnitType === "Light Horse") { return 1/2; }
        if (targetUnitType === "Medium Horse") { return 1/3; }
        if (targetUnitType === "Heavy Horse") { return 1/4; }
        throw new roll20Exception(logMsg, chatMsg);
    }
    else if (selectedUnitType === "Armored Foot") {
        if (targetUnitType === "Light Foot") { return 1; }
        if (targetUnitType === "Heavy Foot") { return 1; }
        if (targetUnitType === "Armored Foot") { return 1; }
        if (targetUnitType === "Light Horse") { return 1; }
        if (targetUnitType === "Medium Horse") { return 1/2; }
        if (targetUnitType === "Heavy Horse") { return 1/3; }
        throw new roll20Exception(logMsg, chatMsg);
    }
    else if (selectedUnitType === "Light Horse") {
        if (targetUnitType === "Light Foot") { return 2; }
        if (targetUnitType === "Heavy Foot") { return 2; }
        if (targetUnitType === "Armored Foot") { return 1; }
        if (targetUnitType === "Light Horse") { return 1; }
        if (targetUnitType === "Medium Horse") { return 1/2; }
        if (targetUnitType === "Heavy Horse") { return 1/3; }
        throw new roll20Exception(logMsg, chatMsg);
    }
    else if (selectedUnitType === "Medium Horse") {
        if (targetUnitType === "Light Foot") { return 2; }
        if (targetUnitType === "Heavy Foot") { return 2; }
        if (targetUnitType === "Armored Foot") { return 2; }
        if (targetUnitType === "Light Horse") { return 1; }
        if (targetUnitType === "Medium Horse") { return 1; }
        if (targetUnitType === "Heavy Horse") { return 1/2; }
        throw new roll20Exception(logMsg, chatMsg);
    }
    else if (selectedUnitType === "Heavy Horse") {
        if (targetUnitType === "Light Foot") { return 4; }
        if (targetUnitType === "Heavy Foot") { return 3; }
        if (targetUnitType === "Armored Foot") { return 2; }
        if (targetUnitType === "Light Horse") { return 2; }
        if (targetUnitType === "Medium Horse") { return 1; }
        if (targetUnitType === "Heavy Horse") { return 1; }
        throw new roll20Exception(logMsg, chatMsg);
    }

    chatMsg = "Unrecognized selected unit type: " + selectedUnitType;
    throw new roll20Exception(logMsg, chatMsg);
}

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
            var selectedObjs = getSelectedObjects(msg.selected);

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


function getSelectedObjects(selectedArray) {
    if (selectedArray.length !== 2) {
        var logMsg = "SelectedArray is invalid for 2 tokens: " + selectedArray;
        var chatMsg = "You must select two tokens before checking for morale. Try again.";
        throw new roll20Exception(logMsg, chatMsg);
    }
    return selectedArray;
}

/**
 * An exception with data for log and chat
 *
 * @param pLogMsg
 * @param pChatMsg
 */
function roll20Exception(pLogMsg, pChatMsg) {
    this.logMsg = pLogMsg;
    this.chatMsg = pChatMsg;
    this.exType = "roll20Exception";
}

/**
 * The most insane calculation for morale I have ever seen.
 * Written by Gary Gygax himself, I can't believe people actually
 * calculated this every single melee.
 *
 * @param sender
 * @param selectedObjList
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
        token[loser].set("status_" + icon_retreat, retreatRounds);
    }
    else if (scoreDiff >= 80 && scoreDiff <= 99) {
        sendChat(sender, "**" + names[loser] + "** rout 1 1/2 move");
        token[loser].set("status_" + icon_rout, retreatRounds);
    }
    else {
        sendChat(sender, "**" + names[loser] + "** surrenders. Remove unit from play.");
        token[loser].set("status_" + icon_surrender);
    }

    // TODO: auto clear casualties
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
 * Gets the value set to one of the three token bars
 *
 * @param tokenObj
 * @param barNum
 */
function getTokenBarValue(tokenObj, barNum) {
    return getPropertyValue(tokenObj, "bar" + barNum + "_value");
}

/**
 *
 * @param tokenObj
 * @param barNum
 * @returns {*}
 */
function getTokenBarMax(tokenObj, barNum) {
    return getPropertyValue(tokenObj, "bar" + barNum + "_max");
}

/**
 * Gets the value of an object property with validation
 *
 * @param obj
 * @param property
 * @returns {*}
 */
function getPropertyValue(obj, property) {
    var propVal = obj.get(property);

    if (typeof propVal === "undefined") {
        var logMsg = "Could not get property value " + property
            + " value from token:\n" + obj;
        var chatMsg = "Could not get property. Action failed";
        throw new roll20Exception(logMsg, chatMsg);
    }
    return propVal;
}

/**
 *
 * @param characterId
 * @param attribute
 * @param valueType
 * @returns {*}
 */
function getAttributeWithError(characterId, attribute, valueType)
{
    var attVal = getAttrByName(characterId, attribute, valueType);
    if (typeof attVal === "undefined") {
        var logMsg = "Could not find attribute " + attribute
            + " value from character id " + characterId;
        var chatMsg = "logMsg";
        throw new roll20Exception(logMsg, chatMsg);
    }
    return attVal;
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

/**
 * getObj wrapper with some validation and feedback.
 *
 * @param objType
 * @param objId
 * @returns {*}
 */
function getObjectWithReport(objType, objId) {
    var obj = getObj(objType, objId);
    if (typeof obj === "undefined") {
        var logMsg = "Could not find object type " + objType + " with id " + objId;
        var chatMsg = "Could not find the " + objType + " object.";
        throw new roll20Exception(logMsg, chatMsg);
    }
    return obj;
}

/**
 * Validates that an object has a _type property with a matching value.
 *
 * @param targetObj
 * @param tokenType
 */
function validateObjectType(targetObj, tokenType) {
    var propVal = getPropertyValue(targetObj, "_type");
    if (propVal === tokenType) { return; }
    var logVal = "Token type is incorrect. Actual: " + propVal + " Expected: "
        + tokenType;
    var chatVal = "Wrong object type: " + propVal + ". Should be " + tokenType;

    throw new roll20Exception(logVal, chatVal);
}



