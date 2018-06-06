/**
 * magic.js
 * Erick Veil
 * 2018-06-05
 *
 * Functions to handle wizard magic.
 */

function isHasLightSpell(tokenObj) {
    if (tokenObj.get("status_half-haze")) {
        log("has half-haze");
        return true;
    }
    return false;
}

function isNearLightSpell(tokenObj) {
    var tokenList = getFirstLightSourceInRange(tokenObj);
    log(tokenList);
    if (tokenList.length !== 0) {
        log("is near light spell");
        return true;
    }
    return false;
}

function getFirstLightSourceInRange(tokenObj) {
    var foundObjList = filterObjs(function(obj) {
        var objType = getPropertyValue(obj, "type");
        if (objType !== "graphic") { return false; }
        var subType = getPropertyValue(obj, "subtype");
        if (subType !== "token") { return false; }

        var objName = getPropertyValue(obj, "name");
        log(objName);

        if (!isHasLightSpell(obj)) { return false; }
        log("Found someone with light");

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

