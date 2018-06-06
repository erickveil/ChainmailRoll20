/**
 * magic.js
 * Erick Veil
 * 2018-06-05
 *
 * Functions to handle wizard magic.
 */

function isHasLightSpell(tokenObj) {
    return (tokenObj.get("status_half-haze"));
}

function isHasDarkvision(sheetId) {
    if (!isHasAttribute(sheetId, "Darkvision")) { return false; }
    return isAttrSetTrue(sheetId, "Darkvision");
}

function isNearLightSpell(tokenObj) {
    var tokenList = getFirstLightSourceInRange(tokenObj);
    return (tokenList.length !== 0);
}

function getFirstLightSourceInRange(tokenObj) {
    var foundObjList = filterObjs(function(obj) {
        var objType = getPropertyValue(obj, "type");
        if (objType !== "graphic") { return false; }
        var subType = getPropertyValue(obj, "subtype");
        if (subType !== "token") { return false; }

        if (!isHasLightSpell(obj)) { return false; }

        var lightRange = 24;
        return isObjectInRange(tokenObj, obj, lightRange);
    });
    return foundObjList;
}

function sayLightEffect(tokenObj, who) {
    var tokenName = getPropertyValue(tokenObj, "name");
    if (isDarkness() && isNearLightSpell(tokenObj) && !isInSwordLight(tokenObj)) {
        sendChat(who, css.spells + tokenName + " are illuminated by Wizard Light!" + css.spanEnd);
    }
}

