/**
 * heavyCasualtyMorale.js
 * Erick Veil
 * 2018-03-27
 *
 * Morale check for when a side suffers heavy losses in a single
 * melee exchange.
 *
 * TODO: This will be its own button:
 * TODO: Isolate function to get max casualties
 * TODO: On melee call getMaxCasualties, and set to max value on token before setting casualties.
 * TODO: Set max casualties on missile attack also.
 * TODO: Provide listener hook function to read msg and get API command for running heavy loss morale check.
 * TODO: On melee and missile attacks, recommend when a unit has gone over its max casualties to chat.
 * TODO: On melee, recommend to check melee morale after it is complete.
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
    var typeAttribute = "Unit Type";
    var sheetId = getPropertyValue(unitObj, "represents");
    var unitType = getAttributeWithError(sheetId, typeAttribute);
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

    var unitName = getPropertyValue(unitObj, "name");
    sendChat(msg.who, unitName + " has suffered massive casualties: "
        + casualties + " out of a maxumum of " + threshold);

    currentlySavingUnitObj = unitObj;
    currentSaveTarget = targetSave;
    isRollingSave = true;
    sendChat(msg.who, "/r 2d6 " + unitName
        + " save vs. massive casualties DC " + targetSave);

}

function eventMassiveCasualtyRoll(msg) {
    if (msg.type === "rollresult" && isRollingSave === true) {
        isRollingSave = false;

        var unitName = getPropertyValue(currentlySavingUnitObj, "name");
        var rollData = JSON.parse(msg.content);
        log(rollData);
        var rollResult = (rollData.total)*1;

        sendChat(msg.who, "Checking save: " + unitName + " rolled "
            + rollResult + " vs DC " + currentSaveTarget + ":");
        if (rollResult < currentSaveTarget) {
            sendChat(msg.who, unitName + " has surrendered!");
        }
        else {
            sendChat(msg.who, unitName
                + " has passed their morale check for heavy losses!");
        }
    }
}

