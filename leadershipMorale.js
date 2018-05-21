/**
 * leadershipMorale.js
 * Erick Veil
 * 2018-05-10
 *
 * Provides access to morale modifiers for the likes of captains and wizards for allies.
 */

/**
 * Use when any unit is checking its own morale.
 * Determines if a leader type unit is nearby and returns true if they are.
 */
function isGetsLeadershipMoraleBonus(originToken) {
    var tokenList = getFirstLeaderInRange(originToken);
    var isGetsBonus = (tokenList.length !== 0);
    /*
    if (isGetsBonus) { log("gets morale bonus.");}
    else { log("no morale bonus.");}
    */
    return isGetsBonus;
}

function getLeaderName(originToken) {
    var tokenList = getFirstLeaderInRange(originToken);
    return getPropertyValue(tokenList[0], "name");
}

function getFirstLeaderInRange(originToken) {
    var foundObjList = filterObjs(function(obj) {
        // isObjectWizard, isObjectCommander, etc all go here.
        return (isObjectWizard(obj)
            && isObjectInRange(originToken, obj)
            && isObjectOnMyTeam(originToken, obj));
    });
    //log(foundObjList);
    return foundObjList;
}

function isObjectOnMyTeam(myToken, targetToken) {
    if (!isObjectToken(myToken)) {
        return false;
    }
    try {
        var mySheet = getPropertyValue(myToken, "represents");
        var targetSheet = getPropertyValue(targetToken, "represents");
        var myTeam = getAttributeWithError(mySheet, "Army");
        var targetTeam = getAttributeWithError(targetSheet, "Army");
        return (myTeam === targetTeam);
    }
    catch (err) {
        // tokens might not have the expected attributes as they are not units
        return false;
    }
}

function isObjectWizard(obj) {
    if (!isObjectToken(obj)) {
        return false;
    }
    try {
        var unitType = getTokenUnitType(obj);
        return (unitType === "Wizard");
    }
    catch (err) {
        // tokens might not have the expected attributes as they are not units
        return false;
    }
}

function isObjectFearless(obj) {
    if (!isObjectToken(obj)) {
        return false;
    }
    try {
        var unitType = getTokenUnitType(obj);
        if (unitType === "Wizard") { return true; }
        var sheetId = getPropertyValue(obj, "represents");
        return (isHasAttribute(sheetId, "Fearless"));
    }
    catch (err) {
        // tokens might not have the expected attributes as they are not units
        return false;
    }
}

function isObjectToken(obj) {
    if (getPropertyValue(obj, "_type") !== "graphic") { return false; }
    return (getPropertyValue(obj, "_subtype") === "token");
}

function getTokenUnitType(token) {
    var represents = getPropertyValue(token, "represents");
    return getAttributeWithError(represents, "Unit Type");
}

function isObjectInRange(originToken, testToken) {
    // if range proves to be variable, then this will need
    // to be refactored into an argument.
    // morale range for wizards: 12
    var range = 12;

    // default grid is 70px
    var GRID_SIZE = 70;
    var distance = getDistance(originToken, testToken);
    return (distance <= range * GRID_SIZE);
}

function getDistance(obj1, obj2) {
    var x1 = getPropertyValue(obj1, "left");
    var y1 = getPropertyValue(obj1, "top");
    var x2 = getPropertyValue(obj2, "left");
    var y2 = getPropertyValue(obj2, "top");

    //             _________________
    // distance = √(x₂-x₁)²+(y₂-y₁)²
    //                a        b

    var a = Math.pow((x2 - x1), 2);
    var b = Math.pow((y2 - y1), 2);
    var distance = Math.sqrt(a + b);
    return distance;
}



