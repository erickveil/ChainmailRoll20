/**
 * heavyCasualtyMorale.js
 * Erick Veil
 * 2018-03-27
 *
 * Morale check for when a side suffers heavy losses in a single
 * melee exchange.
 *
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

    if (isObjectWizard(unitObj)) { return; }
    if (isObjectFearless(unitObj)) { return; }

    var casualties = getTokenBarValue(unitObj, 3);
    var threshold = getMaxCasualties(unitObj);
    unitObj.set("bar3_max", threshold);
    if (casualties <= threshold) {
        return;
    }

    var unitName = getPropertyValue(unitObj, "name");
    sendChat(msg.who, css.morale + unitName + " has suffered **massive casualties**: "
        + casualties + " out of a maxumum of " + threshold + css.spanEnd);

    currentlySavingUnitObj = unitObj;
    currentSaveTarget = getTargetSave(unitObj);

    if (isDaylight() && isUnitLightSensitive(currentlySavingUnitObj)) {
        sendChat(msg.who, css.morale + unitName + " has poor morale in this light!" + css.spanEnd);
        ++currentSaveTarget;
    }

    // Determine if inspiring figure is nearby
    var isGetsBonus = isGetsLeadershipMoraleBonus(unitObj);
    if (isGetsBonus) {
        var leaderName = getLeaderName(unitObj);
        sendChat(msg.who, css.morale
            + unitName + " gets a **morale bonus** from " + leaderName
            + css.spanEnd);
    }

    var moraleBonus = (isGetsBonus) ? 1 : 0;
    var moraleStr = (isGetsBonus) ? "+1 " : "";

    // Going with PRNG for now.
    var rollResult = randomInteger(6) + randomInteger(6) + moraleBonus;
    sendChat(msg.who, css.morale
        + "Rolling 2d6 "
        + moraleStr
        + unitName
        + " save vs. massive casualties DC "
        + currentSaveTarget + css.spanEnd);
    resolveMassCasualtyCheck(msg, rollResult);
}

/**
 * Used when the wizard gets too close.
 * @param msg
 */
function eventFearMoraleCheck(msg) {
    if (!(msg.type === "api" && msg.content.indexOf("!fearMorale ") !== -1)) {
        return;
    }

    var argStr = msg.content.replace("!fearMorale ", "");
    // only one arg, and it should be @selected
    var argList = argStr.split(",");
    var unitName = argList[0];
    var selectedId = argList[1];

    var tokenType = "graphic";
    var savingObj = getObjectWithReport(tokenType, selectedId);

    if (isObjectWizard(savingObj)) { return; }
    if (isObjectFearless(savingObj)) { return; }

    currentlySavingUnitObj = savingObj;
    currentSaveTarget = getTargetSave(savingObj);

    if (isDaylight() && isUnitLightSensitive(currentlySavingUnitObj)) {
        sendChat(msg.who, css.morale + unitName + " has poor morale in this light!" + css.spanEnd);
        ++currentSaveTarget;
    }

    // Determine if inspiring figure is nearby
    var isGetsBonus = isGetsLeadershipMoraleBonus(savingObj);
    if (isGetsBonus) {
        var leaderName = getLeaderName(savingObj);
        sendChat(msg.who, css.morale
            + unitName + " gets a **morale bonus** from " + leaderName
            + css.spanEnd);
    }

    var moraleBonus = (isGetsBonus) ? 2 : 0;
    var moraleStr = (isGetsBonus) ? "+2 " : "";

    var rollResult = randomInteger(6) + randomInteger(6) + moraleBonus;
    sendChat(msg.who, css.morale
        + "Rolling 2d6 "
        + moraleStr
        + unitName
        + " save vs. fear DC "
        + currentSaveTarget
        + css.spanEnd);
    resolveMassCasualtyCheck(msg, rollResult);
}

function isFearless(obj) {
    return isObjectFearless(obj);
}

function getTargetSave(unitObj)
{
    var typeAttribute = "Unit Type";
    var sheetId = getPropertyValue(unitObj, "represents");
    //var unitType = getAttributeWithError(sheetId, typeAttribute);
    var unitType = getAttacksAs(sheetId);

    if (unitType === "Light Foot"
        || unitType === "Peasant"
        || unitType === "Levies"
        || unitType === "Light Horse"
    ) {
        return 8;
    }
    else if (unitType === "Heavy Foot"
        || unitType === "Medium Horse"
    ) {
        return 7;
    }
    else if (unitType === "Armored Foot"
        || unitType === "Wizard"
    ) {
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
    //var unitType = getAttributeWithError(sheetId, typeAttribute);
    var unitType = getAttacksAs(sheetId);
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
        || unitType === "Medium Horse"
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
    sendChat(msg.who, css.morale
        + "Checking save: **"
        + unitName
        + "** rolled "
        + css.rollValue
        + rollResult
        + css.endValue
        + " vs DC "
        + currentSaveTarget
        + ":"
        + css.spanEnd);
    if (rollResult < currentSaveTarget) {
        sendChat(msg.who, css.morale + unitName + " has **surrendered!**" + css.spanEnd);
        var icon_surrender = "dead";
        currentlySavingUnitObj.set("status_" + icon_surrender, true);
    }
    else {
        sendChat(msg.who, css.morale + unitName + " has **passed** their morale check!" + css.spanEnd);
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



