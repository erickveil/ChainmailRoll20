/**
 * melee.js
 * Manages Chainmail melee attacks
 */


/**
 * Gets set to the last selected object after a melee attack
 * @type {object}
 */
var selectedObj;

/**
 * Gets set to the last targeted object after a melee attack
 * @type {object}
 */
var targetObj;

function eventMeleeAttack(msg) {
    if (!(msg.type === "api" && msg.content.indexOf("!melee ") !== -1)) {
        return;
    }
    var argStr = msg.content.replace("!melee ", "");
    var argList = argStr.split(",");
    if (argList.length !== 2) {
        var logMsg = "Not enough arguments in !melee command: " + msg.content;
        var chatMsg = css.error + "The !melee macro is set up incorrectly." + css.spanEnd;
        throw new roll20Exception(logMsg, chatMsg);
    }
    var selectedId = argList[0];
    var targetId = argList[1];
    var tokenType = "graphic";

    selectedObj = getObjectWithReport(tokenType, selectedId);
    targetObj = getObjectWithReport(tokenType, targetId);

    //pingObject(selectedObj);
    tintAttacker(selectedObj);
    pingObject(targetObj);

    var selectedTroops = getTokenBarValue(selectedObj, 1);
    var targetTroops = getTokenBarValue(targetObj, 1);
    if (selectedTroops < 1) {
        sendChat(msg.who, css.error + "Cannot attack with a defeated unit! Remove it from play."
            + css.spanEnd);
        return;
    }
    if (targetTroops < 1) {
        sendChat(msg.who, "This unit is already defeated. Remove it from play and attack another.");
        return;
    }

    clearLocalCasualties(selectedObj, targetObj);
    frontalAttack(selectedTroops, targetTroops, msg);
}

function eventPolarmAdvantageAttack(msg) {
    if (!(msg.type === "api" && msg.content.indexOf("!pole ") !== -1)) {
        return;
    }
    var argStr = msg.content.replace("!pole ", "");
    var argList = argStr.split(",");
    if (argList.length !== 2) {
        var logMsg = "Not enough arguments in !melee command: " + msg.content;
        var chatMsg = css.error + "The !pole macro is set up incorrectly." + css.spanEnd;
        throw new roll20Exception(logMsg, chatMsg);
    }
    var selectedId = argList[0];
    var targetId = argList[1];
    var tokenType = "graphic";

    selectedObj = getObjectWithReport(tokenType, selectedId);
    targetObj = getObjectWithReport(tokenType, targetId);
    tintAttacker(selectedObj);
    pingObject(targetObj);
    var selectedTroops = getTokenBarValue(selectedObj, 1);
    var targetTroops = getTokenBarValue(targetObj, 1);
    if (selectedTroops < 1) {
        sendChat(msg.who, css.error + "Cannot attack with a defeated unit! Remove it from play." + css.spanEnd);
        return;
    }
    if (targetTroops < 1) {
        sendChat(msg.who, css.error + "This unit is already defeated. Remove it from play and attack another."
            + css.spanEnd);
        return;
    }

    clearLocalCasualties(selectedObj, targetObj);
    polearmAdvantageAttack(selectedTroops, msg);
}

function eventFlankAttack(msg) {
    if (!(msg.type === "api" && msg.content.indexOf("!flank ") !== -1)) {
        return;
    }
    var argStr = msg.content.replace("!flank ", "");
    var argList = argStr.split(",");
    if (argList.length !== 2) {
        var logMsg = "Not enough arguments in !melee command: " + msg.content;
        var chatMsg = css.error + "The !melee macro is set up incorrectly." + css.spanEnd;
        throw new roll20Exception(logMsg, chatMsg);
    }
    var selectedId = argList[0];
    var targetId = argList[1];
    var tokenType = "graphic";

    selectedObj = getObjectWithReport(tokenType, selectedId);
    targetObj = getObjectWithReport(tokenType, targetId);
    tintAttacker(selectedObj);
    pingObject(targetObj);
    var selectedTroops = getTokenBarValue(selectedObj, 1);
    var targetTroops = getTokenBarValue(targetObj, 1);
    if (selectedTroops < 1) {
        sendChat(msg.who, css.error + "Cannot attack with a defeated unit! Remove it from play." + css.spanEnd);

        return;
    }
    if (targetTroops < 1) {
        sendChat(msg.who, css.error + "This unit is already defeated. Remove it from play and attack another."
            + css.spanEnd);
        return;
    }

    clearLocalCasualties(selectedObj, targetObj);
    flankAttack(selectedTroops, targetTroops, msg);
}

