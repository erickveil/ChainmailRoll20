/**
 * magicalWeapons.js
 * Erick Veil
 * 2018-05-15
 */

function isHasMagicSword(sheetId) {
    var attrName = "Magic Sword";
    if (!isHasAttribute(sheetId, attrName)) {
        return false;
    }
    var swordBonus = getAttributeWithError(sheetId, attrName);
    return !(swordBonus === 0 || swordBonus === "");
}

function getMagicSwordBonus(sheetId) {
    var attrName = "Magic Sword";
    if (!isHasAttribute(sheetId, attrName)) {
        return 0;
    }
    return getAttributeWithError(sheetId, attrName);
}


