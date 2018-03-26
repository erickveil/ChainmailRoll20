on("chat:message", function(msg) {
    if(msg.type === "api" && msg.content.indexOf("!clearCasualties") !== -1) {
        try {
            clearAllCasualties();
        }
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

/**
 * Sets all bar 3 to zero to reset casualties at the beginning of a round.
 */
function clearAllCasualties() {
    var allGraphicsList = findObjs({type: "graphic"});
    for (var i = 0; i < allGraphicsList.length; ++i) {
        // validate that the graphic is a unit?
        // So far, there is no other use for bar3.
        var graphicObj = allGraphicsList[i];
        graphicObj.set("bar3_value", 0);
    }


}



