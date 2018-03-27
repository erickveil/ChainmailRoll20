/**
 * heavyCasualtyMorale.js
 * Erick Veil
 * 2018-03-27
 *
 * Morale check for when a side suffers heavy losses in a single
 * melee exchange.
 */


/**
 *
 * @param msg
 * @param unitObj
 */

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

