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

function isHasMeleeImmunity(sheetId) {
    return (isHasAttribute(sheetId, "Normal Attack Immunity"));
}

function frontalAttack(selectedTroops, targetTroops, msg) {
    var selectedSheetId = getPropertyValue(selectedObj, "represents");
    var targetSheetId = getPropertyValue(targetObj, "represents");
    var selectedUnitType = getAttacksAs(selectedSheetId);
    var targetUnitType = getAttacksAs(targetSheetId);
    var attackDiceFactor = getAttackDiceFactor(selectedUnitType, targetUnitType);
    var selectedName = getPropertyValue(selectedObj, "name");
    var targetName = getPropertyValue(targetObj, "name");
    var weaponAttribute = "Weapon";
    var selectedWeapon = getAttributeWithError(selectedSheetId, weaponAttribute);
    var pikeMod = (selectedWeapon === "Pike"
        || selectedWeapon === "Halbard"
        || selectedWeapon === "Pole"
        ) ? 1 : 0;

    if (isImmuneToNormalAttacks(targetUnitType) && !isHasMagicSword(selectedSheetId)) {
        sendChat(msg.who, css.error + targetName + " cannot be affected by nonmagical attacks.");
        return;
    }

    var numberOfDice = Math.ceil(selectedTroops * attackDiceFactor) + pikeMod;
    var targetNumber = getAttackerTargetNumber(selectedUnitType, targetUnitType);

    var actualSelectedType = getAttributeWithError(selectedSheetId, "Unit Type");
    var actualTargetType = getAttributeWithError(selectedSheetId, "Unit Type");

    if (actualSelectedType === "Water Elemental" && isInWater(selectedObj)) {
        selectedUnitType = "Heavy Horse";
        targetNumber = getAttackerTargetNumber(selectedUnitType, targetUnitType);
        targetNumber -= 2;
        sendChat(msg.who, css.attack + selectedName + " is more powerful while in water." + css.spanEnd);
    }
    if (actualTargetType === "Water Elemental" && isInWater(targetObj)) { targetUnitType = "Heavy Horse"; }

    if (actualSelectedType === "Air Elemental" && isFlying(targetObj)) {
        targetNumber -= 2;
        sendChat(msg.who, css.attack + selectedName + " gets a bonus to hit flying units." + css.spanEnd);
    }
    else if (actualSelectedType === "Earth Elemental" && !isFlying(targetObj)) {
        targetNumber -= 1;
        sendChat(msg.who, css.attack + selectedName + " gets a bonus to hit earth-bound units." + css.spanEnd);
    }

    if (isHasMagicSword(selectedSheetId)) {
        numberOfDice++;
        if (isFantasyTarget(actualTargetType)) {
            targetNumber -= getMagicSwordBonus(selectedSheetId);
            sendChat(msg.who, css.magicItem + selectedName + " gets a bonus attack die and a hit bonus from "
                + getMagicSwordName(selectedSheetId) + "!" + css.spanEnd);
        }
        else {
            sendChat(msg.who, css.magicItem + selectedName + " gets a bonus attack die from "
                + getMagicSwordName(selectedSheetId) + "!" + css.spanEnd);
        }
    }
    else if (isHasMeleeImmunity(targetSheetId)) {
        sendChat(msg.who, css.error + targetName + " is immune to normal attacks!");
        return;
    }


    if (isHasMagicArmor(targetSheetId)) { ++targetNumber; }

    sendChat(msg.who, "/r " + numberOfDice + "d6>" + targetNumber + " " + selectedName);
    counterAttack(targetUnitType, selectedUnitType, targetSheetId, selectedSheetId, weaponAttribute, targetTroops, msg);
}

function isFantasyTarget(targetUnitType) {
    return (
           targetUnitType === "Wizard"
           || targetUnitType === "Fire Elemental"
           || targetUnitType === "Earth Elemental"
           || targetUnitType === "Air Elemental"
           || targetUnitType === "Water Elemental"
    );
}

function isImmuneToNormalAttacks(targetUnitType) {
    return (
           targetUnitType === "Fire Elemental"
    );
}

/**
 * All troops formed in close order with pole arms can ony take frontal melee damage from like-armed troops.
 * @param selectedTroops
 * @param msg
 */