function eventRearAttack(msg) {
    if (!(msg.type === "api" && msg.content.indexOf("!rear ") !== -1)) {
        return;
    }
    var argStr = msg.content.replace("!rear ", "");
    var argList = argStr.split(",");
    if (argList.length !== 2) {
        var logMsg = "Not enough arguments in !melee command: " + msg.content;
        var chatMsg = css.error + "The !melee macro is set up incorrectly." + css.spanEnd;
        throw new roll20Exception(logMsg, chatMsg);
    }
    var selectedId = argList[0];
    var targetId = argList[1];
    var tokenType = "graphic";

    selectedObj = getObjectWithReport(tokenType, selectedId);
    targetObj = getObjectWithReport(tokenType, targetId);
    tintAttacker(selectedObj);
    pingObject(targetObj);
    var selectedTroops = getTokenBarValue(selectedObj, 1);
    var targetTroops = getTokenBarValue(targetObj, 1);
    if (selectedTroops < 1) {
        sendChat(msg.who, css.error + "Cannot attack with a defeated unit! Remove it from play." + css.spanEnd);
        return;
    }
    if (targetTroops < 1) {
        sendChat(msg.who, css.error + "This unit is already defeated. Remove it from play and attack another."
            + css.spanEnd);
        return;
    }

    clearLocalCasualties(selectedObj, targetObj);
    isRearAttack = true;
    rearAttack(selectedTroops, msg);
}



// ---------------------------------------------------------------

/**
 * Performs the actual melee attack.
 * 
 * @param {*} msg 
 * @param {*} attackerToken 
 * @param {*} defenderToken 
 * @param {*} isCounterAttack if true will not recursively call a counter
 * @param {*} isFlankAttack if true will apply flanking bonuses
 */
