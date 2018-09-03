/**
 * fantasyTable.js
 * Erick Veil
 * 2018-09-02
 * 
 * Implementation of the fantasy table, Appendix E.
 */

function isFantasyToken(sheetId) {
    var isHasType = isHasAttribute(sheetId, "Fantasy Type");
    if(!isHasType) { return false; }
    var type = getAttribute(sheetId, "Fantasy Type");
    return isValidFantasyType(type);
}

function getFantasyType(sheetId) {
    if (!isFantasyToken(sheetId)) { return ""; }
    var type = getAttribute(sheetId, "Fantasy Type");
    if (!isValidFantasyType(type)) { return ""; }
    return type;
}

function isValidFantasyType(typeValue) {
    var testVal = typeValue.toLowerCase();
    return testVal === "balrog"
        || testVal === "dragon"
        || testVal === "elemental"
        || testVal === "ent"
        || testVal === "giant"
        || testVal === "hero"
        || testVal === "lycanthrope"
        || testVal === "roc"
        || testVal === "super hero"
        || testVal === "troll"
        || testVal === "wight"
        || testVal === "wizard"
        || testVal === "wraith";
}

function doFantasyBattle(chatTarget, attackerToken, defenderToken, isRanged)
{
    var attackSheetId = getPropertyValue(attackerToken, "represents");
    var attackType = getFantasyType(attackSheetId);
    var attackName = getPropertyValue(attackerToken, "name");

    var defendSheetId = getPropertyValue(defenderToken, "represents");
    var defendType = getFantasyType(defendSheetId);
    var defendName = getPropertyValue(defenderToken, "name");

    // darkness effects
    if (isCombatAffectedByDarkness(attackerToken, defenderToken)) {
        doDarknessEffect(chatTarget, attackerToken, defenderToken);
        return;
    }
    doDarknessEffect(chatTarget, attackerToken, defenderToken);
    // end darkness effects

    var toHit = getFantasyAttackTargetValue(attackType, defendType);
    var rollMod = 0;
    rollMod += getRangerBonus(attackSheetId);
    if (isRanged) {
        // magic missile bonus
        if (isHasAttribute(attackSheetId, "Magic Missiles")) {
            var missileBonus = getAttribute(attackSheetId, "Magic Missiles");
            missileBonus = missileBonus === "" ? 0 : parseInt(missileBonus);
            rollMod += missileBonus;
            sendChat(chatTarget, css.magicItem + attackName 
                + " fires a magic missile!" + css.spanEnd);
        }
        // wizards and others might be immune to missiles
        else if (isHasAttribute(defenderToken, "Missile Immunity")) {
            sendChat(chatTarget, css.warning + defendName 
                + " is immune to normal missile attacks!" + css.spanEnd);
            return;
        }
    }
    else {
        // magic sword bonus
        rollMod += getMagicSwordBonus(chatTarget, attackSheetId, attackName);
        if (isHasMeleeImmunity(chatTarget, attackSheetId, defendSheetId, defendName)){ 
            return; 
        }
    }

    // magic armor 
    toHit += getMagicArmorBonus(chatTarget, defendSheetId, defendName);

    // sunlight sickness 
    if (isSunSicknessApplies(chatTarget, attackerToken)) { --rollMod; }

    // wizards of lesser types get their tohit altered
    var armorMod = getAttribute(defendSheetId, "Armor Mod");
    armorMod = armorMod === "" ? 0 : armorMod;
    toHit += parseInt(armorMod);
    var attackMod = getAttribute(attackSheetId, "Attack Mod");
    attackMod = attackMod === "" ? 0 : attackMod;
    rollMod += parseInt(attackMod);

    // Note: fantasy types are not affected by commanders.

    if (toHit < 0) { toHit = 0; }
    var modStr = (rollMod < 0) ? rollMod : (rollMod > 0) ? "+" + rollMod : "";

    var roll1 = randomInteger(6);
    var roll2 = randomInteger(6);
    var rollTotal = roll1 + roll2;
    rollTotal += parseInt(rollMod);

    sendChat(chatTarget, css.meleeResult 
        + "Rolling 2d6: " 
        + roll1 
        + " + " 
        + roll2 
        + modStr 
        + " = " 
        + css.rollValue
        + rollTotal
        + css.endValue
        + " vs AC "
        + toHit
        + css.spanEnd
    );

    if (parseInt(rollTotal) < parseInt(toHit)) {
        var result = [];
        result[1] = attackName + " has missed " + defendName + "!";
        result[2] = attackName + " has failed to defeat " + defendName + "!";
        result[3] = defendName + " has dodged the attack of " + attackName + "!";
        result[4] = defendName + " has parried the blow of " + attackName + "!";
        var i = randomInteger(4);
        sendChat(chatTarget, css.meleeResult + result[i] + css.spanEnd);
        if (attackType.toLowerCase() === "hero" 
            || attackType.toLowerCase === "super hero"
            || attackType.toLowerCase === "wizard"
            || attackType.toLowerCase === "wraith"
        ) {
            sendChat(chatTarget, css.meleeResult + attackName 
                + " may withdraw from combat if they choose." + css.spanEnd);
        }
        if (defendType.toLowerCase() === "hero" 
            || defendType.toLowerCase === "super hero"
            || defendType.toLowerCase === "wizard"
            || defendType.toLowerCase === "wraith"
        ) {
            sendChat(chatTarget, css.meleeResult + defendName 
                + " may withdraw from combat if they choose." + css.spanEnd);
        }
    }
    else if (parseInt(rollTotal) === parseInt(toHit)) {
        sendChat(chatTarget, css.meleeResult + defendName 
            + " must fall back 1 move!" + css.spanEnd);
        var iconFallback = "screaming";
        defenderToken.set("status_" + iconFallback, "1");
    }
    else {
        var result = [];
        result[1] = " has been slaughtered!";
        result[2] = " has been annihilated!";
        result[3] = " has been erased!";
        result[4] = " has been stomped!";
        result[5] = " has been sent to their afterlife!";
        result[6] = " is no more!";
        result[7] = " should have run!";
        result[8] = " will haunt this field forever!";
        result[9] = " has died in battle!";
        result[10] = " will no longer be a problem!";
        result[11] = " is dead!";
        result[12] = " has been slain!";
        var i = randomInteger(12);
        sendChat(chatTarget, css.meleeResult + defendName 
            + result[i] + css.spanEnd);
        defenderToken.set("status_dead", true);
    }
}

