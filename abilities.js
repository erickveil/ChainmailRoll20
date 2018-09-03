/**
 * abilities.js
 * Erick Veil
 * 2018-09-01
 * 
 * All abilities that need detection to affect combat
 */


// ============ Heroic =================

function isTokenHero(token) {
    var sheetId = getPropertyValue(token, "represents");
    return isSheetHero(sheetId);
}

function isSheetHero(sheetId) {
    return isCharacterHasAbility(sheetId, "Heroic");
}

function isHeroDefeated(maxHeroTroops, damageTaken) {
    return damageTaken >= maxHeroTroops;
}

function handleHeroSave(chatTarget, heroName) {
    sendChat(chatTarget, css.meleeResult + "The attack is not enough to defeat " 
    + heroName + "!" + css.spanEnd);
}

function handleHeroDefeat(chatMsg, heroToken) {
    var maxHeroTroops = getTokenBarMax(heroToken, 1);
    applyCasualties(heroToken, maxHeroTroops);
    calculateTroopLoss(chatMsg, heroToken);
}


// ============ Attacks/Defends/Fights As Unit Type =================

function getFightsAs(sheetId) {
    if (isHasAttribute(sheetId, "Fights As")) {
        return getAttribute(sheetId, "Fights As");
    }
    if (isHasAttribute(sheetId, "Unit Type")) {
        return getAttribute(sheetId, "Unit Type");
    }
    return "Light Foot";
}

function getAttacksAs(sheetId) {
    if (isHasAttribute(sheetId, "Attacks As")) {
        return getAttribute(sheetId, "Attacks As");
    }
    return getFightsAs(sheetId);
}

function getDefendsAs(sheetId) {
    if (isHasAttribute(sheetId, "Defends As")) {
        return getAttribute(sheetId, "Defends As");
    }
    return getFightsAs(sheetId);
}

// ============ Ranger Bonus =================

function isGetsRangerBonus(sheetId) {
    return isHasAttribute(sheetId, "Attack Bonus");
}

function getRangerBonus(sheetId) {
    if (!isGetsRangerBonus(sheetId)) { return 0; }
    return parseInt(getAttribute(sheetId, "Attack Bonus"));
}

// ============ Magic Sword =================

function isHasMagicSword(sheetId) {
    return isHasAttribute(sheetId, "Magic Sword");
}

function getMagicSwordBonus(chatTarget, sheetId, attackerName) {
    if (!isHasMagicSword(sheetId)) { return 0; }
    sendChat(chatTarget, css.magicItem + attackerName
        + " gets an attack bonus from " + getMagicSwordName(sheetId)
        + "!" + css.spanEnd);
    return parseInt(getAttribute(sheetId, "Magic Sword"));
}

// ============ Nonmagic Melee Immunity =================

function isHasMeleeImmunity(chatTarget, attackSheetId, defendSheetId, defendName) {
    if (isHasAttribute(defendSheetId, "Normal Attack Immunity")
        && !isHasMagicSword(attackSheetId)) {
            sendChat(chatTarget, css.warning + defendName 
                + " is immune to nonmagical attacks!");
            return true;
    }
    return false;
}

// ============ Magic Armor =================

function getMagicArmorBonus(chatTarget, defendSheetId, defendName) {
    if (isHasAttribute(defendSheetId, "Magic Armor")) {
        sendChat(chatTarget, css.magicItem + defendName 
            + " is protected by magic armor!");
        return parseInt(getAttribute(defendSheetId, "Magic Armor"));
    }
    return 0;
}

// ============ Sun Sickness =================

function isSunSicknessApplies(chatTarget, attackerToken) {
    var attackName = getPropertyValue(attackerToken, "name");
    if (isDaylight() && isUnitLightSensitive(attackerToken)) {
        lightSensitivityEffect(chatTarget, attackName);
        return true;
    }
    return false;
}

// ============ Waterborn =================

function isWaterborn(sheetId) {
    return isHasAttribute(sheetId, "Waterborn");
}

function getWaterbornToHit(chatTarget, attackerToken, defaultToHit, defendsAs) {
    var sheetId = getPropertyValue(attackerToken, "represents");
    var attackerName = getPropertyValue(attackerToken, "name");
    if (!isWaterborn(sheetId)) { return defaultToHit; } 
    if (!isInWater(attackerToken)) { return defaultToHit; }
    sendChat(chatTarget, css.attack + attackerName 
        + " is more powerful while in water." + css.spanEnd);
    var toHit = getAttackerTargetNumber("Heavy Horse", defendsAs);
    toHit +=2;
    return toHit;
}

// ============ Airborn =================

function isAirborn(sheetId) {
    return isHasAttribute(sheetId, "Airborn");
}

function getAirbornToHitMod(chatTarget, attackerToken, defenderToken) {
    var attackSheetId = getPropertyValue(attackerToken, "represents");
    var attackerName = getPropertyValue(attackerToken, "name");
    if (!isAirborn(attackSheetId)) { return 0; }
    if (!isFlying(defenderToken)) { return 0; }
    sendChat(chatTarget, css.attack + attackerName 
        + " gets a bonus to hit flying units." + css.spanEnd);
    return 2;
}

// ============ Earthborn =================

function isEarthborn(sheetId) {
    return isHasAttribute(sheetId, "Earthborn");
}

function getEarthbornToHitMod(chatTarget, attackerToken, defenderToken) {
    var attackSheetId = getPropertyValue(attackerToken, "represents");
    var attackerName = getPropertyValue(attackerToken, "name");
    if (!isEarthborn(attackSheetId)) { return 0; }
    if (isFlying(defenderToken)) { return 0; }
    sendChat(chatTarget, css.attack + attackerName 
        + " gets a bonus to hit earth-bound units." + css.spanEnd);
    return 1;
}