function executeAttack(
    msg, 
    attackerToken, 
    defenderToken, 
    isCounterAttack,
    isFlankAttack
    ) {
    var attackSheetId = getPropertyValue(attackerToken, "represents");
    var defendSheetId = getPropertyValue(defenderToken, "represents");
    var attackerName = getPropertyValue(attackerToken, "name");
    var defenderName = getPropertyValue(defenderToken, "name");
    var chatTarget = msg.who;

    // peasants
    if (!isCounterAttack 
        && !isPeasantAttack(chatTarget, attackerToken, defenderToken)) {
        return;
    }
    if (isCounterAttack
        && !isPeasantDefend(chatTarget, attackerToken, defenderToken)) {
        return;
    }

    // fantasy opponents use fantasy table
    if (isFantasyToken(attackSheetId) && isFantasyToken(defendSheetId)) {
        var NOT_RANGED = false;
        doFantasyBattle(chatTarget, attackerToken, defenderToken, NOT_RANGED);
        return;
    }

    // darkness effects
    if (isCombatAffectedByDarkness(attackerToken, defenderToken)) {
        doDarknessEffect(chatTarget, attackerToken, defenderToken);
        return;
    }
    doDarknessEffect(chatTarget, attackerToken, defenderToken);
    // end darkness effects

    var attacksAs = getAttacksAs(attackSheetId);
    var defendsAs = getDefendsAs(defendSheetId);

    // calculate base to hit
    var toHit;  
    if (isFlankAttack) {
        toHit = getFlankerTargetNumber(attacksAs, defendsAs);
    }
    else if (isWaterborn(attackSheetId) && isInWater(defenderToken)) {
        toHit = getWaterbornToHit(chatTarget, attackerToken, toHit, defendsAs);
    }
    else {
        toHit = getAttackerTargetNumber(attacksAs, defendsAs);
    }


    var rollMod = 0;
    rollMod += getRangerBonus(attackSheetId);

    // Water elemental attack as heavy horse in water only
    if (isWaterborn(attackSheetId) && isInWater(attackerToken)) { 
        attacksAs = "Heavy Horse"; 
    }

    // Air elements attack bonus to flying
    toHit += getAirbornToHitMod(chatTarget, attackerToken, defenderToken);

    // Earth elemental attack bonus to ground units
    toHit += getEarthbornToHitMod(chatTarget, attackerToken, defenderToken);

    // magic sword bonus
    var magicSwordBonus = getMagicSwordBonus(chatTarget, attackSheetId, attackerName);
    rollMod += magicSwordBonus;

    // immune to normal attacks
    if (isHasMeleeImmunity(chatTarget, attackSheetId, defendSheetId, defenderName)) {
        return;
    }

    // magic armor
    toHit += getMagicArmorBonus(chatTarget, defendSheetId, defenderName);

    // sunlight sickness
    if (isSunSicknessApplies(chatTarget, attackerToken)) { --rollMod; }

    // wizards of lesser type and other misc mods
    var armorMod = getAttribute(defendSheetId, "Armor Mod");
    armorMod = armorMod === "" ? 0 : parseInt(armorMod);
    toHit += armorMod;
    var attackMod = getAttribute(attackSheetId, "Attack Mod");
    attackMod = attackMod === "" ? 0 : parseInt(attackMod);
    rollMod += attackMod;

    // commander inspiration
    if (isGetsLeadershipCombatBonus(attackerToken)) {
        ++toHit;
        var commanderName = getCommanderName(attackerToken);
        sendChat(chatTarget, css.attack + attackerName 
            + " gets an attack bonus from " + commanderName);
    }

    var targetNumber = toHit - rollMod;
    if (targetNumber < 0) { targetNumber = 0; }

    // calculate number of dice to roll
    var attackDiceFactor = (isFlankAttack)
        ? getFlankerDiceFactor(attacksAs, defendsAs)
        : getAttackDiceFactor(attacksAs, defendsAs);
    var attackerTroops = getTokenBarValue(attackerToken, 1);
    var attackWeapon = getAttribute(attackSheetId, "Weapon");
    var pikeMod = (attackWeapon.toLowerCase() === "pike"
        || attackWeapon.toLowerCase() === "halbard"
        || attackWeapon.toLowerCase() === "pole"
        ) ? 1 : 0;
    var numberOfDice = Math.ceil(attackerTroops * attackDiceFactor) 
        + pikeMod + magicSwordBonus;

    // Elves with magic weapons vs certain creatures get more dice:
    if (isFey(attackSheetId) 
        && isHasMagicSword(attackSheetId)
        && isOrc(defendSheetId)
    ) {
        sayFeyFantasyAttackLine(chatTarget, attackerName, 
            defenderName, getMagicSwordName(attackSheetId));
        numberOfDice += 2;
    }
    else if (isFey(attackSheetId) 
        && isHasMagicSword(attackSheetId)
        && isGoblin(defendSheetId)
    ) {
        sayFeyFantasyAttackLine(chatTarget, attackerName, 
            defenderName, getMagicSwordName(attackSheetId));
        numberOfDice += 3;
    }
    else if (isFey(attackSheetId)
        && isHasMagicSword(attackSheetId)
        && isFeyFantasyTarget(defendSheetId)
    ) {
        sayFeyFantasyAttackLine(chatTarget, attackerName, 
            defenderName, getMagicSwordName(attackSheetId));
        doFantasyBattle(chatTarget, attackerToken, defenderToken, false);
        return;
    }

    // do the roll
    sendChat(chatTarget,  "/r " + numberOfDice + "d6>" + targetNumber 
        + " " + attackerName);

    // counter attack required unless this is the counter attack
    if (!isCounterAttack) {
        var DO_COUNTER_ATTACK = true;
        var NOT_FLANK = false;
        executeAttack(msg, defenderToken, attackerToken, DO_COUNTER_ATTACK, NOT_FLANK);
    }
}

/*
function isFantasyTarget(targetUnitType, sheetId) {
    if (
           targetUnitType === "Wizard"
           || targetUnitType === "Fire Elemental"
           || targetUnitType === "Earth Elemental"
           || targetUnitType === "Air Elemental"
           || targetUnitType === "Water Elemental"
    ) { return true; }
    return isAttrSetTrue(sheetId, "Fantasy");
}
*/

