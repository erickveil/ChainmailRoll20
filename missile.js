/**
 * missile.js
 * Erick Veil
 * 2018-03-29
 */


/**
 * For the chat listener
 * @param msg
 */
function eventMissileAttack(msg) {
    if (!(msg.type === "api" && msg.content.indexOf("!missile ") !== -1)) {
       return;
    }

    var argStr = msg.content.replace("!missile ", "");
    var argList = argStr.split(",");

    if (argList.length !== 2) {
        var logMsg = "Missile attack command takes 1 selected archer argument and "
            + "1 target argument.";
        var chatMsg = "Missile attack macro set up incorrectly."
        throw new roll20Exception(logMsg, chatMsg);
    }

    var selectedId = argList[0];
    var targetId = argList[1];

    missileAttack(selectedId, targetId, msg, false);
}

function eventIndirectMissileAttack(msg) {
    if (!(msg.type === "api" && msg.content.indexOf("!indirect ") !== -1)) {
       return;
    }

    var argStr = msg.content.replace("!indirect ", "");
    var argList = argStr.split(",");

    if (argList.length !== 2) {
        var logMsg = "Missile attack command takes 1 selected archer argument and "
            + "1 target argument.";
        var chatMsg = "Missile attack macro set up incorrectly."
        throw new roll20Exception(logMsg, chatMsg);
    }

    var selectedId = argList[0];
    var targetId = argList[1];

    missileAttack(selectedId, targetId, msg, true);
}

/**
 * Determines result of missile attacks
 * @param selectedId
 * @param targetId
 * @param msg
 * @param isIndirect
 */
function missileAttack(selectedId, targetId, msg, isIndirect) {
    var tokenType = "graphic";
    var archerToken = getObjectWithReport(tokenType, selectedId);
    var targetToken = getObjectWithReport(tokenType, targetId);
    clearLocalCasualties(archerToken, targetToken);
    var archerTroops = getTokenBarValue(archerToken, 1);
    var targetSheetId = getPropertyValue(targetToken, "represents");
    var targetUnitType = getAttributeWithError(targetSheetId, "Unit Type");
    var targetArmor = getTargetMissileAC(targetUnitType);

    // split number of troops vs AC 0 and 1
    var firingUnits = [];
    if (archerTroops <= 10) {
        firingUnits[0] = archerTroops;
    }
    else if (targetArmor === 2) {
        firingUnits[0] = archerTroops;
    }
    else if (archerTroops > 20) {
        sendChat(msg.who, css.error + "There are more than 20 troops in "
            + "this unit. Split unit before firing missile attacks." + css.spanEnd);
    }
    else {
        firingUnits[0] = Math.floor(archerTroops / 2);
        firingUnits[1] = archerTroops - firingUnits[0];
    }

    var damage = 0;
    for (var i = 0; i < firingUnits.length; ++i) {
        if (isIndirect) {
            damage += calcIndirectMissileDamage(firingUnits[i], msg, targetArmor, i + 1, targetToken);
        }
        else {
            damage += calcMissileDamage(firingUnits[i], msg, targetArmor, i + 1, targetToken);
        }
    }
    sendChat(msg.who, css.missile + "**Total missile damage: " + damage + "**" + css.spanEnd);
}

/**
 * Calculates the results of missile attack
 * @param numTroops
 * @param msg
 * @param targetArmor
 * @param unitNum
 * @param targetToken
 * @returns {number}
 */
function calcMissileDamage(numTroops, msg, targetArmor, unitNum, targetToken) {
    var roll = randomInteger(6);
    sendChat(msg.who, css.missile + "**Rolling 1d6: ``" + roll + "``" + css.spanEnd);
    var unitDamage = 0;
    if (targetArmor === 0) {
        unitDamage = getNoArmorMissileDamage(numTroops, roll);
    }
    else if (targetArmor === 1) {
        unitDamage = getHalfArmorMissileDamage(numTroops, roll);
    }
    else {
        unitDamage = getFullArmorMissileDamage(numTroops, roll);
    } // end armor 2
    sendChat(msg.who, css.missile + "Firing unit " + unitNum
        + " (" + numTroops + " troops)"
        + " does " + unitDamage + " damage." + css.spanEnd);
    applyCasualties(targetToken, unitDamage);
    calculateTroopLoss(msg, targetToken);
    heavyLossMoraleCheck(msg, targetToken);
    return unitDamage;
}