function polearmAdvantageAttack(selectedTroops, msg) {

    // though not rear, this triggers a morale check without a counter attack
    isRearAttack = true;

    var selectedSheetId = getPropertyValue(selectedObj, "represents");
    var targetSheetId = getPropertyValue(targetObj, "represents");
    var selectedUnitType = getAttacksAs(selectedSheetId);
    var targetUnitType = getAttacksAs(targetSheetId);
    sendChat(msg.who, "B");
    var attackDiceFactor = getAttackDiceFactor(selectedUnitType, targetUnitType);
    var selectedName = getPropertyValue(selectedObj, "name");
    var pikeMod = 1;

    var targetName = getPropertyValue(targetObj, "name");
    if (isImmuneToNormalAttacks(targetUnitType) && !isHasMagicSword(selectedSheetId)) {
        sendChat(msg.who, css.error + targetName + " cannot be affected by nonmagical attacks.");
        return;
    }

    var numberOfDice = Math.ceil(selectedTroops * attackDiceFactor) + pikeMod;
    var targetNumber = getAttackerTargetNumber(selectedUnitType, targetUnitType);

    var actualSelectedType = getAttributeWithError(selectedSheetId, "Unit Type");
    var actualTargetType = getAttributeWithError(selectedSheetId, "Unit Type");

    if (actualSelectedType === "Water Elemental" && isInWater(selectedObj)) {
        selectedUnitType = "Heavy Horse";
        targetNumber = getAttackerTargetNumber(selectedUnitType, targetUnitType);
        targetNumber -= 2;
        sendChat(msg.who, css.attack + selectedName + " is more powerful while in water." + css.spanEnd);
    }

    if (actualSelectedType === "Air Elemental" && isFlying(targetObj)) {
        targetNumber -= 2;
        sendChat(msg.who, css.attack + selectedName + " gets a bonus to hit flying units." + css.spanEnd);
    }
    else if (actualSelectedType === "Earth Elemental" && !isFlying(targetObj)) {
        targetNumber -= 1;
        sendChat(msg.who, css.attack + selectedName + " gets a bonus to hit earth-bound units." + css.spanEnd);
    }

    if (isHasMagicSword(selectedSheetId)) {
        numberOfDice++;
        if (isFantasyTarget(actualTargetType)) {
            targetNumber -= getMagicSwordBonus(selectedSheetId);
            sendChat(msg.who, css.magicItem + selectedName + " gets a bonus attack die and a hit bonus from "
                + getMagicSwordName(selectedSheetId) + "!" + css.spanEnd);
        }
        else {
            sendChat(msg.who, css.magicItem + selectedName + " gets a bonus attack die from "
                + getMagicSwordName(selectedSheetId) + "!" + css.spanEnd);
        }
    }
    else if (isHasMeleeImmunity(targetSheetId)) {
        sendChat(msg.who, css.error + targetName + " is immune to normal attacks!");
        return;
    }

    if (isHasMagicArmor(targetSheetId)) { ++targetNumber; }

    sendChat(msg.who, "/r " + numberOfDice + "d6>" + targetNumber + " " + selectedName);
}

function getAttacksAs(sheetId) {
    if (isHasAttribute(sheetId, "Fights As")) {
        var fightsAs = getAttributeWithError(sheetId, "Fights As");
        if (fightsAs !== "") { return fightsAs; }
    }
    return getAttributeWithError(sheetId, "Unit Type");
}

