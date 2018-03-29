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
var isRearAttack = false;

/**
 * On Chat Listener
 */
on("chat:message", function(msg) {
    try {
        eventMissileAttack(msg);
        eventMeleeAttack(msg);
        eventFlankAttack(msg);
        eventRearAttack(msg);
        eventPolarmAdvantageAttack(msg);
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
    var selectedName;
    var targetName;
    var survived;


    if (msg.type === "rollresult"
        && isMyMeleeRollResult(rollData, selectedObj)) {

        selectedName = getPropertyValue(selectedObj, "name");
        targetName = getPropertyValue(targetObj, "name");
        kills = (rollData.total)*1;
        applyCasualties(targetObj, kills);

        // announce casualties
        sendChat(msg.who, selectedName + " attacks " + targetName + " and kills "
            + kills + " troops.");

        survived = calculateTroopLoss(msg, targetObj);
        if (survived) { heavyLossMoraleCheck(msg, targetObj); }
        isSelectedDone = true;
        if (isTargetDone || isRearAttack) {
            isSelectedDone = false;
            isTargetDone = false;
            isRearAttack = false;
            checkMorale(msg);
        }
    }
    else if (msg.type === "rollresult"
        && isMyMeleeRollResult(rollData, targetObj)) {

        selectedName = getPropertyValue(selectedObj, "name");
        targetName = getPropertyValue(targetObj, "name");
        kills = (rollData.total)*1;

        // add casualties to defender
        applyCasualties(selectedObj, kills);

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
        if (isSelectedDone || isRearAttack) {
            isSelectedDone = false;
            isTargetDone = false;
            isRearAttack = false;
            checkMorale(msg);
        }
    }
}

function checkMorale(msg) {
    var selectedObjList = [];
    selectedObjList[0] = selectedObj;
    selectedObjList[1] = targetObj;
    if (isOneSideDefeated(selectedObjList)) { return; }
    resolveMeleeMorale(msg.who, selectedObjList);
}

function isOneSideDefeated(unitList) {
    for (var i = 0; i < unitList.length; ++i) {
        var troops = getTokenBarValue(unitList[i], 1);
        var isDead = unitList[i].get("status_dead");
        if (troops*1 < 1 || isDead) { return true; }
    }
    return false;
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