function frontalAttack(selectedTroops, targetTroops, msg) {
    // from global value
    var attackerToken = selectedObj;
    // from global value
    var defenderToken = targetObj;
    var NOT_COUNTER = false;
    var NOT_FLANK = false;
    executeAttack(msg, attackerToken, defenderToken, NOT_COUNTER, NOT_FLANK);
}

/**
 * All troops formed in close order with pole arms can ony take frontal melee 
 * damage from like-armed troops.
 * @param selectedTroops
 * @param msg
 */
function polearmAdvantageAttack(selectedTroops, msg) {
    // though not rear, this triggers a morale check without a counter attack
    isRearAttack = true;
    // from global value
    var attackerToken = selectedObj;
    // from global value
    var defenderToken = targetObj;
    var NO_COUNTER_ALLOWED = true;
    var NOT_FLANK = false;
    executeAttack(msg, attackerToken, defenderToken, NO_COUNTER_ALLOWED, NOT_FLANK);
}

function flankAttack(selectedTroops, targetTroops, msg) {
    // from global value
    var attackerToken = selectedObj;
    // from global value
    var defenderToken = targetObj;
    var NOT_COUNTER = false;
    var IS_FLANK = false;
    executeAttack(msg, attackerToken, defenderToken, NOT_COUNTER, IS_FLANK);
}

function rearAttack(selectedTroops, msg) {
    // from global value
    var attackerToken = selectedObj;
    // from global value
    var defenderToken = targetObj;
    var NO_COUNTER_ALLOWED = true;
    var IS_FLANK = false;
    executeAttack(msg, attackerToken, defenderToken, NO_COUNTER_ALLOWED, IS_FLANK);
}

// ---------------------------------------------------------------

function isDaylight() {
    var battleField = getBattlefieldSheet();
    var battleFieldId = getPropertyValue(battleField, "id");
    var lightLevel = getAttributeWithError(battleFieldId, "Light Level");
    return (parseInt(lightLevel) === 2);
}

function isDarkness() {
    var battleField = getBattlefieldSheet();
    var battleFieldId = getPropertyValue(battleField, "id");
    var lightLevel = getAttributeWithError(battleFieldId, "Light Level");
    return (parseInt(lightLevel) === 0);
}

function isUnitLightSensitive(tokenObj) {
    var sheetId = getPropertyValue(tokenObj, "represents");
    if (!isHasAttribute(sheetId, "Light Sensitive")) { return false; }
    var sensitivity = getAttributeWithError(sheetId, "Light Sensitive");
    return (parseInt(sensitivity) === 1);
}

function getBattlefieldSheet() {
    var searchList = findObjs({
        type: "character",
        name: "Battlefield Settings"
    });
    if (searchList.length === 0) {
        var msg = "Cannot find the Battlefield Settings";
        throw new roll20Exception(msg, css.error + msg + css.spanEnd);
    }
    return searchList[0];
}