function flankAttack(selectedTroops, targetTroops, msg) {
    var selectedSheetId = getPropertyValue(selectedObj, "represents");
    var targetSheetId = getPropertyValue(targetObj, "represents");
    var selectedUnitType = getAttacksAs(selectedSheetId);
    var targetUnitType = getAttacksAs(targetSheetId);
    var attackDiceFactor = getFlankerDiceFactor(selectedUnitType, targetUnitType);
    var selectedName = getPropertyValue(selectedObj, "name");
    var weaponAttribute = "Weapon";
    var selectedWeapon = getAttributeWithError(selectedSheetId, weaponAttribute);
    var pikeMod = (selectedWeapon === "Pike"
        || selectedWeapon === "Halbard"
        || selectedWeapon === "Pole"
        ) ? 1 : 0;

    var targetName = getPropertyValue(targetObj, "name");
    if (isImmuneToNormalAttacks(targetUnitType) && !isHasMagicSword(selectedSheetId)) {
        sendChat(msg.who, css.error + targetName + " cannot be affected by nonmagical attacks.");
        return;
    }

    var numberOfDice = Math.ceil(selectedTroops * attackDiceFactor) + pikeMod;
    var targetNumber = getFlankerTargetNumber(selectedUnitType, targetUnitType);

    var actualSelectedType = getAttributeWithError(selectedSheetId, "Unit Type");
    var actualTargetType = getAttributeWithError(targetSheetId, "Unit Type");

    if (actualSelectedType === "Water Elemental" && isInWater(selectedObj)) {
        selectedUnitType = "Heavy Horse";
        targetNumber = getAttackerTargetNumber(selectedUnitType, targetUnitType);
        targetNumber -= 2;
        sendChat(msg.who, css.attack + selectedName + " is more powerful while in water." + css.spanEnd);
    }
    if (actualTargetType === "Water Elemental" && isInWater(targetObj)) { targetUnitType = "Heavy Horse"; }

    if (actualSelectedType === "Air Elemental" && isFlying(targetObj)) {
        targetNumber -= 2;
        sendChat(msg.who, css.attack + selectedName + " gets a bonus to hit flying units." + css.spanEnd);
    }
    else if (actualSelectedType === "Earth Elemental" && !isFlying(targetObj)) {
        targetNumber -= 1;
        sendChat(msg.who, css.attack + selectedName + " gets a bonus to hit earth-bound units." + css.spanEnd);
    }

    if (isHasMagicSword(selectedSheetId)) {
        numberOfDice++;
        if (isFantasyTarget(actualTargetType)) {
            targetNumber -= getMagicSwordBonus(selectedSheetId);
            sendChat(msg.who, css.magicItem + selectedName + " gets a bonus attack die and a hit bonus from "
                + getMagicSwordName(selectedSheetId) + "!" + css.spanEnd);
        }
        else {
            sendChat(msg.who, css.magicItem + selectedName + " gets a bonus attack die from "
                + getMagicSwordName(selectedSheetId) + "!" + css.spanEnd);
        }
    }
    else if (isHasMeleeImmunity(targetSheetId)) {
        sendChat(msg.who, css.error + targetName + " is immune to normal attacks!");
        return;
    }

    if (isHasMagicArmor(targetSheetId)) { ++targetNumber; }

    if (selectedUnitType === "Armored Foot" || selectedUnitType === "Heavy Horse") {
        --targetNumber;
    }

    sendChat(msg.who, "/r " + numberOfDice + "d6>" + targetNumber + " " + selectedName);
    counterAttack(targetUnitType, selectedUnitType, targetSheetId, selectedSheetId, weaponAttribute, targetTroops, msg);
}

function rearAttack(selectedTroops, msg) {
    var selectedSheetId = getPropertyValue(selectedObj, "represents");
    var targetSheetId = getPropertyValue(targetObj, "represents");
    var selectedUnitType = getAttacksAs(selectedSheetId);
    var targetUnitType = getAttacksAs(targetSheetId);
    var attackDiceFactor = getFlankerDiceFactor(selectedUnitType, targetUnitType);
    var selectedName = getPropertyValue(selectedObj, "name");
    var weaponAttribute = "Weapon";
    var selectedWeapon = getAttributeWithError(selectedSheetId, weaponAttribute);
    var pikeMod = (selectedWeapon === "Pike"
        || selectedWeapon === "Halbard"
        || selectedWeapon === "Pole"
        ) ? 1 : 0;

    var targetName = getPropertyValue(targetObj, "name");
    if (isImmuneToNormalAttacks(targetUnitType) && !isHasMagicSword(selectedSheetId)) {
        sendChat(msg.who, css.error + targetName + " cannot be affected by nonmagical attacks.");
        return;
    }

    var numberOfDice = Math.ceil(selectedTroops * attackDiceFactor) + pikeMod;
    var targetNumber = getFlankerTargetNumber(selectedUnitType, targetUnitType);

    var actualSelectedType = getAttributeWithError(selectedSheetId, "Unit Type");
    var actualTargetType = getAttributeWithError(selectedSheetId, "Unit Type");

    if (actualSelectedType === "Water Elemental" && isInWater(selectedObj)) {
        selectedUnitType = "Heavy Horse";
        targetNumber = getAttackerTargetNumber(selectedUnitType, targetUnitType);
        targetNumber -= 2;
        sendChat(msg.who, css.attack + selectedName + " is more powerful while in water." + css.spanEnd);
    }

    if (actualSelectedType === "Air Elemental" && isFlying(targetObj)) {
        targetNumber -= 2;
        sendChat(msg.who, css.attack + selectedName + " gets a bonus to hit flying units." + css.spanEnd);
    }
    else if (actualSelectedType === "Earth Elemental" && !isFlying(targetObj)) {
        targetNumber -= 1;
        sendChat(msg.who, css.attack + selectedName + " gets a bonus to hit earth-bound units." + css.spanEnd);
    }

    if (isHasMagicSword(selectedSheetId)) {
        numberOfDice++;
        if (isFantasyTarget(actualTargetType)) {
            targetNumber -= getMagicSwordBonus(selectedSheetId);
            sendChat(msg.who, css.magicItem + selectedName + " gets a bonus attack die and a hit bonus from "
                + getMagicSwordName(selectedSheetId) + "!" + css.spanEnd);
        }
        else {
            sendChat(msg.who, css.magicItem + selectedName + " gets a bonus attack die from "
                + getMagicSwordName(selectedSheetId) + "!" + css.spanEnd);
        }
    }
    else if (isHasMeleeImmunity(targetSheetId)) {
        sendChat(msg.who, css.error + targetName + " is immune to normal attacks!");
        return;
    }

    if (isHasMagicArmor(targetSheetId)) { ++targetNumber; }

    if (selectedUnitType === "Armored Foot" || selectedUnitType === "Heavy Horse") {
        --targetNumber;
    }

    sendChat(msg.who, "/r " + numberOfDice + "d6>" + targetNumber + " " + selectedName);
}

