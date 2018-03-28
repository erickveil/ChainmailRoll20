/**
 * heavyCasualtyMorale.js
 * Erick Veil
 * 2018-03-27
 *
 * Morale check for when a side suffers heavy losses in a single
 * melee exchange.
 *
 * TODO: Set max casualties on missile attack also.
 * TODO: Subtract casualties from troops
 * TODO: See if missile attacks need any love.
 */

var currentlySavingUnitObj;
var currentSaveTarget;
var isRollingSave = false;

/**
 *
 * @param msg
 * @param unitObj
 */
function heavyLossMoraleCheck(msg, unitObj) {

    var casualties = getTokenBarValue(unitObj, 3);
    var threshold = getMaxCasualties(unitObj);
    unitObj.set("bar3_max", threshold);
    if (casualties <= threshold) { return; }

    var unitName = getPropertyValue(unitObj, "name");
    sendChat(msg.who, unitName + " has suffered massive casualties: "
        + casualties + " out of a maxumum of " + threshold);

    currentlySavingUnitObj = unitObj;
    currentSaveTarget = getTargetSave(unitObj);

    // Going with PRNG for now.
    var rollResult = randomInteger(6) + randomInteger(6);
    sendChat(msg.who, "Rolling 2d6 " + unitName
        + " save vs. massive casualties DC " + currentSaveTarget);
    resolveMassCasualtyCheck(msg, rollResult);
}

function getTargetSave(unitObj)
{
    var typeAttribute = "Unit Type";
    var sheetId = getPropertyValue(unitObj, "represents");
    var unitType = getAttributeWithError(sheetId, typeAttribute);
    if (unitType === "Light Foot"
        || unitType === "Peasant"
        || unitType === "Levies"
        || unitType === "Light Horse"
    ) {
        return 8;
    }
    else if (unitType === "Heavy Foot"
        || unittype === "Medium Horse"
    ) {
        return 7;
    }
    else if (unitType === "Armored Foot") {
        return 6;
    }
    else if (unitType === "Heavy Horse") {
        return 6;
    }
    else if (unitType === "Knight") {
        return 4;
    }

    var chatMsg = "Failed to recognize unit type for heavy loss morale check: "
        + unitType;
    var logMsg = "";
    throw new roll20Exception(logMsg, chatMsg);
}

function getMaxCasualties(unitObj)
{
    var typeAttribute = "Unit Type";
    var sheetId = getPropertyValue(unitObj, "represents");
    var unitType = getAttributeWithError(sheetId, typeAttribute);
    var maxTroops = getTokenBarMax(unitObj, 1);
    var targetLoss;
    if (unitType === "Light Foot"
        || unitType === "Peasant"
        || unitType === "Levies"
        || unitType === "Light Horse"
    ) {
        targetLoss = 1/4;
    }
    else if (unitType === "Heavy Foot"
        || unittype === "Medium Horse"
    ) {
        targetLoss = 1/3;
    }
    else if (unitType === "Armored Foot") {
        targetLoss = 1/3;
    }
    else if (unitType === "Heavy Horse") {
        targetLoss = 1/2;
    }
    else if (unitType === "Knight") {
        targetLoss = 1/2;
    }
    else {
        var chatMsg = "Failed to recognize unit type for heavy loss morale check: "
            + unitType;
        var logMsg = "";
        throw new roll20Exception(logMsg, chatMsg);
    }

    return Math.ceil(targetLoss * maxTroops);
}

/**
 * Handles the result of a morale role for massive casualties.
 *
 * @param msg
 * @param rollResult
 */
function resolveMassCasualtyCheck(msg, rollResult) {
        var unitName = getPropertyValue(currentlySavingUnitObj, "name");
        sendChat(msg.who, "Checking save: " + unitName + " rolled "
            + rollResult + " vs DC " + currentSaveTarget + ":");
        if (rollResult < currentSaveTarget) {
            sendChat(msg.who, unitName + " has surrendered!");
            var icon_surrender = "dead";
            currentlySavingUnitObj.set("status_" + icon_surrender, true);
        }
        else {
            sendChat(msg.who, unitName
                + " has passed their morale check for heavy losses!");
        }
}

/**
 * Event for attempting to use actual rolls from chat (Unused currently)
 * @param msg
 */
function eventMassiveCasualtyRoll(msg) {
    if (msg.type === "rollresult" && isRollingSave === true) {
        isRollingSave = false;
        var rollData = JSON.parse(msg.content);
        log(rollData);
        var rollResult = (rollData.total)*1;

        resolveMassCasualtyCheck(msg, rollResult);
    }
}