function getAttackerTargetNumber(selectedUnitType, targetUnitType) {

    var logMsg = "";
    var chatMsg = "A. Unrecognized target unit type: " + targetUnitType;

    if (selectedUnitType === "Light Foot") {
        if (targetUnitType === "Light Foot") { return 6; }
        if (targetUnitType === "Heavy Foot") { return 6; }
        if (targetUnitType === "Armored Foot") { return 6; }
        if (targetUnitType === "Wizard") { return 6; }
        if (targetUnitType === "Light Horse") { return 6; }
        if (targetUnitType === "Medium Horse") { return 6; }
        if (targetUnitType === "Fire Elemental") { return 6; }
        if (targetUnitType === "Heavy Horse") { return 6; }
        throw new roll20Exception(logMsg, chatMsg);
    }
    else if (selectedUnitType === "Heavy Foot") {
        if (targetUnitType === "Light Foot") { return 5; }
        if (targetUnitType === "Heavy Foot") { return 6; }
        if (targetUnitType === "Armored Foot") { return 6; }
        if (targetUnitType === "Wizard") { return 6; }
        if (targetUnitType === "Light Horse") { return 6; }
        if (targetUnitType === "Medium Horse") { return 6; }
        if (targetUnitType === "Fire Elemental") { return 6; }
        if (targetUnitType === "Heavy Horse") { return 6; }
        throw new roll20Exception(logMsg, chatMsg);
    }
    else if (selectedUnitType === "Armored Foot") {
        if (targetUnitType === "Light Foot") { return 4; }
        if (targetUnitType === "Heavy Foot") { return 5; }
        if (targetUnitType === "Armored Foot") { return 6; }
        if (targetUnitType === "Wizard") { return 6; }
        if (targetUnitType === "Light Horse") { return 6; }
        if (targetUnitType === "Medium Horse") { return 6; }
        if (targetUnitType === "Fire Elemental") { return 6; }
        if (targetUnitType === "Heavy Horse") { return 6; }
        throw new roll20Exception(logMsg, chatMsg);
    }
    else if (selectedUnitType === "Wizard") {
        if (targetUnitType === "Light Foot") { return 4; }
        if (targetUnitType === "Heavy Foot") { return 5; }
        if (targetUnitType === "Armored Foot") { return 6; }
        if (targetUnitType === "Wizard") { return 6; }
        if (targetUnitType === "Light Horse") { return 6; }
        if (targetUnitType === "Medium Horse") { return 6; }
        if (targetUnitType === "Fire Elemental") { return 6; }
        if (targetUnitType === "Heavy Horse") { return 6; }
        throw new roll20Exception(logMsg, chatMsg);
    }
    else if (selectedUnitType === "Light Horse") {
        if (targetUnitType === "Light Foot") { return 5; }
        if (targetUnitType === "Heavy Foot") { return 6; }
        if (targetUnitType === "Armored Foot") { return 6; }
        if (targetUnitType === "Wizard") { return 6; }
        if (targetUnitType === "Light Horse") { return 6; }
        if (targetUnitType === "Medium Horse") { return 6; }
        if (targetUnitType === "Fire Elemental") { return 6; }
        if (targetUnitType === "Heavy Horse") { return 6; }
        throw new roll20Exception(logMsg, chatMsg);
    }
    else if (selectedUnitType === "Medium Horse" || selectedUnitType === "Fire Elemental") {
        if (targetUnitType === "Light Foot") { return 4; }
        if (targetUnitType === "Heavy Foot") { return 5; }
        if (targetUnitType === "Armored Foot") { return 6; }
        if (targetUnitType === "Wizard") { return 6; }
        if (targetUnitType === "Light Horse") { return 5; }
        if (targetUnitType === "Medium Horse") { return 6; }
        if (targetUnitType === "Fire Elemental") { return 6; }
        if (targetUnitType === "Heavy Horse") { return 6; }
        throw new roll20Exception(logMsg, chatMsg);
    }
    else if (selectedUnitType === "Heavy Horse") {
        if (targetUnitType === "Light Foot") { return 5; }
        if (targetUnitType === "Heavy Foot") { return 5; }
        if (targetUnitType === "Armored Foot") { return 5; }
        if (targetUnitType === "Wizard") { return 5; }
        if (targetUnitType === "Light Horse") { return 5; }
        if (targetUnitType === "Medium Horse") { return 5; }
        if (targetUnitType === "Fire Elemental") { return 5; }
        if (targetUnitType === "Heavy Horse") { return 6; }
        throw new roll20Exception(logMsg, chatMsg);
    }

    chatMsg = "B. Unrecognized selected unit type: " + selectedUnitType;
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
    var chatMsg = "C. Unrecognized target unit type: " + targetUnitType;

    if (selectedUnitType === "Light Foot") {
        if (targetUnitType === "Light Foot") { return 1; }
        if (targetUnitType === "Heavy Foot") { return 1/2; }
        if (targetUnitType === "Armored Foot") { return 1/3; }
        if (targetUnitType === "Wizard") { return 1/3; }
        if (targetUnitType === "Light Horse") { return 1/2; }
        if (targetUnitType === "Medium Horse") { return 1/3; }
        if (targetUnitType === "Fire Elemental") { return 1/3; }
        if (targetUnitType === "Heavy Horse") { return 1/4; }
        throw new roll20Exception(logMsg, chatMsg);
    }
    else if (selectedUnitType === "Heavy Foot") {
        if (targetUnitType === "Light Foot") { return 1; }
        if (targetUnitType === "Heavy Foot") { return 1; }
        if (targetUnitType === "Armored Foot") { return 1/2; }
        if (targetUnitType === "Wizard") { return 1/2; }
        if (targetUnitType === "Light Horse") { return 1/2; }
        if (targetUnitType === "Medium Horse") { return 1/3; }
        if (targetUnitType === "Fire Elemental") { return 1/3; }
        if (targetUnitType === "Heavy Horse") { return 1/4; }
        throw new roll20Exception(logMsg, chatMsg);
    }
    else if (selectedUnitType === "Armored Foot") {
        if (targetUnitType === "Light Foot") { return 1; }
        if (targetUnitType === "Heavy Foot") { return 1; }
        if (targetUnitType === "Armored Foot") { return 1; }
        if (targetUnitType === "Wizard") { return 1; }
        if (targetUnitType === "Light Horse") { return 1; }
        if (targetUnitType === "Medium Horse") { return 1/2; }
        if (targetUnitType === "Fire Elemental") { return 1/2; }
        if (targetUnitType === "Heavy Horse") { return 1/3; }
        throw new roll20Exception(logMsg, chatMsg);
    }
    else if (selectedUnitType === "Wizard") {
        if (targetUnitType === "Light Foot") { return 1; }
        if (targetUnitType === "Heavy Foot") { return 1; }
        if (targetUnitType === "Armored Foot") { return 1; }
        if (targetUnitType === "Wizard") { return 1; }
        if (targetUnitType === "Light Horse") { return 1; }
        if (targetUnitType === "Medium Horse") { return 1/2; }
        if (targetUnitType === "Fire Elemental") { return 1/2; }
        if (targetUnitType === "Heavy Horse") { return 1/3; }
        throw new roll20Exception(logMsg, chatMsg);
    }
    else if (selectedUnitType === "Light Horse") {
        if (targetUnitType === "Light Foot") { return 2; }
        if (targetUnitType === "Heavy Foot") { return 2; }
        if (targetUnitType === "Armored Foot") { return 1; }
        if (targetUnitType === "Wizard") { return 1; }
        if (targetUnitType === "Light Horse") { return 1; }
        if (targetUnitType === "Medium Horse") { return 1/2; }
        if (targetUnitType === "Fire Elemental") { return 1/2; }
        if (targetUnitType === "Heavy Horse") { return 1/3; }
        throw new roll20Exception(logMsg, chatMsg);
    }
    else if (selectedUnitType === "Medium Horse" || selectedUnitType === "Fire Elemental") {
        if (targetUnitType === "Light Foot") { return 2; }
        if (targetUnitType === "Heavy Foot") { return 2; }
        if (targetUnitType === "Armored Foot") { return 2; }
        if (targetUnitType === "Wizard") { return 2; }
        if (targetUnitType === "Light Horse") { return 1; }
        if (targetUnitType === "Medium Horse") { return 1; }
        if (targetUnitType === "Fire Elemental") { return 1; }
        if (targetUnitType === "Heavy Horse") { return 1/2; }
        throw new roll20Exception(logMsg, chatMsg);
    }
    else if (selectedUnitType === "Heavy Horse") {
        if (targetUnitType === "Light Foot") { return 4; }
        if (targetUnitType === "Heavy Foot") { return 3; }
        if (targetUnitType === "Armored Foot") { return 2; }
        if (targetUnitType === "Wizard") { return 2; }
        if (targetUnitType === "Light Horse") { return 2; }
        if (targetUnitType === "Medium Horse") { return 1; }
        if (targetUnitType === "Fire Elemental") { return 1; }
        if (targetUnitType === "Heavy Horse") { return 1; }
        throw new roll20Exception(logMsg, chatMsg);
    }

    chatMsg = "D. Unrecognized selected unit type: " + selectedUnitType;
    throw new roll20Exception(logMsg, chatMsg);
}

