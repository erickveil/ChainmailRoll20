/**
 * abilities.js
 * Erick Veil
 * 2018-09-01
 * 
 * All abilities that need detection to affect combat
 */


 function isTokenHero(token) {
    var sheetId = getPropertyValue(token, "represents");
    return isSheetHero(sheetId);
 }

 function isSheetHero(sheetId) {
     return isCharacterHasAbility(sheetId, "Heroic");
 }

 function isHeroDefeated(maxHeroTroops, damageTaken) {
     return damageTaken >= maxHeroTroops;
 }

 function handleHeroSave(chatTarget, heroName) {
     sendChat(chatTarget, css.meleeResult + "The attack is not enough to defeat " 
      + heroName + "!" + css.spanEnd);
 }

 function handleHeroDefeat(chatTarget, heroToken) {
     var maxHeroTroops = getTokenBarMax(heroToken, 1);
     applyCasualties(heroToken, maxHeroTroops);
     calculateTroopLoss(chatTarget, heroToken);
 }



