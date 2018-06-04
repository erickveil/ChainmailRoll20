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
}

function onDestroyGraphic(destroyedObj) {
    decrementArmyFigureCount(destroyedObj);
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

}



