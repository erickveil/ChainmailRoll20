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
        var logMsg = "Could not find object type " + objType + " with id " + objId;
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
    var attVal = getAttrByName(characterId, attribute, valueType);
    if (typeof attVal === "undefined") {
        var logMsg = "Could not find attribute " + attribute
            + " value from character id " + characterId;
        var chatMsg = "";
        throw new roll20Exception(logMsg, chatMsg);
    }
    return attVal;
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

