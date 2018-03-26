/**

 GENERAL
 {
    "content":"Hello",
    "playerid":"-L83YxWQ1hDgodZxseoz",
    "type":"general",
    "who":"Shadowglass (GM)"
 }

 API
 {
    "content":"!apiCall",
    "playerid":"-L83YxWQ1hDgodZxseoz",
    "type":"api",
    "who":"Shadowglass (GM)"
 }

 ROLL
 {
    "content":"{
        \"type\":\"V\",
        \"rolls\":[{
            \"type\":\"R\",
            \"dice\":1,
            \"sides\":6,
            \"mods\":{},
            \"results\":[{
                \"v\":5
            }]
        }],
        \"resultType\":\"sum\",
        \"total\":5}",
    "origRoll":"1d6",
    "playerid":"-L83YxWQ1hDgodZxseoz",
    "signature":"9737ed3b424e881db7cdcf7ff57e75ac43e03115eabd2805918e0dcd589ea5ac2c589ffa7edd03729c2190a3a98168eeafdac783f7e9ad823aa48e236e14d77e",
    "type":"rollresult",
    "who":"Shadowglass (GM)"
 }

 EMOTE
 {
    "content":"says hello",
    "playerid":"-L83YxWQ1hDgodZxseoz",
    "type":"emote",
    "who":"Shadowglass (GM)"
 }

 GMROLL
 {
    "content":"{
        \"type\":\"V\",
        \"rolls\":[{
            \"type\":\"R\",
            \"dice\":1,
            \"sides\":6,
            \"mods\":{},
            \"results\":[{
                \"v\":6
            }]
        }],
        \"resultType\":\"sum\",
        \"total\":6
    }",
    "origRoll":"1d6",
    "playerid":"-L83YxWQ1hDgodZxseoz",
    "signature":"10817c6d631544b66ff61be5051345e0dcba1f827b25475ded9c3ca86acb5433f95001196bb56fa38f512531481ba9f29704ff9fa5a419d91faa0b9615a1b4bb",
    "type":"gmrollresult",
    "who":"Shadowglass (GM)"
 }

 SPEAKAS
 {
    "content":"hello",
    "playerid":"-L83YxWQ1hDgodZxseoz",
    "type":"general",
    "who":"Red Larch Light Foot"
 }

 WHISPER
 {
    "content":"hello",
    "playerid":"-L83YxWQ1hDgodZxseoz",
    "target":"-L83YxWQ1hDgodZxseoz",
    "target_name":"Shadowglass",
    "type":"whisper",
    "who":"Red Larch Light Foot"
 }

 WHISPER GMhttps://app.roll20.net/campaigns/scripts/3140403
 {
    "content":"hello",
    "playerid":"-L83YxWQ1hDgodZxseoz",
    "target":"gm",
    "target_name":"GM",
    "type":"whisper",
    "who":"Red Larch Light Foot"
 }
 */

var capture = false;
on("chat:message", function(msg) {
    if(msg.type === "api" && msg.content.indexOf("!rolltest") !== -1) {
        capture = true;
        sendChat(msg.who, "/r 4d6>4");
        // Will send nothing to chat, but will process the output with the closure:
        /*
        }
        sendChat(msg.who, "/r 4d6>4", function(rollResult) {
            logRollResults(rollResult);
        });
        */
    }
    if(msg.type === "rollresult" && capture === true) {
        capture = false;
        log("Got rollresult");
        log(JSON.parse[msg.content]);
    }
});


function logRollResults(result) {
    log(result[0].content);
}
