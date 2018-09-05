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
    if (isCharacterHasAbility(sheetId, "Fights As")) {
        return getAttribute(sheetId, "Fights As");
    }
    if (isCharacterHasAbility(sheetId, "Unit Type")) {
        return getAttribute(sheetId, "Unit Type");
    }
    return "Light Foot";
}

function getAttacksAs(sheetId) {
    if (isCharacterHasAbility(sheetId, "Attacks As")) {
        return getAttribute(sheetId, "Attacks As");
    }
    return getFightsAs(sheetId);
}

function getDefendsAs(sheetId) {
    if (isCharacterHasAbility(sheetId, "Defends As")) {
        return getAttribute(sheetId, "Defends As");
    }
    return getFightsAs(sheetId);
}

// ============ Ranger Bonus =================

function isGetsRangerBonus(sheetId) {
    return isCharacterHasAbility(sheetId, "Attack Bonus");
}

function getRangerBonus(sheetId) {
    if (!isGetsRangerBonus(sheetId)) { return 0; }
    return parseInt(getAttribute(sheetId, "Attack Bonus"));
}

// ============ Magic Sword =================

function isHasMagicSword(sheetId) {
    return isCharacterHasAbility(sheetId, "Magic Sword");
}

function getMagicSwordBonus(chatTarget, sheetId, attackerName) {
    if (!isHasMagicSword(sheetId)) { return 0; }
    sendChat(chatTarget, css.magicItem + attackerName
        + " gets an attack bonus from " + getMagicSwordName(sheetId)
        + "!" + css.spanEnd);
    return parseInt(getAttribute(sheetId, "Magic Sword"));
}

// ============ Magic Missile =================

function isHasMagicMissile(sheetId) {
    return isCharacterHasAbility(sheetId, "Magic Missiles");
}

function getMagicMissileBonus(chatTarget, sheetId, attackerName) {
    if (!isHasMagicSword(sheetId)) { return 0; }
    sendChat(chatTarget, css.magicItem + attackerName
        + " gets an attack bonus from Magic Missiles!"
        + css.spanEnd);
    return parseInt(getAttribute(sheetId, "Magic Missiles"));
}

// ============ Nonmagic Melee Immunity =================

function isHasMeleeImmunity(chatTarget, attackSheetId, defendSheetId, defendName) {
    if (isCharacterHasAbility(defendSheetId, "Normal Attack Immunity")
        && !isHasMagicSword(attackSheetId)) {
            sendChat(chatTarget, css.warning + defendName 
                + " is immune to nonmagical attacks!");
            return true;
    }
    return false;
}

// ============ Nonmagic Missile Immunity =================

function isHasMissileImmunity(chatTarget, attackSheetId, defendSheetId, defendName) {
    if (isCharacterHasAbility(defendSheetId, "Missile Immunity")
        && !isHasMagicMissile(attackSheetId)) {
            sendChat(chatTarget, css.warning + defendName 
                + " is immune to nonmagical missile attacks!");
            return true;
    }
    return false;
}

// ============ Magic Armor =================

