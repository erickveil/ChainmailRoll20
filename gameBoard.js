/**
 * Gets a list of all token objects in play that are terrain items.
 *
 * @returns {Array}
 */
function getTerrainObjList() {
    var tokenList = findObjs({type: "graphic", subtype: "token"});
    var resultList = [];
    for (var i = 0; i < tokenList.length; ++i) {
        var token = tokenList[i];
        var sheetId = getTokenSheetId(token);
        var hasAttribute = isHasAttribute(sheetId, "terrain");
        if (hasAttribute) {
            var terrainSetting = parseInt(getAttributeWithError(sheetId, "terrain"));
            if (terrainSetting === 1) { resultList.push(token); }
        }
    }
    return resultList;
}

function moveTerrainToMapLayer()
{
    var terrainList = getTerrainObjList();
    for (var i = 0; i < terrainList.length; ++i) {
        var terrainObj = terrainList[i];
        terrainObj.set("layer", "map");
    }
}

function moveTerrainToObjectLayer()
{
    var terrainList = getTerrainObjList();
    for (var i = 0; i < terrainList.length; ++i) {
        var terrainObj = terrainList[i];
        terrainObj.set("layer", "objects");
    }
}