function lightSensitivityEffect(chatTarget, affectedName) {
    sendChat(chatTarget, css.warning + affectedName 
        + " is sickened by the light!" + css.spanEnd);
}

function isCombatAffectedByDarkness(attackerToken, defenderToken) {
    return isDarkness()
        && !isUnitLightSensitive(attackerToken)
        && !isInSwordLight(defenderToken)
        && !isNearLightSpell(defenderToken)
        && !isHasDarkvision(attackerToken);
}

function doDarknessEffect(chatTarget, attackerToken, defenderToken) {

    var attackName = getPropertyValue(attackerToken, "name");
    var defendName = getPropertyValue(defenderToken, "name");

    if (isCombatAffectedByDarkness(attackerToken, defenderToken)) {
        sendChat(chatTarget, css.warning + attackName 
            + " cannot attack in the dark!" + css.spanEnd);
        return;
    }
    sayLightEffect(defenderToken, chatTarget);
    if (isInSwordLight(defenderToken) && isDarkness()) {
        sendChat(chatTarget, css.magicItem + defendName
            + " is illuminated by the light of a magic sword." + css.spanEnd);
    }
}

function getFantasyAttackTargetValue(attackerType, defenderType) {
    attackerType = attackerType.toLowerCase();
    defenderType = defenderType.toLowerCase();
    if (attackerType === "balrog") {
        if (defenderType === "balrog") { return 7; }
        if (defenderType === "dragon") { return 11; }
        if (defenderType === "elemental") { return 11; }
        if (defenderType === "ent") { return 8; }
        if (defenderType === "giant") { return 8; }
        if (defenderType === "hero") { return 4; }
        if (defenderType === "lycanthrope") { return 6; }
        if (defenderType === "roc") { return 10; }
        if (defenderType === "super hero") { return 7; }
        if (defenderType === "troll") { return 6; }
        if (defenderType === "wight") { return 4; }
        if (defenderType === "wizard") { return 8; }
        if (defenderType === "wraith") { return 11; }
        // undefined defender
        return 4;
    }
    if (attackerType === "dragon") {
        if (defenderType === "balrog") { return 6; }
        if (defenderType === "dragon") { return 8; }
        if (defenderType === "elemental") { return 10; }
        if (defenderType === "ent") { return 6; }
        if (defenderType === "giant") { return 9; }
        if (defenderType === "hero") { return 5; }
        if (defenderType === "lycanthrope") { return 4; }
        if (defenderType === "roc") { return 8; }
        if (defenderType === "super hero") { return 8; }
        if (defenderType === "troll") { return 5; }
        if (defenderType === "wight") { return 2; }
        if (defenderType === "wizard") { return 10; }
        if (defenderType === "wraith") { return 7; }
        // undefined defender
        return 5;
    }
    if (attackerType === "elemental") {
        if (defenderType === "balrog") { return 10; }
        if (defenderType === "dragon") { return 10; }
        if (defenderType === "elemental") { return 11; }
        if (defenderType === "ent") { return 7; }
        if (defenderType === "giant") { return 9; }
        if (defenderType === "hero") { return 4; }
        if (defenderType === "lycanthrope") { return 4; }
        if (defenderType === "roc") { return 7; }
        if (defenderType === "super hero") { return 7; }
        if (defenderType === "troll") { return 7; }
        if (defenderType === "wight") { return 2; }
        if (defenderType === "wizard") { return 8; }
        if (defenderType === "wraith") { return 10; }
        // undefined defender
        return 4;
    }
    if (attackerType === "ent") {
        if (defenderType === "balrog") { return 12; }
        if (defenderType === "dragon") { return 12; }
        if (defenderType === "elemental") { return 12; }
        if (defenderType === "ent") { return 7; }
        if (defenderType === "giant") { return 8; }
        if (defenderType === "hero") { return 4; }
        if (defenderType === "lycanthrope") { return 4; }
        if (defenderType === "roc") { return 11; }
        if (defenderType === "super hero") { return 7; }
        if (defenderType === "troll") { return 7; }
        if (defenderType === "wight") { return 3; }
        if (defenderType === "wizard") { return 10; }
        if (defenderType === "wraith") { return 10; }
        // undefined defender
        return 4;
    }
    if (attackerType === "giant") {
        if (defenderType === "balrog") { return 9; }
        if (defenderType === "dragon") { return 9; }
        if (defenderType === "elemental") { return 10; }
        if (defenderType === "ent") { return 7; }
        if (defenderType === "giant") { return 9; }
        if (defenderType === "hero") { return 6; }
        if (defenderType === "lycanthrope") { return 5; }
        if (defenderType === "roc") { return 7; }
        if (defenderType === "super hero") { return 9; }
        if (defenderType === "troll") { return 6; }
        if (defenderType === "wight") { return 4; }
        if (defenderType === "wizard") { return 10; }
        if (defenderType === "wraith") { return 10; }
        // undefined defender
        return 6;
    }
    if (attackerType === "hero") {
        if (defenderType === "balrog") { return 11; }
        if (defenderType === "dragon") { return 12; }
        if (defenderType === "elemental") { return 10; }
        if (defenderType === "ent") { return 12; }
        if (defenderType === "giant") { return 11; }
        if (defenderType === "hero") { return 7; }
        if (defenderType === "lycanthrope") { return 8; }
        if (defenderType === "roc") { return 10; }
        if (defenderType === "super hero") { return 10; }
        if (defenderType === "troll") { return 9; }
        if (defenderType === "wight") { return 6; }
        if (defenderType === "wizard") { return 11; }
        if (defenderType === "wraith") { return 11; }
        // undefined defender
        return 7;
    }
    if (attackerType === "lycanthrope") {
        if (defenderType === "balrog") { return 10; }
        if (defenderType === "dragon") { return 12; }
        if (defenderType === "elemental") { return 12; }
        if (defenderType === "ent") { return 12; }
        if (defenderType === "giant") { return 10; }
        if (defenderType === "hero") { return 7; }
        if (defenderType === "lycanthrope") { return 9; }
        if (defenderType === "roc") { return 10; }
        if (defenderType === "super hero") { return 10; }
        if (defenderType === "troll") { return 8; }
        if (defenderType === "wight") { return 6; }
        if (defenderType === "wizard") { return 10; }
        if (defenderType === "wraith") { return 12; }
        // undefined defender
        return 7;
    }
    if (attackerType === "roc") {
        if (defenderType === "balrog") { return 12; }
        if (defenderType === "dragon") { return 12; }
        if (defenderType === "elemental") { return 12; }
        if (defenderType === "ent") { return 9; }
        if (defenderType === "giant") { return 10; }
        if (defenderType === "hero") { return 12; }
        if (defenderType === "lycanthrope") { return 6; }
        if (defenderType === "roc") { return 9; }
        if (defenderType === "super hero") { return 8; }
        if (defenderType === "troll") { return 6; }
        if (defenderType === "wight") { return 5; }
        if (defenderType === "wizard") { return 10; }
        if (defenderType === "wraith") { return 9; }
        // undefined defender
        return 12;
    }
    if (attackerType === "super hero") {
        if (defenderType === "balrog") { return 9; }
        if (defenderType === "dragon") { return 10; }
        if (defenderType === "elemental") { return 8; }
        if (defenderType === "ent") { return 11; }
        if (defenderType === "giant") { return 9; }
        if (defenderType === "hero") { return 4; }
        if (defenderType === "lycanthrope") { return 6; }
        if (defenderType === "roc") { return 8; }
        if (defenderType === "super hero") { return 8; }
        if (defenderType === "troll") { return 5; }
        if (defenderType === "wight") { return 4; }
        if (defenderType === "wizard") { return 9; }
        if (defenderType === "wraith") { return 8; }
        // undefined defender
        return 4;
    }
    if (attackerType === "troll") {
        if (defenderType === "balrog") { return 10; }
        if (defenderType === "dragon") { return 12; }
        if (defenderType === "elemental") { return 11; }
        if (defenderType === "ent") { return 10; }
        if (defenderType === "giant") { return 9; }
        if (defenderType === "hero") { return 8; }
        if (defenderType === "lycanthrope") { return 8; }
        if (defenderType === "roc") { return 9; }
        if (defenderType === "super hero") { return 11; }
        if (defenderType === "troll") { return 7; }
        if (defenderType === "wight") { return 10; }
        if (defenderType === "wizard") { return 11; }
        if (defenderType === "wraith") { return 12; }
        // undefined defender
        return 8;
    }
    if (attackerType === "wight") {
        if (defenderType === "balrog") { return 12; }
        if (defenderType === "dragon") { return 12; }
        if (defenderType === "elemental") { return 12; }
        if (defenderType === "ent") { return 12; }
        if (defenderType === "giant") { return 11; }
        if (defenderType === "hero") { return 9; }
        if (defenderType === "lycanthrope") { return 8; }
        if (defenderType === "roc") { return 11; }
        if (defenderType === "super hero") { return 12; }
        if (defenderType === "troll") { return 9; }
        if (defenderType === "wight") { return 8; }
        if (defenderType === "wizard") { return 10; }
        if (defenderType === "wraith") { return 7; }
        // undefined defender
        return 9;
    }
    if (attackerType === "wizard") {
        if (defenderType === "balrog") { return 7; }
        if (defenderType === "dragon") { return 9; }
        if (defenderType === "elemental") { return 6; }
        if (defenderType === "ent") { return 10; }
        if (defenderType === "giant") { return 11; }
        if (defenderType === "hero") { return 8; }
        if (defenderType === "lycanthrope") { return 7; }
        if (defenderType === "roc") { return 9; }
        if (defenderType === "super hero") { return 10; }
        if (defenderType === "troll") { return 8; }
        if (defenderType === "wight") { return 6; }
        if (defenderType === "wizard") { return 10; }
        if (defenderType === "wraith") { return 5; }
        // undefined defender
        return 8;
    }
    if (attackerType === "wraith") {
        if (defenderType === "balrog") { return 10; }
        if (defenderType === "dragon") { return 12; }
        if (defenderType === "elemental") { return 7; }
        if (defenderType === "ent") { return 12; }
        if (defenderType === "giant") { return 12; }
        if (defenderType === "hero") { return 8; }
        if (defenderType === "lycanthrope") { return 9; }
        if (defenderType === "roc") { return 10; }
        if (defenderType === "super hero") { return 10; }
        if (defenderType === "troll") { return 9; }
        if (defenderType === "wight") { return 11; }
        if (defenderType === "wizard") { return 12; }
        if (defenderType === "wraith") { return 7; }
        // undefined defender
        return 8;
    }
    // undefined attacker
    if (defenderType === "dragon") { return 12; }
    if (defenderType === "elemental") { return 10; }
    if (defenderType === "ent") { return 12; }
    if (defenderType === "giant") { return 11; }
    if (defenderType === "hero") { return 7; }
    if (defenderType === "lycanthrope") { return 8; }
    if (defenderType === "roc") { return 10; }
    if (defenderType === "super hero") { return 10; }
    if (defenderType === "troll") { return 9; }
    if (defenderType === "wight") { return 6; }
    if (defenderType === "wizard") { return 11; }
    if (defenderType === "wraith") { return 11; }
    // undefined attacker and defender
    return 7;
}


