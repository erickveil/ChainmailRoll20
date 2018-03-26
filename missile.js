on("chat:message", function(msg) {
    if(msg.type === "api" && msg.content.indexOf("!missile") !== -1) {

        var argStr = msg.content.replace("!missile ", "");
        var argList = argStr.split(",");

        if (argList.length !== 2) {
            log("ERROR: melee api command takes 1 selected archer argument and "
                + "1 target argument.");
        }
        else {
        }

        var selectedId = argList[0];
        var targetId = argList[1];
        var archerType = "graphic";
        var targetType = "character";

        try {
            // defined in melee.js
            var archerToken = getObjectWithReport(archerType, selectedId);
            var targetSheet = getObjectWithReport(targetType, targetId);
            var archerTroops = getTokenBarValue(archerToken, 1);
            var targetArmor = getAttributeWithError(targetId, "AC v Missile");

            // split number of troops vs AC 0 and 1
            var firingUnits = [];
            if (archerTroops <= 10) {
                firingUnits[0] = archerTroops;
            }
            else if (targetArmor === 2) {
                firingUnits[0] = archerTroops;
            }
            else if (archerTroops > 20) {
                sendChat(msg.who, "There are more than 20 troops in "
                    + "this unit. Split unit before firing missile attacks.");
            }
            else {
                firingUnits[0] = Math.floor(archerTroops / 2);
                firingUnits[1] = archerTroops - firingUnits[0];
            }
            var damage = 0;
            for (var i = 0; i < firingUnits.length; ++i) {
                var roll = randomInteger(6);
                sendChat(msg.who, "**Rolling 1d6: ``" + roll + "``");
                var unitDamage = 0;
                if (targetArmor === 0) {
                    if (firingUnits[i] <= 2) {
                        if (roll <= 2) { unitDamage = 0; }
                        else { unitDamage = 1; }
                    }
                    else if (firingUnits[i] <= 4) {
                        if (roll <= 2) { unitDamage = 1; }
                        else { unitDamage = 2; }
                    }
                    else if (firingUnits[i] <= 6) {
                        if (roll <= 2) { unitDamage = 2; }
                        else {
                            unitDamage = 3;
                        }
                    }
                    else if (firingUnits[i] <= 8) {
                        if (roll <= 2) { unitDamage = 3; }
                        else { unitDamage = 4; }
                    }
                    else {
                        if (roll <= 2) { unitDamage = 4; }
                        else { unitDamage = 5; }
                    }
                }
                else if (targetArmor === 1) {
                    if (firingUnits[i] <= 2) {
                        if (roll <= 3) { unitDamage = 0; }
                        else { unitDamage = 0; }
                    }
                    else if (firingUnits[i] <= 4) {
                        if (roll <= 3) { unitDamage = 0; }
                        else { unitDamage = 1; }
                    }
                    else if (firingUnits[i] <= 6) {
                        if (roll <= 3) { unitDamage = 2; }
                        else { unitDamage = 2; }
                    }
                    else if (firingUnits[i] <= 8) {
                        if (roll <= 3) { unitDamage = 2; }
                        else { unitDamage = 3; }
                    }
                    else {
                        if (roll <= 3) { unitDamage = 3; }
                        else { unitDamage = 3; }
                    }
                }
                else {
                    if (firingUnits[i] <= 3) {
                        if (roll <= 4) { unitDamage = 0; }
                        else { unitDamage = 0; }
                    }
                    else if (firingUnits[i] <= 4) {
                        if (roll <= 4) { unitDamage = 0; }
                        else { unitDamage = 1; }
                    }
                    else if (firingUnits[i] <= 12) {
                        if (roll <= 4) { unitDamage = 1; }
                        else { unitDamage = 2; }
                    }
                    else if (firingUnits[i] <= 16) {
                        if (roll <= 4) { unitDamage = 2; }
                        else { unitDamage = 3; }
                    }
                    else {
                        if (roll <= 4) { unitDamage = 3; }
                        else { unitDamage = 3; }
                    } // end armor 2 each unit
                } // end armor 2
                sendChat(msg.who, "Firing unit " + (i+1)
                    + " (" + firingUnits[i] + " troops)"
                    + " does " + unitDamage + " damage.");
                damage += unitDamage;
            } // end loop thru firing units
            sendChat(msg.who, "**Total missile damage: " + damage + "**");
        } // end try
        catch(err) {
            if (typeof err === "string") {
                log("String error caught: " + err);
            }
            else if (typeof err === "object" && typeof err.chatMsg !== "undefined") {
                log(err);
                sendChat(msg.who, err.chatMsg);
            }
            else {
                log("Unknown error type: " + err);
            }
        }
    }
});



