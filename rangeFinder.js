/**
 * rangeFinder.js
 * Erick Veil
 * 2018-05-13
 *
 * Functions to toggle various range aids on and off on a token.
 */


function eventToggleMissileRange(msg) {
    if (!(msg.type === "api" && msg.content.indexOf("!missileRange ") !== -1)) {
        return;
    }
    var argStr = msg.content.replace("!missileRange ", "");
    var tokenId = argStr;
    var selectedToken = getTokenById(tokenId);
    var sheetId = getTokenSheetId(selectedToken);
    var missileRange = getAttributeWithError(sheetId, "Missile Range");
    var templateRadius = missileRange * 10;
    var currentRadius = getPropertyValue(selectedToken, "aura1_radius");
    var missileRangeColor = "#ff8877";
    if (currentRadius !== "") {
        selectedToken.set("aura1_radius", "");
        return;
    }
    selectedToken.set("aura1_square", false);
    selectedToken.set("aura1_color", missileRangeColor);
    selectedToken.set("aura1_radius", templateRadius);
}

function eventToggleMovementRange(msg) {
    if (!(msg.type === "api" && msg.content.indexOf("!moveRange ") !== -1)) {
        return;
    }
    var argStr = msg.content.replace("!moveRange ", "");
    var tokenId = argStr;
    var selectedToken = getTokenById(tokenId);
    var sheetId = getTokenSheetId(selectedToken);
    var moveRange = getAttributeWithError(sheetId, "Move", "max");
    var templateRadius = moveRange * 10;
    var currentRadius = getPropertyValue(selectedToken, "aura2_radius");
    var moveRangeColor = "#005caa";
    if (currentRadius !== "") {
        selectedToken.set("aura2_radius", "");
        return;
    }
    selectedToken.set("aura2_square", false);
    selectedToken.set("aura2_color", moveRangeColor);
    selectedToken.set("aura2_radius", templateRadius);

}

function eventToggleChargeRange(msg) {
    if (!(msg.type === "api" && msg.content.indexOf("!chargeRange ") !== -1)) {
        return;
    }
    var argStr = msg.content.replace("!chargeRange ", "");
    var tokenId = argStr;
    var selectedToken = getTokenById(tokenId);
    var sheetId = getTokenSheetId(selectedToken);
    var chargeRange = getAttributeWithError(sheetId, "Charge");
    var templateRadius = chargeRange * 10;
    var currentRadius = getPropertyValue(selectedToken, "aura2_radius");
    var chargeRangeColor = "#ffc100";
    if (currentRadius !== "") {
        selectedToken.set("aura2_radius", "");
        return;
    }
    selectedToken.set("aura2_square", false);
    selectedToken.set("aura2_color", chargeRangeColor);
    selectedToken.set("aura2_radius", templateRadius);

}

function eventToggleMiscRange(msg) {
    if (!(msg.type === "api" && msg.content.indexOf("!miscRange ") !== -1)) {
        return;
    }
    var argStr = msg.content.replace("!miscRange ", "");
    var argList = argStr.split(",");
    if (argList.length !== 2) {
        var logMsg = "Not enough arguments for toggleMiscRange: " + msg.content;
        var chatMsg = logMsg;
        throw new roll20Exception(logMsg, chatMsg);
    }
    var tokenId = argStr[0];
    var range = arglist[1];
    var color = argList[2];

    var selectedToken = getTokenById(tokenId);
    var currentRadius = getPropertyValue(selectedToken, "aura1_radius");
    if (currentRadius !== "") {
        selectedToken.set("aura1_radius", "");
        return;
    }
    selectedToken.set("aura1_square", false);
    selectedToken.set("aura1_color", color);
    selectedToken.set("aura1_radius", range);

}