function getFlankerTargetNumber(selectedUnitType, targetUnitType) {

    var logMsg = "";
    var chatMsg = "E. Unrecognized target unit type: " + targetUnitType;

    if (selectedUnitType === "Light Foot") {
        if (targetUnitType === "Light Foot") { return 5; }
        if (targetUnitType === "Heavy Foot") { return 6; }
        if (targetUnitType === "Armored Foot") { return 6; }
        if (targetUnitType === "Wizard") { return 6; }
        if (targetUnitType === "Light Horse") { return 6; }
        if (targetUnitType === "Medium Horse") { return 6; }
        if (targetUnitType === "Fire Elemental") { return 6; }
        if (targetUnitType === "Heavy Horse") { return 6; }
        throw new roll20Exception(logMsg, chatMsg);
    }
    else if (selectedUnitType === "Armored Foot"
        || selectedUnitType === "Heavy Foot"
        || selectedUnitType === "Wizard"
    ) {
        if (targetUnitType === "Light Foot") { return 4; }
        if (targetUnitType === "Heavy Foot") { return 5; }
        if (targetUnitType === "Armored Foot") { return 6; }
        if (targetUnitType === "Wizard") { return 6; }
        if (targetUnitType === "Light Horse") { return 6; }
        if (targetUnitType === "Medium Horse") { return 6; }
        if (targetUnitType === "Fire Elemental") { return 6; }
        if (targetUnitType === "Heavy Horse") { return 6; }
        throw new roll20Exception(logMsg, chatMsg);
    }
    else if (selectedUnitType === "Light Horse") {
        if (targetUnitType === "Light Foot") { return 4; }
        if (targetUnitType === "Heavy Foot") { return 5; }
        if (targetUnitType === "Armored Foot") { return 6; }
        if (targetUnitType === "Wizard") { return 6; }
        if (targetUnitType === "Light Horse") { return 5; }
        if (targetUnitType === "Medium Horse") { return 6; }
        if (targetUnitType === "Fire Elemental") { return 6; }
        if (targetUnitType === "Heavy Horse") { return 6; }
        throw new roll20Exception(logMsg, chatMsg);
    }
    else if (selectedUnitType === "Heavy Horse"
        || selectedUnitType === "Medium Horse"
        || selectedUnitType === "Fire Elemental"
    ) {
        if (targetUnitType === "Light Foot") { return 5; }
        if (targetUnitType === "Heavy Foot") { return 5; }
        if (targetUnitType === "Armored Foot") { return 5; }
        if (targetUnitType === "Wizard") { return 5; }
        if (targetUnitType === "Light Horse") { return 5; }
        if (targetUnitType === "Medium Horse") { return 5; }
        if (targetUnitType === "Fire Elemental") { return 5; }
        if (targetUnitType === "Heavy Horse") { return 6; }
        throw new roll20Exception(logMsg, chatMsg);
    }

    chatMsg = "F. Unrecognized selected unit type: " + selectedUnitType;
    throw new roll20Exception(logMsg, chatMsg);
}