function getMagicArmorBonus(chatTarget, defendSheetId, defendName) {
    if (isCharacterHasAbility(defendSheetId, "Magic Armor")) {
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
    return isCharacterHasAbility(sheetId, "Waterborn");
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
    return isCharacterHasAbility(sheetId, "Airborn");
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
    return isCharacterHasAbility(sheetId, "Earthborn");
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

// ============ Peasant =================

function isPeasant(sheetId) {
    return isCharacterHasAbility(sheetId, "Peasant");
}

function isPeasantMove(chatTarget, peasantToken) {
    var peasantSheetId = getPropertyValue(peasantToken, "represents");
    if (!isPeasant(peasantSheetId)) { return true; }
    var DC = getPeasantMoveDc();

    var roll1 = randomInteger(6);
    var roll2 = randomInteger(6);
    var rollTotal = roll1 + roll2;
    
    var passFail = (rollTotal >= DC) ? "PASS!" : "FAIL!";
    var peasantName = getPropertyValue(peasantToken, "name");
    sendChat(chatTarget, css.morale + peasantName 
        + " gathers the courage to move. Roll: " + css.rollValue 
        + rollTotal + css.endValue + " vs. " + DC + ": " 
        + passFail + css.spanEnd);

    if (rollTotal >= DC) {
        var result = [];
        result[1] = " musters up the courage to move.";
        result[2] = " steps tenatiously forward.";
        result[3] = " advances while praying for mercy.";
        result[4] = " is pressed on unwillingly by those behind them.";
        result[5] = " moves forward only after vomiting in fear.";
        result[6] = " strides foolheartedly onword.";
        var i = randomInteger(6);
        sendChat(chatTarget, css.morale + peasantName + result[i] 
            + css.spanEnd);
        return true;
    }
    else {
        var result = [];
        result[1] = " are frozen in place with fear.";
        result[2] = " curl up into a ball on the ground.";
        result[3] = " stubbornly refuse to advance.";
        result[4] = " fall to thier knees in prayer for thier lives.";
        result[5] = " are held up by an argument with their neighbors.";
        result[6] = " are shaking so hard they didn't hear the order.";
        var i = randomInteger(6);
        sendChat(chatTarget, css.morale + peasantName + result[i] 
            + css.spanEnd);
        return false;
    }
}

function isPeasantAttack(chatTarget, peasantToken, defenderToken) {
    var peasantSheetId = getPropertyValue(peasantToken, "represents");
    if (!isPeasant(peasantSheetId)) { return true; }
    var defenderSheetId = getPropertyValue(defenderToken, "represents");
    var defenderType = getDefendsAs(defenderSheetId);
    var isDefenderPeasant = isPeasant(defenderSheetId);
    var DC = getPeasantAttackDc(defenderType, isDefenderPeasant);
 
    var roll1 = randomInteger(6);
    var roll2 = randomInteger(6);
    var rollTotal = roll1 + roll2;
    
    var passFail = (rollTotal >= DC) ? "PASS!" : "FAIL!";
    var peasantName = getPropertyValue(peasantToken, "name");
    sendChat(chatTarget, css.morale + peasantName 
        + " are reluctant to participate in battle. Roll: " 
        + css.rollValue + rollTotal + css.endValue + " vs. " + DC + ": " 
        + passFail + css.spanEnd);

    if (rollTotal >= DC) {
        var result = [];
        result[1] = " throw themselves valiantly into battle!";
        result[2] = " shout a battle cry more in fear than anything and attack!";
        result[3] = " reluctantly pretend to be enthusiastic about the order.";
        result[4] = " swing wildly at the enemey.";
        result[5] = " lunge like a wild animal at their foes!";
        result[6] = " fight for their very lives!";
        var i = randomInteger(6);
        sendChat(chatTarget, css.morale + peasantName + result[i] 
            + css.spanEnd);
        return true;
    }
    else {
        var result = [];
        result[1] = " put their heads between their legs.";
        result[2] = " soil themselves.";
        result[3] = " ineffectively slap at the enemy.";
        result[4] = " are crying too hard to fight.";
        result[5] = " attempt to reason with the enemy!";
        result[6] = " have decided to become pacifists.";
        var i = randomInteger(6);
        sendChat(chatTarget, css.morale + peasantName + result[i] 
            + css.spanEnd);
        return false;
    }
}

function isPeasantDefend(chatTarget, peasantToken, defenderToken) {
    var peasantSheetId = getPropertyValue(peasantToken, "represents");
    if (!isPeasant(peasantSheetId)) { return true; }
    var defenderSheetId = getPropertyValue(defenderToken, "represents");
    var defenderType = getDefendsAs(defenderSheetId);
    var isDefenderPeasant = isPeasant(defenderSheetId);
    var DC = getPeasantDefendDc(defenderType, isDefenderPeasant);
    
    var roll1 = randomInteger(6);
    var roll2 = randomInteger(6);
    var rollTotal = roll1 + roll2;
 
    var passFail = (rollTotal >= DC) ? "PASS!" : "FAIL!";
    var peasantName = getPropertyValue(peasantToken, "name");
    sendChat(chatTarget, css.morale + peasantName 
        + " is unsure if they should fight back. Roll: " 
        + css.rollValue + rollTotal + css.endValue + " vs. " + DC + ": " 
        + passFail + css.spanEnd);

    if (rollTotal >= DC) {
        var result = [];
        result[1] = " hold up their tools in defense.";
        result[2] = " put up some sort of feeble resistance.";
        result[3] = " strike back in fear!";
        result[4] = " strike back!";
        result[5] = " manage to stand up for themselves.";
        result[6] = " double down.";
        var i = randomInteger(6);
        sendChat(chatTarget, css.morale + peasantName + result[i] 
            + css.spanEnd);
        return true;
    }
    else {
        var result = [];
        result[1] = " cry for their mothers.";
        result[2] = " prepare for death.";
        result[3] = " lie down in hopes all of this ends quickly.";
        result[4] = " plead for their lives instead of fighting back.";
        result[5] = " stare in shock at the bodies around them.";
        result[6] = " aren't sure they're supposed to be here.";
        var i = randomInteger(6);
        sendChat(chatTarget, css.morale + peasantName + result[i] 
            + " They route!" + css.spanEnd);
        var icon_rout = "broken-heart";
        peasantToken.set("status_" + icon_rout, "1");
        return false;
    }
}

function getPeasantMoveDc() {
    return 7;
}

function getPeasantAttackDc(defenderType, isDefenderPeasant) {
    if (isDefenderPeasant) { return 4; }
    if (defenderType === "Light Foot") { return 6; }
    if (defenderType === "Heavy Foot") { return 8; }
    if (defenderType === "Armored Foot") { return 9; }
    if (defenderType === "Light Horse") { return 10; }
    if (defenderType === "Medium Horse") { return 11; }
    if (defenderType === "Heavy Horse") { return 12; }
    return 7;
}

function getPeasantDefendDc(attackerType, isAttackerPeasant) {
    if (isAttackerPeasant) { return 5; }
    if (attackerType === "Light Foot") { return 6; }
    if (attackerType === "Heavy Foot") { return 7; }
    if (attackerType === "Armored Foot") { return 8; }
    if (attackerType === "Light Horse") { return 9; }
    if (attackerType === "Medium Horse") { return 10; }
    if (attackerType === "Heavy Horse") { return 11; }
    return 7;
}



