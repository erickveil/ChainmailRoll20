/**
 * chatListener.js
 * Erick Veil
 * 2018-03-27
 *
 * Listens for API commands to execute and dice rolls to act on
 *
 */

/* ========== FLAGS ============
 * Global values for tracking if I should be listening to dice rolls.
 * Probably should be encapsulated in an object, but I seem to like
 * shooting myself in the foot later.
 */

/**
 * Set to true when listening for API triggered melee dice roll
 * Then immediately set false again so we don't capture any
 * other rolls.
 * @type {boolean}
 */
var isMeleeAttacking = false;

/**
 * Set to listen for counter attacks
 * @type {boolean}
 */
var isMeleeDefending = false;

/* ========== MAIN ============ */

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
    //if (msg.type === "rollresult" && isMeleeAttacking === true) {

    if (msg.type === "rollresult") {
        log("type: " + msg.type + ", dice: " + getRollResultDice(rollData)
            + ", name: " + getRollResultText(rollData) + ", is selected: "
        + isMyMeleeRollResult(rollData, selectedObj) + ", is target: "
        + isMyMeleeRollResult(rollData, targetObj));
    }

    // TODO: always false, I think selectedObj is not set or accessible.
    if (msg.type === "rollresult"
        && isMyMeleeRollResult(rollData, selectedObj)) {

        isMeleeAttacking = false;
        selectedName = getPropertyValue(selectedObj, "name");
        targetName = getPropertyValue(targetObj, "name");
        log(rollData);
        kills = (rollData.total)*1;

        // set casualties to defender
        targetObj.set(casualtiesBarValue, kills);

        // announce casualties
        sendChat(msg.who, selectedName + " attacks " + targetName + " and kills "
            + kills + " troops.");

        heavyLossMoraleCheck(msg, targetObj);
    }
    //else if (msg.type === "rollresult" && isMeleeDefending === true) {
    else if (msg.type === "rollresult"
        && isMyMeleeRollResult(rollData, targetObj)) {

        isMeleeDefending = false;
        selectedName = getPropertyValue(selectedObj, "name");
        targetName = getPropertyValue(targetObj, "name");
        kills = (rollData.total)*1;

        // add casualties to defender
        selectedObj.set(casualtiesBarValue, kills);

        // announce casualties
        sendChat(msg.who, targetName + " counterattacks " + selectedName + " and kills "
            + kills + " troops.");

        // check for dead unit before heavy loss
        heavyLossMoraleCheck(msg, selectedObj);

        // apply casualties
        // resolve melee morale
        // end of melee
        sendChat(msg.who, "Done");
    }
}

function isMyMeleeRollResult(rollData, unitObj) {

    var unitName = getPropertyValue(unitObj, "name");
    var unitTroops = getTokenBarValue(unitObj, 1);
    var rollName = getRollResultText(rollData);
    var rollDice = getRollResultDice(rollData);
    log("unitName: [" + unitName + "], rollName: [" + rollName
    + "], unitTroops: [" + unitTroops*1 + "], rollDice: ["
    + rollDice*1 + "]");
    return (unitName === rollName) && (unitTroops*1 === rollDice*1);
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


