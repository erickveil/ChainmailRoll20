/**
 * chatListener.js
 * Erick Veil
 * 2018-03-27
 *
 * Listens for API commands to execute and dice rolls to act on
 *
 */

var isSelectedDone = false;
var isTargetDone = false;

/**
 * On Chat Listener
 */
on("chat:message", function(msg) {
    try {
        eventMeleeAttack(msg);
        eventMeleeDiceRolled(msg);
    }
    catch(err) {
        if (typeof err === "string") {
            log("String error caught: " + err);
        }
        else if (typeof err === "object"
            && typeof err.chatMsg !== "undefined"
            ) {
            log(err);
            sendChat(msg.who, err.chatMsg);
        }
        else if (typeof err === "undefined") {
            log("Threw an undefined exception: Probably forgot to use 'new'.");
        }
        else {
            log("Unknown error type: " + err);
        }
    }
});



/**
 * Listens for the dice rolled during a melee attack.
 *
 * Listening for dice this way, rather than using the sendChat callback, allows us to
 * show the dice rolls that we act on.
 *

 * @param msg
 */
function eventMeleeDiceRolled(msg) {
    var rollData = (msg.type === "rollresult" ? JSON.parse(msg.content) : "");
    var kills;
    var barnum = 3;
    var casualtiesBarValue = "bar"+ barnum + "_value";
    var selectedName;
    var targetName;
    var survived;


    if (msg.type === "rollresult"
        && isMyMeleeRollResult(rollData, selectedObj)) {

        selectedName = getPropertyValue(selectedObj, "name");
        targetName = getPropertyValue(targetObj, "name");
        kills = (rollData.total)*1;

        // set casualties to defender
        targetObj.set(casualtiesBarValue, kills);

        // announce casualties
        sendChat(msg.who, selectedName + " attacks " + targetName + " and kills "
            + kills + " troops.");

        survived = calculateTroopLoss(msg, targetObj);
        if (survived) { heavyLossMoraleCheck(msg, targetObj); }
        isSelectedDone = true;
        if (isTargetDone) {
            isSelectedDone = false;
            isTargetDone = false;
            checkMorale(msg);
        }
    }
    else if (msg.type === "rollresult"
        && isMyMeleeRollResult(rollData, targetObj)) {

        selectedName = getPropertyValue(selectedObj, "name");
        targetName = getPropertyValue(targetObj, "name");
        kills = (rollData.total)*1;

        // add casualties to defender
        selectedObj.set(casualtiesBarValue, kills);

        // announce casualties
        sendChat(msg.who, targetName + " counterattacks " + selectedName + " and kills "
            + kills + " troops.");

        // check for dead unit before heavy loss
        survived = calculateTroopLoss(msg, selectedObj);
        if (survived) { heavyLossMoraleCheck(msg, selectedObj); }

        // apply casualties
        // resolve melee morale
        // end of melee
        sendChat(msg.who, "Done");
        isTargetDone = true;
        if (isSelectedDone) {
            isSelectedDone = false;
            isTargetDone = false;
            checkMorale(msg);
        }
    }
}

// TODO: Do not check morale if one side is dead, or has failed heavy loss morale
function checkMorale(msg) {
    var selectedObjList = [];
    selectedObjList[0] = selectedObj;
    selectedObjList[1] = targetObj;
    var isLowUnits = false;

    resolveMeleeMorale(msg.who, selectedObjList, isLowUnits);
}

function isMyMeleeRollResult(rollData, unitObj) {

    var unitName = getPropertyValue(unitObj, "name");
    var rollName = getRollResultText(rollData);

    var unitTroops = getTokenBarValue(unitObj, 1);
    var casualties = getTokenBarValue(unitObj, 3);
    var troopsBeforeLoss = unitTroops*1 + casualties*1;
    var rollDice = getRollResultDice(rollData);

    return (unitName === rollName) && (troopsBeforeLoss*1 === rollDice*1);
}

function getRollResultText(rollData) {
    var rollText = rollData.rolls[1].text.trim();
    return rollText;
}

function getRollResultDice(rollData) {
    var rollObj = rollData.rolls[0];
    var rollDice = rollObj.dice;
    return rollDice;
}


