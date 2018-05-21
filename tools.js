/**
 * tools.js
 * Erick Veil
 * 2018-03-27
 *
 * A collection of general functions and wrappers that allow
 * me to get values and validate them with exceptions.
 */

/**
 * getObj wrapper with some validation and feedback.
 *
 * @param objType
 * @param objId
 * @returns {*}
 */
function getObjectWithReport(objType, objId) {
    var obj = getObj(objType, objId);
    if (typeof obj === "undefined") {
        var logMsg = "Object id " + objId;
        var chatMsg = "Could not find the " + objType + " object.";
        throw new roll20Exception(logMsg, chatMsg);
    }
    return obj;
}

/**
 * Validates that an object has a _type property with a matching value.
 *
 * @param targetObj
 * @param tokenType
 */
function validateObjectType(targetObj, tokenType) {
    var propVal = getPropertyValue(targetObj, "_type");
    if (propVal === tokenType) { return; }
    var logVal = "Token type is incorrect. Actual: " + propVal + " Expected: "
        + tokenType;
    var chatVal = "Wrong object type: " + propVal + ". Should be " + tokenType;

    throw new roll20Exception(logVal, chatVal);
}

/**
 * Gets the value set to one of the three token bars
 *
 * @param tokenId
 * @param barNum
 */
function getTokenBarValue(tokenObj, barNum) {
    return getPropertyValue(tokenObj, "bar" + barNum + "_value");
}

/**
 *
 * @param tokenObj
 * @param barNum
 * @returns {*}
 */
function getTokenBarMax(tokenObj, barNum) {
    return getPropertyValue(tokenObj, "bar" + barNum + "_max");
}

/**
 * Gets the value of an object property with validation
 *
 * @param obj
 * @param property
 * @returns {*}
 */
function getPropertyValue(obj, property) {
    var propVal = obj.get(property);

    if (typeof propVal === "undefined") {
        var logMsg = "Could not get property value " + property
            + " value from token:\n" + obj;
        var chatMsg = "Could not get property. Action failed";
        throw new roll20Exception(logMsg, chatMsg);
    }
    return propVal;
}

/**
 *
 * @param characterId
 * @param attribute
 * @param valueType
 * @returns {*}
 */
function getAttributeWithError(characterId, attribute, valueType)
{
    if (characterId === "") {
        var logMsg = "Empty characterId passed to getAttributeWithError. attribute: " + attribute;
        var chatMsg = "";
        throw new roll20Exception(logMsg, chatMsg);
    }

    // ------
    if (!isHasAttribute(characterId, attribute)) {
        var debugList = findObjs({_id: characterId});
        var debugName = getPropertyValue(debugList[0], "name");
        logMsg = "Object does not have attribute -- charId: " + characterId + " attribute: " + attribute
            + " name: " + debugName;
        chatMsg = "";
        throw new roll20Exception(logMsg, chatMsg);
    }
    // ------

    var attVal = getAttrByName(characterId, attribute, valueType);
    if (typeof attVal === "undefined") {
        logMsg = "Could not find attribute " + attribute
            + " value from character id " + characterId;
        chatMsg = "";
        throw new roll20Exception(logMsg, chatMsg);
    }
    return attVal;
}

function isHasAttribute(sheetId, attributeName) {

    var attributeObj = findObjs({ type: 'attribute', _characterid: sheetId, name: attributeName });
    return (attributeObj.length !== 0);
}

/**
 * An exception with data for log and chat
 *
 * @param pLogMsg
 * @param pChatMsg
 */
function roll20Exception(pLogMsg, pChatMsg) {
    this.logMsg = pLogMsg;
    this.chatMsg = pChatMsg;
    this.exType = "roll20Exception";
}

function getSheetById(sheetId) {
    var resultList = findObjs({type:"character", _id:sheetId});
    if (resultList.length < 0 || typeof resultList[0] === "undefined") {
        var logMsg = "sheet id: " + sheetId;
        var chatMsg = "Could not find the stat sheet.";
        throw new roll20Exception(logMsg, chatMsg);
    }
    return resultList[0];
}

function getTokenById(tokenId) {
    var resultList = findObjs({type:"graphic", _id:tokenId});
    if (resultList.length < 0 || typeof resultList[0] === "undefined") {
        var logMsg = "token id: " + tokenId;
        var chatMsg = "Could not find the token.";
        throw new roll20Exception(logMsg, chatMsg);
    }
    return resultList[0];
}

function getArmyName(unitSheetId) {
    return getAttributeWithError(unitSheetId, "Army");
}

function getArmySheetId(armyName) {
    var resultList = findObjs({type:"character", name:armyName});
    if (resultList.length < 0 || typeof resultList[0] === "undefined") {
        return "";
        /*
        var chatMsg = "Could not find the army sheet for " + armyName;
        var logMsg = "";
        throw new roll20Exception(logMsg, chatMsg);
        */
    }
    return getPropertyValue(resultList[0], "_id");
}

function getTokenSheetId(tokenObj) {
    return getPropertyValue(tokenObj, "represents");
}

function pingObject(obj) {
    var x = getPropertyValue(obj, "left");
    var y = getPropertyValue(obj, "top");
    var pageId = getPropertyValue(obj, "pageid");
    sendPing(x, y, pageId);
}

/**
 *
 * @param tokenObj
 * @returns false if not flying, or the altitude of the flier (1-9) if it is.
 */
function isFlying(tokenObj) {
    return (tokenObj.get("status_fluffy-wing"));
}

function isInWater(tokenObj) {
    return (tokenObj.get("status_chained-heart"));
}



