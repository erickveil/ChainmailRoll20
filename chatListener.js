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
var isAttackerImmune = false;
var isForceCheck = false;

// Melee between similar unit type tracking:
var numTurnsMeleeDiceRecieved = 0;
var gNumRolled1 = -1;
var gNumRolled2 = -1;
var gNumKills1 = -1;
var gNumKills2 = -1;

/**
 * On Chat Listener
 */
on("chat:message", function(msg) {
    try {
        //log("------------");
        eventMissileAttack(msg);
        eventIndirectMissileAttack(msg);
        eventMeleeAttack(msg);
        eventFlankAttack(msg);
        eventRearAttack(msg);
        eventPolarmAdvantageAttack(msg);
        eventMeleeDiceRolled(msg);
        eventFearMoraleCheck(msg);
        eventClearAllTints(msg);
        eventToggleChargeRange(msg);
        eventToggleMiscRange(msg);
        eventToggleMissileRange(msg);
        eventToggleIndirectMissileRange(msg);
        eventToggleMovementRange(msg);
        eventTallyArmy(msg);
    }
    catch(err) {
        if (typeof err === "string") {
            log("String error caught: " + err);
        }
        else if (typeof err === "object"
            && typeof err.chatMsg !== "undefined"
            ) {
            log("Exception: " + err);
            sendChat(msg.who, css.error + err.chatMsg + css.spanEnd);
        }
        else if (typeof err === "undefined") {
            log("Threw an undefined exception: Probably forgot to use 'new'.");
        }
        else {
            log("Unknown error type: " + err);
        }
    }
});

function eventClearAllTints(msg) {
    if (!(msg.type === "api" && msg.content.indexOf("!clearTints") !== -1)) {
        return;
    }
    removeAllTints();
}

/**
 * Extracts the number of dice that were rolled from the roll data object.
 *
 * @param rollData object - Result of JSON.parse(msg.content) when msg.type is "rollresult"
 * @returns int
 */
