#!/bin/bash

FILES="abilities.js "\
"clearCasualties.js "\
"leadershipMorale.js "\
"meleeMorale.js "\
"ArmyManager.js "\
"fantasyTable.js "\
"magicalWeapons.js "\
"chatListener.js "\
"gameBoard.js "\
"magic.js "\
"missile.js "\
"chatStyles.js "\
"heavyCasualtyMorale.js "\
"melee.js "\
"rangeFinder.js "\
"tools.js "

cat $FILES| uglifyjs -o chainmail.min.js
cat $FILES| uglifyjs -c -o chainmail.comp.js