function calcIndirectMissileDamage(numTroops, msg, targetArmor, unitNum, targetToken) {
    var roll = randomInteger(6);
    sendChat(msg.who, css.indirectMissile + "**Rolling 1d6: ``" + roll + "``" + css.spanEnd);
    var unitDamage = 0;
    if (targetArmor === 0) {
        unitDamage = getHalfArmorMissileDamage(numTroops, roll);
    }
    else if (targetArmor === 1) {
        unitDamage = getFullArmorMissileDamage(numTroops, roll);
    }
    else {
        unitDamage = 0;
    } // end armor 2
    sendChat(msg.who, css.indirectMissile + "Firing unit " + unitNum
        + " (" + numTroops + " troops)"
        + " does " + unitDamage + " damage." + css.spanEnd);
    applyCasualties(targetToken, unitDamage);
    calculateTroopLoss(msg, targetToken);
    heavyLossMoraleCheck(msg, targetToken);
    return unitDamage;
}

/**
 * Gets the damage when firing missiles at targets in full armor
 * @param numTroops
 * @param roll
 * @returns {*}
 */
function getFullArmorMissileDamage(numTroops, roll) {
    var unitDamage;
    if (numTroops <= 3) {
        if (roll <= 4) { unitDamage = 0; }
        else { unitDamage = 0; }
    }
    else if (numTroops <= 4) {
        if (roll <= 4) { unitDamage = 0; }
        else { unitDamage = 1; }
    }
    else if (numTroops <= 12) {
        if (roll <= 4) { unitDamage = 1; }
        else { unitDamage = 2; }
    }
    else if (numTroops <= 16) {
        if (roll <= 4) { unitDamage = 2; }
        else { unitDamage = 3; }
    }
    else {
        if (roll <= 4) { unitDamage = 3; }
        else { unitDamage = 3; }
    }
    return unitDamage;
}

/**
 * Gets the damage when firing missiles at targets in half armor or shield
 * @param numTroops
 * @param roll
 * @returns {*}
 */
function getHalfArmorMissileDamage(numTroops, roll) {
    var unitDamage;
    if (numTroops <= 2) {
        if (roll <= 3) { unitDamage = 0; }
        else { unitDamage = 0; }
    }
    else if (numTroops <= 4) {
        if (roll <= 3) { unitDamage = 0; }
        else { unitDamage = 1; }
    }
    else if (numTroops <= 6) {
        if (roll <= 3) { unitDamage = 2; }
        else { unitDamage = 2; }
    }
    else if (numTroops <= 8) {
        if (roll <= 3) { unitDamage = 2; }
        else { unitDamage = 3; }
    }
    else {
        if (roll <= 3) { unitDamage = 3; }
        else { unitDamage = 3; }
    }
    return unitDamage;
}

/**
 * Gets the damage when firing missiles against unarmored units
 * @param numTroops
 * @param roll
 * @returns {*}
 */
function getNoArmorMissileDamage(numTroops, roll) {
    var unitDamage;
    if (numTroops <= 2) {
        if (roll <= 2) { unitDamage = 0; }
        else { unitDamage = 1; }
    }
    else if (numTroops <= 4) {
        if (roll <= 2) { unitDamage = 1; }
        else { unitDamage = 2; }
    }
    else if (numTroops <= 6) {
        if (roll <= 2) { unitDamage = 2; }
        else {
            unitDamage = 3;
        }
    }
    else if (numTroops <= 8) {
        if (roll <= 2) { unitDamage = 3; }
        else { unitDamage = 4; }
    }
    else {
        if (roll <= 2) { unitDamage = 4; }
        else { unitDamage = 5; }
    }
    return unitDamage;
}

/**
 * 0 = Unarmored
 * 1 = 1/2 Armor or Shield
 * 2 = Fully Armored
 * @param unitType
 */
function getTargetMissileAC(unitType) {
    if (unitType === "Light Foot"
        || unitType === "Light Horse"
        ) { return 1; }
    if (unitType === "Heavy Foot"
        || unitType === "Armored Foot"
        || unitType === "Medium Horse"
        || unitType === "Heavy Horse"
        ) { return 2; }
}