function counterAttack(targetUnitType, selectedUnitType, targetSheetId, selectedSheetId, weaponAttribute, targetTroops, msg) {

    log("target: " + targetUnitType + " selected: " + selectedUnitType);
    var attackDiceFactor = getAttackDiceFactor(targetUnitType, selectedUnitType);
    var targetWeapon = getAttributeWithError(targetSheetId, weaponAttribute);
    var pikeMod = (targetWeapon === "Pike"
        || targetWeapon === "Halbard"
        || targetWeapon === "Pole"
        ) ? 1 : 0;
    var targetName = getPropertyValue(targetObj, "name");
    var selectedName = getPropertyValue(selectedObj, "name");

    if (isImmuneToNormalAttacks(selectedUnitType) && !isHasMagicSword(targetSheetId)) {
        sendChat(msg.who, css.error + selectedName + " cannot be affected by nonmagical attacks.");
        return;
    }

    var numberOfDice = Math.ceil(targetTroops * attackDiceFactor) + pikeMod;

    var targetNumber = getAttackerTargetNumber(targetUnitType, selectedUnitType);

    var actualTargetType = getAttributeWithError(targetSheetId, "Unit Type");
    var actualSelectedType = getAttributeWithError(selectedSheetId, "Unit Type");

    if (actualTargetType === "Water Elemental" && isInWater(targetObj)) {
        selectedUnitType = "Heavy Horse";
        targetNumber = getAttackerTargetNumber(targetUnitType, selectedUnitType);
        targetNumber -= 2;
        sendChat(msg.who, css.attack + targetName + " is more powerful while in water." + css.spanEnd);
    }

    if (actualTargetType === "Air Elemental" && isFlying(selectedObj)) {
        targetNumber -= 2;
        sendChat(msg.who, css.counterAttack + targetName + " gets a bonus to hit flying units." + css.spanEnd);
    }
    else if (actualTargetType === "Earth Elemental" && !isFlying(selectedObj)) {
        targetNumber -= 1;
        sendChat(msg.who, css.counterAttack + targetName + " gets a bonus to hit earth-bound units." + css.spanEnd);
    }

    if (isHasMagicSword(targetSheetId)) {
        numberOfDice++;
        if (isFantasyTarget(actualSelectedType)) {
            targetNumber -= getMagicSwordBonus(targetSheetId);
            sendChat(msg.who, css.magicItem + targetName + " gets a bonus attack die and a hit bonus from "
                + getMagicSwordName(targetSheetId) + "!" + css.spanEnd);
        }
        else {
            sendChat(msg.who, css.magicItem + targetName + " gets a bonus attack die from "
                + getMagicSwordName(targetSheetId) + "!" + css.spanEnd);
        }
    }
    else if (isHasMeleeImmunity(selectedSheetId)) {
        sendChat(msg.who, css.error + selectedName + " is immune to normal attacks!");
        return;
    }

    if (isHasMagicArmor(selectedSheetId)) { ++targetNumber; }

    sendChat(msg.who, "/r " + numberOfDice + "d6>" + targetNumber + " " + targetName);
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
    var chatMsg = "G. Unrecognized target unit type: " + targetUnitType;

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



