/**
 * melee.js
 * Manages Chainmail melee attacks
 */


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

function eventMeleeAttack(msg) {
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

        /*
        var selectedName = getPropertyValue(_selectedObj, "name");
        var targetName = getPropertyValue(_targetObj, "name");
        */

        _isMeleeAttacking = true;
        sendChat(msg.who, "/r " + numberOfDice + "d6>" + targetNumber);
            /*
        sendChat(msg.who, "/r " + numberOfDice + "d6>" + targetNumber
            + " **" + selectedName + " attacks " + targetName + "**");
            */

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
            /*
        sendChat(msg.who, "/r " + numberOfDice + "d6>" + targetNumber
            + " **" + targetName + " counter attacks " +  selectedName);
            */
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





