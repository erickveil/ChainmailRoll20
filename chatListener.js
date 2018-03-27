/**
 * chatListener.js
 * Erick Veil
 * 2018-03-27
 *
 * Listens for API commands to execute and dice rolls to act on
 *
 * For reference, here's what a roll looks like:
 *  {
 *      "type":"V",
 *      "rolls":[{
 *          "type":"R",
 *          "dice":20,
 *          "sides":6,
 *          "mods":{
 *              "success":{
 *                  "comp":">=",
 *                  "point":6
 *              }
 *          },
 *          "results":[
 *              {"v":2},
 *              {"v":2},
 *              {"v":1},
 *              ... and so on and so forth ...
 *              {"v":2},
 *              {"v":6},
 *              {"v":6}
 *          ]
 *      }],
 *      "resultType":"success",
 *      "total":2
 *  }
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
        eventMassiveCasualtyRoll(msg);
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
    var rollData;
    var kills;
    var priorCasualties;
    var totalCasualties;
    var barnum = 3;
    var casualtiesBarValue = "bar"+ barnum + "_value";
    var selectedName;
    var targetName;

    if (msg.type === "rollresult" && isMeleeAttacking === true) {
        isMeleeAttacking = false;
        selectedName = getPropertyValue(_selectedObj, "name");
        targetName = getPropertyValue(_targetObj, "name");
        rollData = JSON.parse(msg.content);
        kills = (rollData.total)*1;

        // set casualties to defender
        _targetObj.set(casualtiesBarValue, kills);

        // announce casualties
        sendChat(msg.who, selectedName + " attacks " + targetName + " and kills "
            + kills + " troops.");
    }
    else if (msg.type === "rollresult" && isMeleeDefending === true) {
        isMeleeDefending = false;
        selectedName = getPropertyValue(_selectedObj, "name");
        targetName = getPropertyValue(_targetObj, "name");
        rollData = JSON.parse(msg.content);
        kills = (rollData.total)*1;

        // add casualties to defender
        _selectedObj.set(casualtiesBarValue, kills);

        // announce casualties
        sendChat(msg.who, targetName + " counterattacks " + selectedName + " and kills "
            + kills + " troops.");

        // check for dead unit before heavy loss

        // apply casualties
        // resolve melee morale
        // end of melee
        sendChat(msg.who, "Done");
    }


}