function getDiceRolled(rollData) {

    var rollsList = rollData.rolls;
    for (var i = 0; i < rollsList.length; ++i) {
        var record = rollsList[i];
        var recordType = record.type;
        if (recordType !== "R") { continue; }
        return parseInt(record.dice);
    }
    return 0;
}

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

    if (msg.type === "rollresult") {
        //log("rollresult, selectedObj = " + selectedObj);
        //log(msg.content);
    }

    /* If selectedName and targetName are the same (orcs like to fight each other)
     * then it will be difficult to discern who gets what damage.
     */
    if (msg.type === "rollresult"
        && typeof(selectedObj) !== "undefined"
        && typeof(targetObj) !== "undefined"
    ) {
        selectedName = getPropertyValue(selectedObj, "name");
        targetName = getPropertyValue(targetObj, "name");
    }

    var isSameUnitType = (selectedName === targetName);
    if (msg.type ==="rollresult" && isSameUnitType) {

        ++numTurnsMeleeDiceRecieved;
        kills = parseInt(rollData.total);

        // store number of dice rolled:
        if (gNumRolled1 === -1) { gNumRolled1 = getDiceRolled(rollData); }
        else { gNumRolled2 = getDiceRolled(rollData); }

        // store number of kills:
        if (gNumKills1 === -1) { gNumKills1 = kills; }
        else { gNumKills2 = kills; }

        var isBothSidesAccountedFor = (numTurnsMeleeDiceRecieved >= 2 || isRearAttack || isAttackerImmune);
        if (isBothSidesAccountedFor) {
            numTurnsMeleeDiceRecieved = 0;
            var selectedTroops = parseInt(getTokenBarValue(selectedObj, 1));
            var targetTroops = parseInt(getTokenBarValue(targetObj, 1));

            var attackerObj;
            var victimObj;

            var isNoDifference = (selectedTroops === targetTroops);
            var isOneSidedAttack = (gNumKills2 === -1);
            if (isOneSidedAttack) {
                attackerObj = targetObj;
                victimObj = selectedObj;
            }
            else if (isNoDifference) {
                var side = randomInteger(2);
                if (side === 1) {
                    attackerObj = selectedObj;
                    victimObj = targetObj;
                }
                else {
                    attackerObj = targetObj;
                    victimObj = selectedObj;
                }
            }
            else if (selectedTroops > targetTroops) {
                if (gNumRolled1 > gNumRolled2) {
                    attackerObj = targetObj;
                    victimObj = selectedObj;
                }
                else {
                    attackerObj = selectedObj;
                    victimObj = targetObj;
                }
            }
            else {
                if (gNumRolled1 > gNumRolled2) {
                    attackerObj = selectedObj;
                    victimObj = targetObj;
                }
                else {
                    attackerObj = targetObj;
                    victimObj = selectedObj;
                }
            }

            // apply kills 1 to attacker side
            applyCasualties(attackerObj, gNumKills1);
            // Names don't matter here, all the same
            sendChat(msg.who, css.attack
                + "**"
                + selectedName
                + "** attacks "
                + selectedName
                + " and kills "
                + css.killValue + "**" + gNumKills1 + "**" + css.endValue
                + " troops." + css.spanEnd);
            survived = calculateTroopLoss(msg, attackerObj);
            if (survived) { heavyLossMoraleCheck(msg, attackerObj); }

            // apply kills 2 to victim side
            if (!isOneSidedAttack) {
                applyCasualties(victimObj, gNumKills2);
                // Names don't matter here, all the same
                sendChat(msg.who, css.attack
                    + "**"
                    + selectedName
                    + "** attacks "
                    + selectedName
                    + " and kills "
                    + css.killValue + "**" + gNumKills2 + "**" + css.endValue
                    + " troops." + css.spanEnd);
                survived = calculateTroopLoss(msg, victimObj);
                if (survived) { heavyLossMoraleCheck(msg, victimObj); }
            }

            // cleanup
            isSelectedDone = true;
            isSelectedDone = false;
            isTargetDone = false;
            isRearAttack = false;
            isAttackerImmune = false;
            isForceCheck = false;
            checkMorale(msg);

            gNumRolled1 = -1;
            gNumRolled2 = -1;
            gNumKills1 = -1;
            gNumKills2 = -1;
        }

    }

    else if (msg.type === "rollresult"
        && isMyMeleeRollResult(rollData, selectedObj)) {
        //log("melee dice rolled: selected");

        kills = (rollData.total)*1;
        applyCasualties(targetObj, kills);

        // announce casualties
        sendChat(msg.who, css.attack
            + "**"
            + selectedName
            + "** attacks "
            + targetName
            + " and kills "
            + css.killValue + "**" + kills + "**" + css.endValue
            + " troops." + css.spanEnd);

        survived = calculateTroopLoss(msg, targetObj);

        if (survived) { heavyLossMoraleCheck(msg, targetObj); }

        isSelectedDone = true;
        if (isTargetDone || isRearAttack || isAttackerImmune || isForceCheck) {
            isSelectedDone = false;
            isTargetDone = false;
            isRearAttack = false;
            isAttackerImmune = false;
            isForceCheck = false;
            checkMorale(msg);
        }
    }
    else if (msg.type === "rollresult"
        && isMyMeleeRollResult(rollData, targetObj)) {
        //log("melee dice rolled: target");

        kills = (rollData.total)*1;

        // add casualties to defender
        applyCasualties(selectedObj, kills);

        // announce casualties
        sendChat(msg.who, css.counterAttack
            + "**"
            + targetName
            + "** counterattacks "
            + selectedName + " and kills "
            + css.killValue + "**" + kills + "**" + css.endValue
            + " troops." + css.spanEnd);

        // check for dead unit before heavy loss
        survived = calculateTroopLoss(msg, selectedObj);
        if (survived) { heavyLossMoraleCheck(msg, selectedObj); }

        // apply casualties
        // resolve melee morale
        // end of melee
        isTargetDone = true;
        if (isSelectedDone || isRearAttack || isAttackerImmune || isForceCheck) {
            isSelectedDone = false;
            isTargetDone = false;
            isRearAttack = false;
            isAttackerImmune = false;
            isForceCheck = false;
            checkMorale(msg);
        }
    }
}

function checkMorale(msg) {
    //log("checkMorale");
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

    //log("Rolldata: " + JSON.stringify(rollData));
    //log("unitObj: " + JSON.stringify(unitObj));

    var unitName = getPropertyValue(unitObj, "name");
    var rollName = getRollResultText(rollData);

    var unitTroops = getTokenBarValue(unitObj, 1);
    var casualties = getTokenBarValue(unitObj, 3);
    var troopsBeforeLoss = unitTroops*1 + casualties*1;
    var rollDice = getRollResultDice(rollData);

    // Number of dice rolled does not correlate directly to the number of soldiers on a side.
    //var results = (unitName === rollName) && (troopsBeforeLoss*1 === rollDice*1);
    var results = (unitName === rollName);
    //log("isMyMeleeRollResult: " + unitName + " vs " + rollName + " AND " + troopsBeforeLoss*1 + " vs " + rollDice*1 + " = " + results);
    return results;
}

function getRollResultText(rollData) {
    var rollText = rollData.rolls[1].text.trim();
    return rollText;
}

function getRollResultDice(rollData) {
    var rollObj = rollData.rolls[0];
    var rollDice = rollObj.dice;
    //log("getRollResultDice, size: " + rollData.rolls.length + " dice value: " + rollDice + " data: " + rollData);
    return rollDice;
}