/**
 * Appendix A - Get the number of melee dice to fire against a defender
 *
 * @param selectedUnitType
 * @param targetUnitType
 */
function getFlankerDiceFactor(selectedUnitType, targetUnitType) {

    var logMsg = "";
    var chatMsg = "Unrecognized target unit type: " + targetUnitType;

    if (selectedUnitType === "Light Foot") {
        if (targetUnitType === "Light Foot") { return 1; }
        if (targetUnitType === "Heavy Foot") { return 1; }
        if (targetUnitType === "Armored Foot") { return 1/2; }
        if (targetUnitType === "Wizard") { return 1/2; }
        if (targetUnitType === "Light Horse") { return 1/2; }
        if (targetUnitType === "Medium Horse") { return 1/3; }
        if (targetUnitType === "Fire Elemental") { return 1/3; }
        if (targetUnitType === "Heavy Horse") { return 1/4; }
        throw new roll20Exception(logMsg, chatMsg);
    }
    else if (selectedUnitType === "Armored Foot"
        || selectedUnitType === "Heavy Foot"
        || selectedUnitType === "Wizard"
    ) {
        if (targetUnitType === "Light Foot") { return 1; }
        if (targetUnitType === "Heavy Foot") { return 1; }
        if (targetUnitType === "Armored Foot") { return 1; }
        if (targetUnitType === "Wizard") { return 1; }
        if (targetUnitType === "Light Horse") { return 1; }
        if (targetUnitType === "Medium Horse") { return 1/2; }
        if (targetUnitType === "Fire Elemental") { return 1/2; }
        if (targetUnitType === "Heavy Horse") { return 1/3; }
        throw new roll20Exception(logMsg, chatMsg);
    }
    else if (selectedUnitType === "Light Horse") {
        if (targetUnitType === "Light Foot") { return 2; }
        if (targetUnitType === "Heavy Foot") { return 2; }
        if (targetUnitType === "Armored Foot") { return 2; }
        if (targetUnitType === "Wizard") { return 2; }
        if (targetUnitType === "Light Horse") { return 1; }
        if (targetUnitType === "Medium Horse") { return 1; }
        if (targetUnitType === "Fire Elemental") { return 1; }
        if (targetUnitType === "Heavy Horse") { return 1/2; }
        throw new roll20Exception(logMsg, chatMsg);
    }
    else if (selectedUnitType === "Heavy Horse"
        || selectedUnitType === "Medium Horse"
        || selectedUnitType === "Fire Elemental"
    ) {
        if (targetUnitType === "Light Foot") { return 4; }
        if (targetUnitType === "Heavy Foot") { return 3; }
        if (targetUnitType === "Armored Foot") { return 2; }
        if (targetUnitType === "Wizard") { return 2; }
        if (targetUnitType === "Light Horse") { return 2; }
        if (targetUnitType === "Medium Horse") { return 1; }
        if (targetUnitType === "Fire Elemental") { return 1; }
        if (targetUnitType === "Heavy Horse") { return 1; }
        throw new roll20Exception(logMsg, chatMsg);
    }

    chatMsg = "H. Unrecognized selected unit type: " + selectedUnitType;
    throw new roll20Exception(logMsg, chatMsg);
}

