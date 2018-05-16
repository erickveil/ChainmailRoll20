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

function isHasMagicMissile(sheetId) {
    var attrName = "Magic Missiles";
    if (!isHasAttribute(sheetId, attrName)) {
        return false;
    }
    var missleQty = getAttributeWithError(sheetId, attrName);
    return !(missileQty <= 0 || missileQty === "");
}

function isHasMagicArmor(sheetId) {
    var attrName = "Magic Armor";
    if (!isHasAttribute(sheetId, attrName)) {
        return false;
    }
    var armor = getAttributeWithError(sheetId, attrName);
    return !(armor === 0 || armor === "");
}

function getMagicSwordBonus(sheetId) {
    var attrName = "Magic Sword";
    if (!isHasAttribute(sheetId, attrName)) {
        return 0;
    }
    return getAttributeWithError(sheetId, attrName);
}

function getMagicSwordName(sheetId) {
    var attrName = "Magic Sword Name";
    if (!isHasAttribute(sheetId, attrName)) {
        return "Sword +" + getMagicSwordBonus(sheetId);
    }
    var swordName = getAttributeWithError(sheetId, attrName);
    if (swordName === "") {
        return "Sword +" + getMagicSwordBonus(sheetId);
    }
    return swordName;
}


