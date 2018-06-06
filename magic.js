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

        if (!isHasLightSpell(tokenObj)) { return false; }

        var lightRange = 24;
        return isObjectInRange(tokenObj, obj, lightRange);
    });
    return foundObjList;
}

// TODO: NEXT: Check isNearLightSpell when attacking or shooting in the dark.