/**
 * Applies the casualties to the casualty bar
 * @param token object Token to apply casualties to
 * @param kills int Number to set the casualty bar to.
 */
function applyCasualties(token, kills) {
    var barnum = 3;
    var casualtiesBarValue = "bar"+ barnum + "_value";
    token.set(casualtiesBarValue, kills);
}

/**
 * To be called after casualties are applied.
 * @param msg
 * @param selectedObj
 * @return boolean true if the target unit survives, false if all men are killed
 */
function calculateTroopLoss(msg, selectedObj) {
    var casualties = getTokenBarValue(selectedObj, 3);
    var troops = getTokenBarValue(selectedObj, 1);
    var newValue = troops*1 - casualties*1;
    if (newValue < 0) { newValue = 0; }
    selectedObj.set("bar1_value", newValue);
    if (newValue > 0) { return true; }
    // unit slain
    selectedObj.set("status_dead", true);
    var result = [];
    result[1] = " have been slaughtered!";
    result[2] = " have been annihilated!";
    result[3] = " have been erased!";
    result[4] = " have been stomped!";
    result[5] = " have gone to Valhalla!";
    result[6] = " are no more!";
    result[7] = " should have run!";
    result[8] = " will haunt this field forever!";
    result[9] = " have died with honor!";
    result[10] = " will no longer be a problem!";
    var i = randomInteger(10);
    var unitName = getPropertyValue(selectedObj, "name");
    sendChat(msg.who, css.meleeResult + unitName + result[i] + css.spanEnd);
    return false;

}

/**
 * If we forget to clear the casualties, the combat doesn't work.
 * @param selectedUnit
 * @param targetUnit
 */
function clearLocalCasualties(selectedUnit, targetUnit)
{
    selectedUnit.set("bar3_value", 0);
    targetUnit.set("bar3_value", 0);
}

function tintAttacker(attackObj) {
    var attackColor = "#ff0000";
    var doneColor = "#000000";
    setAttackerDone(doneColor);
    attackObj.set('tint_color', attackColor);

}

function tintRanged(attackObj) {
    var attackColor = "#ff0000";
    var doneColor = "#ffffff";
    setAttackerDone(doneColor);
    attackObj.set('tint_color', attackColor);
}

function setAttackerDone(doneColor) {
    var attackColor = "#ff0000";
    var objList = findObjs({type: 'graphic'});
    for (var i = 0; i < objList.length; ++i) {
        var targetTint = getPropertyValue(objList[i], 'tint_color');
        if (targetTint === attackColor) {
            objList[i].set('tint_color', doneColor);
        }
    }
}

function removeAllTints() {
    var objList = findObjs({type: 'graphic'});
    for (var i = 0; i < objList.length; ++i) {
        objList[i].set('tint_color', "transparent");
    }
}



