/**
 * ArmyManager.js
 * Erick Veil
 * 2018-05-31
 *
 * Counts each unit for each army as it is placed on the board and adds to troop attribute.
 * Subtracts each unit for each army as it is removed from the board.
 * Counts up the points that have been spent and sets attribute on its sheet.
 *
 * Each figure added to the board adds 1 to the army figures count and figures max, and adds the unit points to the
 * points count.
 * Each figure deleted from the board subtracts 1 from the army figures count only.
 *
 * Macro button counts up the units on the board and sets the army values for a new game.
 */

var isGameStarted = false;

on("ready", function() { onReady(); });

function onReady() {
    on("add:graphic", function(addedObj) { onAddedGraphic(addedObj); });
}

function onAddedGraphic(addedObj) {
    var sheetId = getPropertyValue(addedObj, "represents");
    var armyName = getArmyName(sheetId);
    var armySheetId = (armyName === "")? "" : getArmySheetId(armyName);
    var currentFiguresValue = getAttributeWithError(armySheetId, "Figures");
    if (currentFiguresValue === "") { currentFiguresValue = 0; }
    setAttributeWithError(armySheetId, "Figures", parseInt(currentFiguresValue) + 1);
}




