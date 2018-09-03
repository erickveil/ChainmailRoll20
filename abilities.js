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


