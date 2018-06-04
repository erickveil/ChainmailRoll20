/**
 * ArmyManager.js
 * Erick Veil
 * 2018-05-31
 *
 * Counts each unit for each army as it is placed on the board and adds to troop attribute.
 * Subtracts each unit for each army as it is removed from the board.
 * Counts up the points that have been spent and sets attribute on its sheet.
 *
 * Each figure added to the board adds 1 to the army figures count and adds the unit points to the
 * points count.
 * Each figure deleted from the board subtracts 1 from the army figures count only.
 *
 * Macro button counts up the units on the board and sets the army values for a new game.
 * Macro button the resets all army sheets.
 *
 * https://wiki.roll20.net/API:Events
 *
 */

var isGameStarted = false;

on("ready", function() { onReady(); });

function onReady() {
    on("add:graphic", function(addedObj) { onAddedGraphic(addedObj); });
    on("destroy:graphic", function(destroyedObj) { onDestroyGraphic(destroyedObj); });
}

/**
 * Note it does not count copy/pasted objects...
 * @param addedObj
 */
function onAddedGraphic(addedObj) {
    incrementArmyFigureCount(addedObj);
    incrementArmyPointCount(addedObj);
}

function onDestroyGraphic(destroyedObj) {
    decrementArmyFigureCount(destroyedObj);
    decrementArmyPointCount(destroyedObj);
}

/**
 * Increments the Figure count value on the army of a figure that is added.
 *
 * @param addedObj
 */
function incrementArmyFigureCount(addedObj) {
    var sheetId = getPropertyValue(addedObj, "represents");
    var armyName = getArmyName(sheetId);
    // No army, no need.
    if (armyName === "") { return; }
    var armySheetId = getArmySheetId(armyName);
    var currentFiguresValue = getAttributeWithError(armySheetId, "Figures");
    if (currentFiguresValue === "") { currentFiguresValue = 0; }
    setAttributeWithError(armySheetId, "Figures", parseInt(currentFiguresValue) + 1);
}

function decrementArmyFigureCount(deletedObj) {
var sheetId = getPropertyValue(deletedObj, "represents");
    var armyName = getArmyName(sheetId);
    // No army, no need.
    if (armyName === "") { return; }
    var armySheetId = getArmySheetId(armyName);
    var currentFiguresValue = getAttributeWithError(armySheetId, "Figures");
    if (currentFiguresValue === "") { currentFiguresValue = 0; }
    setAttributeWithError(armySheetId, "Figures", parseInt(currentFiguresValue) - 1);
}

function incrementArmyPointCount(addedObj) {
    var sheetId = getPropertyValue(addedObj, "represents");
    var pointValue = getAttribute(sheetId, "Point Cost");
    // No army, no need.
    if (pointValue === "") { return; }
    var armyName = getArmyName(sheetId);
    // No army, no need.
    if (armyName === "") { return; }
    var armySheetId = getArmySheetId(armyName);
    var currentFiguresValue = getAttributeWithError(armySheetId, "Points");
    if (currentFiguresValue === "") { currentFiguresValue = 0; }
    setAttributeWithError(armySheetId, "Points", parseInt(currentFiguresValue) + parseFloat(pointValue));
}

function decrementArmyPointCount(deletedObj) {
    var sheetId = getPropertyValue(deletedObj, "represents");
    var pointValue = getAttribute(sheetId, "Point Cost");
    // No army, no need.
    if (pointValue === "") { return; }
    var armyName = getArmyName(sheetId);
    // No army, no need.
    if (armyName === "") { return; }
    var armySheetId = getArmySheetId(armyName);
    var currentFiguresValue = getAttributeWithError(armySheetId, "Points");
    if (currentFiguresValue === "") { currentFiguresValue = 0; }
    setAttributeWithError(armySheetId, "Points", parseInt(currentFiguresValue) - parseFloat(pointValue));
}

/**
 * Counts up all figures and points on the board for the selected army and sets those values to the army sheet.
 *
 * Intended to be called from a chat API command while the army crest is selected. A macro button on the crest
 * should perform the actual chat API command.
 *
 * The event listener will then detect the command and call this function.
 *
 * Just adding and deleting units from the board will add and subtract figure and point values, but the math is
 * sometimes wonky, and the events aren't triggered during a cut and paste (which is common for setting up large
 * armies). It's a good validation to hit this macro when you think you're done for a final tally.
 *
 * @param armyCrestToken - The token for the army itself: the army crest with the figure/point counters set as bars.
 */
function setFigureAndPointBalance(armyCrestToken) {
    var sheetId = getPropertyValue(armyCrestToken, "represents");
    var armySheet = getSheetById(sheetId);
    var armyName = getPropertyValue(armySheet, "name");
    var objectList = findObjs({
        type: "graphic",
        subtype: "token"
    });
    var figureCount = 0;
    var pointCount = 0;
    for (var i = 0; i < objectList.length; ++i) {
        var targetSheetId = getPropertyValue(objectList[i], "represents");
        var tokenArmyName = getAttribute(targetSheetId, "Army");
        if (tokenArmyName !== armyName) { continue; }
        ++figureCount;
        var pointValue = getAttribute(targetSheetId, "Point Cost");
        if (pointValue === "") {
            var debugName = getPropertyValue(objectList[i], "name");
            log("Point Value not found for token " + debugName + ", assigned to army: " + armyName);
            continue;
        }
        pointCount += parseFloat(pointValue);
    }

    setAttributeWithError(sheetId, "Figures", figureCount);
    setAttributeWithError(sheetId, "Points", pointCount);
}

function eventTallyArmy(msg) {
    if (!(msg.type === "api" && msg.content.indexOf("!tallyArmy ") !== -1)) {
        return;
    }
    var argStr = msg.content.replace("!tallyArmy ", "");
    var argList = argStr.split(",");
    if (argList.length !== 1) {
        var logMsg = "Not enough arguments in !tallyArmy command: " + msg.content;
        var chatMsg = css.error + "The !tallyArmy macro is set up incorrectly." + css.spanEnd;
        throw new roll20Exception(logMsg, chatMsg);
    }
    var selectedId = argList[0];
    var selectedObj = getObjectWithReport("graphic", selectedId);
    setFigureAndPointBalance(selectedObj);
}




