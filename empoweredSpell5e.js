// Empowered Spell for 5e sheet

const empoweredSpell5e = (() => { // eslint-disable-line no-unused-vars
    const version = '0.4.0';
    const lastUpdate = 1605873534647;
    const schemaVersion = 0.4;
    const checkInstall = () =>  {
        log('==( empoweredSpell5e v'+version+' )== ['+(new Date(lastUpdate))+']');// eslint-disable-next-line no-prototype-builtins
        if (! state.hasOwnProperty('empoweredSpell5e') || state.empoweredSpell5e.version !== schemaVersion) {
            log(`   >>> >>> empowerBot updating Schema to v${schemaVersion} <`);
            switch (state.empoweredSpell5e.version) {
                case '':
                     // falls through
                case 0.1:
                    state.empoweredSpell5e = {
                        version: schemaVersion,
                        lastPlayer: '',
                        lastWho: '',
                        lastMsg: '',
                        lastSpellname: '',
                        lastRoll: '',
                    } // falls through
                case 0.2:
                    state.empoweredSpell5e.playerList = {};
                    state.empoweredSpell5e.characterList = {};
                    state.empoweredSpell5e.version = schemaVersion;
                    log(`empoweredSpell5e 0.3 update: changed character & player list structure, lists reset!`); //falls through
                case 0.3:
                    Object.assign(state.empoweredSpell5e, {
                        empowerMode: 'full',
                        strictMode: 'normal',
                        version: schemaVersion,
                    });
                break;
            }
        }
        if (state.empoweredSpell5e.playerList) {settings.playerList = state.empoweredSpell5e.playerList}
        if (state.empoweredSpell5e.characterList) {settings.characterList = state.empoweredSpell5e.characterList}
        if (state.empoweredSpell5e.lastPlayer) {lastPlayer = state.empoweredSpell5e.lastPlayer}
        if (state.empoweredSpell5e.lastWho) {lastWho = state.empoweredSpell5e.lastWho}
        if (state.empoweredSpell5e.lastMsg) {lastMsg = state.empoweredSpell5e.lastMsg}
        if (state.empoweredSpell5e.lastSpellname) {lastSpellname = state.empoweredSpell5e.lastSpellname}
        if (state.empoweredSpell5e.lastRoll) {r = state.empoweredSpell5e.lastRoll}
        if (state.empoweredSpell5e.empowerMode) {settings.empowerMode = state.empoweredSpell5e.empowerMode}
        if (state.empoweredSpell5e.strictMode) {settings.strictMode = state.empoweredSpell5e.strictMode}
    };

    const settings = {
        playerList: {},
        characterList: {},
        esWho: 'empower5e bot',
        empowerMode: 'full',
        strictMode: 'normal',
        scriptName: 'empowered spell 5e',
    }

    let style = {
        empower: `background: #89bcbd; padding-top:10px; padding-bottom: 10px; width:100%; margin-left:-20px; border:2px solid #015959; border-radius: 10px; border-collapse: separate; `,
        empowerTd: `padding:5px; text-align:center; `,
        empowerTh: `font-size:14px; background:#86dedf; border-top:1px solid #015959; border-bottom: 1px solid #015959; padding:5px; text-align:center; `,
        empowerAHref: `background-color:#fff; border:solid 1px black!important; border-radius: 5px; width: 50%; color:black; display:inline-block; text-align:center; `,
    }
    Object.assign(style, {
        empowerDelete: `${style.empowerAHref}height: 18px; color:red; font-weight:bold; font-size:18px; width:20px; `,
        empowerAdd: `${style.empowerAHref}height: 18px; color:#028001; font-weight:bold; font-size:24px; width: 20px; `,
        empowerCast: `${style.empower}text-align:center; background-color:#956502; `,
        empowerCastAHref: `${style.empowerAHref}width: 85%; `,
        empowerSelect: `${style.empower}background: #9f7b28; color: #040404; `,
        empowerSelectAHref: `${style.empowerAHref}border-radius: 3px; color: #000b9b; padding:4px; font-size:15px; `,
        empowerSelectTdAHref: `${style.empowerAHref}width:75%; overflow-wrap: normal; font-weight:bold; border-radius: 3px; color: #000b9b; padding:3px; font-size:13px; `,
        empowerSelectTd: `${style.empowerTd}padding:2px; font-size:12px; `,
        empowerSelectTh: `${style.empowerTh}font-size:14px; background:#e1a220; border-top:1px solid #956502; border-bottom: 1px solid #956502; padding:2px; `,
        empowerError: `${style.empower}color:#fb0000; background-color:white; padding:5px; font-weight:bold; `,
        empowerErrorTd: `${style.empowerTd}`,
        empowerErrorTh: `${style.empowerTh}`,
        empowerErrorAHref: `${style.empowerAHref}`,
        empowerReroll: `${style.empower}background:#9f7b28; font-weight:bold; `,
        empowerRerollTh: `${style.empowerTh}font-size:14px; background:#e1a220; border-top:1px solid #9f7b28; border-bottom: 1px solid #9f7b28; `,
        empowerRerollTd: `${style.empowerTd}background-color: #fff; border: 1px solid; border-color: #956502; `,
        empowerHelp: `${style.empower}width:110%; margin-left:-30px; `,
        empowerHelpTd: `${style.empowerTd}font-size:12px; border-bottom: 1px solid; text-align: left;`,
        empowerHelpTh: `${style.empowerTh}`,
        empowerHelpAHref: `${style.empowerAHref}`,
    })


    let r = {
        mainIndex1: 0, mainIndex2: 0,
        expression1: '', expression2: '',
        dieType1: 0, dieType2: 0,
        damageFields1: [], damageFields2: [],
        damageDice1: [], damageDice2: [], damageDiceAll: [],
        damage1Total: 0, damage2Total: 0, damageGrandTotal: 0,
    }

    const regex = {     // for 5e by Roll20 sheet
        spellSearch: /spelllevel=(\d|cantrip)/i,
        spellName: /rname=([^}]*)/i,
        damage1: /dmg1=\$\[\[(\d*)\]\]/i,
        damage2: /dmg2=\$\[\[(\d*)\]\]/i,
        crit1: /crit1=\$\[\[(\d*)\]\]/i,
        crit2: /crit2=\$\[\[(\d*)\]\]/i,
        higherLevel: /hldmg=\$\[\[(\d*)\]\]/i,
        higherLevelCrit: /hldmgcrit=\$\[\[(\d*)\]\]/i,
    }

    let lastMsg, lastPlayer, lastSpellname, lastWho, lastCharname, lastCharacterId, lastPlayerId;
    let sorceryPoints, sorceryPointsValue, sorceryPointsName;

    const empowerSelect = () => {      // generate dialog for player to select dice to reroll
        let lastRoll = lastMsg.inlinerolls, lastContent = lastMsg.content;
        let maxRerolls;
        let splitRoll = 0;
        if (lastCharname && isIdOrName(lastCharname, 'character')) {   // grab character for charisma_mod
            lastCharacterId = isIdOrName(lastCharname, 'character');
            maxRerolls = Math.max(parseInt(getAttrByName(lastCharacterId,'charisma_mod'),10),1) || 5;        
        } else if (Object.keys(settings.characterList).find(c => c.search(lastWho))) {
            lastCharacterId = settings.characterList[lastWho].id;
            lastCharname = lastWho;
            maxRerolls = Math.max(parseInt(getAttrByName(lastCharacterId,'charisma_mod'),10),1) || 5;
        } else if (Object.keys(settings.playerList).some(p => p === lastPlayer)) {
            lastCharacterId = settings.playerList[lastPlayer].defaultChar;
            lastCharname = getObj('character', lastCharacterId).get('name');
            maxRerolls = Math.max(parseInt(getAttrByName(lastCharacterId,'charisma_mod'),10),1) || 5;
        } else {
            sendAlert('Error', null, `Error: empowerSelect should not have been triggered by id: ${lastMsg.playerid} or name: ${lastWho}`);
            return;
        }

        if (settings.strictMode.search(/off/i) === -1) {
            if (Object.keys(settings.characterList).some(c => c.match(lastCharname)) !== -1) { // check State object for saved SP location. if not found, run function to find them
                if (settings.characterList[lastCharname].sorcery.name && getObj('attribute', settings.characterList[lastCharname].sorcery.name).get('current').search(/sorcery\s*points/i) !== -1) {
                    sorceryPointsName = settings.characterList[lastCharname].sorcery.name;
                    sorceryPointsValue = settings.characterList[lastCharname].sorcery.value;
                } else {
                    settings.characterList[lastCharname].sorcery = getSorceryPoints(lastCharacterId);
                }
            }
            sorceryPoints = (sorceryPointsValue) ? parseInt(getObj('attribute', sorceryPointsValue).get('current'),10) : null;
            if ((sorceryPoints === 0 || sorceryPoints < 0) || (!sorceryPoints && settings.strictMode.search(/strict/i) !== -1)) {
                sendAlert('Error', null, `${lastCharname} has no sorcery points left!</td></tr></table>`);
                return;
            }
        }

        r.mainIndex1 = lastContent.match(regex.damage1)[1], r.mainIndex2;
        r.expression1 = lastRoll[r.mainIndex1].expression, r.expression2;
        r.dieType1 = lastRoll[r.mainIndex1].results.rolls[0].sides, r.dieType2;
        r.damageFields1 = [regex.damage1, regex.crit1, regex.higherLevel, regex.higherLevelCrit], r.damageFields2 = [regex.damage2, regex.crit2, regex.higherLevel, regex.higherLevelCrit];
        r.damageDice1 = [], r.damageDice2 = [], r.damageDiceAll = [];
        r.damage1Total = 0, r.damage2Total = 0, r.damageGrandTotal = 0;

        r.damageFields1.forEach(regex => { // grab all spell dice that match the main throw from dmg1, crit1, hldmg, hldmgcrit, push to array
            if (lastContent.match(regex)) {
                let i = lastContent.match(regex)[1];
                if (lastRoll[i].results.total > 0) {
                    r.damageGrandTotal += lastRoll[i].results.total;
                    lastRoll[i].results.rolls.forEach(roll => {
                        if (roll.sides === r.dieType1 && roll.dice > 0) {
                            roll.results.forEach(v => {
                                r.damageDice1.push(v.v);
                                r.damage1Total += v.v;
                            })
                        }
                    })

                }
                
            }
        })

        if (lastContent.search(regex.damage2) !== -1 && lastRoll[lastContent.match(regex.damage2)[1]].results.total > 0) { // check for second damage field
            r.mainIndex2 = lastContent.match(regex.damage2)[1];
            r.dieType2 = lastRoll[r.mainIndex2].results.rolls[0].sides;
            r.expression2 = lastRoll[r.mainIndex2].expression;
            r.damageFields2.forEach(regex => {
                if (lastContent.match(regex)) {
                    let i = lastContent.match(regex)[1];
                    if (lastRoll[i].results.total > 0) {
                        r.damageGrandTotal += lastRoll[i].results.total;
                        lastRoll[i].results.rolls.forEach(roll => {
                            if (roll.sides === r.dieType2 && roll.dice > 0) {
                                roll.results.forEach(v => {
                                    r.damageDice2.push(v.v);
                                    r.damage2Total += v.v;
                                })
                            }
                        })
                    }
                }
            })
            if (r.dieType1 === r.dieType2) { // if dmg2 is the same die size as dmg1, concat all damage rolls
                r.damageDice1.concat(r.damageDice2);
            } else { // or else we do a split roll with 2 arrays of die types
                r.damageDice1.forEach(d => {
                    r.damageDiceAll.push(`${d}-d${r.dieType1}`);
                });
                r.damageDice2.forEach(d => {
                    r.damageDiceAll.push(`${d}-d${r.dieType2}`);
                }); // next line sorts both die types into lowest to highest according to percentage of max possible roll for die size
                r.damageDiceAll.sort((a, b) => {return a.match(/^\d*/)[0]/a.match(/d(\d*)/)[1] - b.match(/^\d*/)[0]/b.match(/d(\d*)/)[1]});
                splitRoll = 1;
            }
        }
        r.damageDice1.sort((a, b) => {return a - b});
        updateState('roll');

        let headerS = `<table class="empower empowerSelect" style="${style.empowerSelect}"><tr><th colspan="${maxRerolls}" style="${style.empowerSelectTh}">Reroll how many dice? (max ${maxRerolls})</th></tr><tr>`;
        let headerQ = `<table class="empower empowerSelect" style="${style.empowerSelect}"><tr><th style="${style.empowerSelectTh}" colspan=${maxRerolls}>Lowest ${maxRerolls} rolls for ${lastSpellname}:</th></tr><tr>`;
        let bodySTop = [];
        let bodySBot = [];
        let bodyS = [];
        let bodyQ = []; // 'Q' sections are for the 'quick' layout option
        let footerS = (splitRoll === 0) ? `</tr><tr><th colspan="${maxRerolls}" style="${style.empowerSelectTh}">[Manual Reroll](!empower --empowerReroll &#63;{Reroll which dice (space separated values e.g. 1 1 1 3&rpar;}" style="${style.empowerSelectAHref})</th></tr></table>` : `</tr><tr><th colspan="${maxRerolls}" style="${style.empowerSelectTh}">[Manual Split Damage Reroll](!empower --empowerReroll &#63;{Reroll which dice values (space separated values use hyphen to denote which die type, e.g. 1-d6 1-d10  2-d6 4-d10&rpar;}" style="${style.empowerSelectAHref})</th></tr></table>`
        let footerQ = `</tr></table>`
        if (splitRoll === 0) {
            for (let i = 0; i < maxRerolls && i < r.damageDice1.length; i++) {
                if (i > 0 && i%5 === 0) { // loop through maximum of 5 dice before starting new rows for top (index) and bottom (rolls) main body rows
                    bodySTop.push(`</tr><tr>`);
                    bodySBot.push(`</tr><tr>`);
                    bodyS.push(bodySTop.join(''), bodySBot.join(''));
                    bodyQ.push(bodySBot.join(''));
                    bodySTop = [], bodySBot = [];
                }
                bodySTop.push(`<td style="${style.empowerSelectTd}">${i+1}</td>`)
                bodySBot.push(`<td style="${style.empowerSelectTd}">[${r.damageDice1[i]}](!empower --empowerReroll ${r.damageDice1.slice(0,i+1).join(' ')}" style="${style.empowerSelectTdAHref})</td>`)
            }
            bodyS.push(bodySTop.join(''), `</tr><tr>`, bodySBot.join(''));
            bodyQ.push(bodySBot.join(''));
        } else {
            bodyS.push(`<td colspan="5" style="${style.empowerSelectTd}">Dice are sorted according to percentage of maximum roll, e.g. 3 (d20) is "lower" than 2 (d4)</td></tr><tr>`)
            for (let i = 0; i < maxRerolls && i < r.damageDiceAll.length; i++) {
                if (i > 0 && i%5 === 0) { 
                    bodySTop.push(`</tr><tr>`);
                    bodySBot.push(`</tr><tr>`);
                    bodyS.push(bodySTop.join(''), bodySBot.join(''));
                    bodyQ.push(bodySBot.join(''));
                    bodySTop = [], bodySBot = [];
                }
                bodySTop.push(`<td style="${style.empowerSelectTd}">${i+1}</td>`);
                bodySBot.push(`<td style="${style.empowerSelectTd}">[${r.damageDiceAll[i]}](!empower --empowerReroll ${r.damageDiceAll.slice(0,i+1).join(' ')}" style="${style.empowerSelectTdAHref})</td>`)
            }
            bodyS.push(bodySTop.join(''), `</tr><tr>`, bodySBot.join(''));
            bodyQ.push(bodySBot.join(''));
        }
        if (settings.empowerMode.search(/quick/i) !== -1) { // terse table layout for 'quick' feedback mode
            sendChat(lastPlayer, `/w ${lastPlayer} ${headerQ}${bodyQ.join('')}${footerQ}`)
        } else {sendChat(lastPlayer,`/w ${lastPlayer} ${headerS}${bodyS.join('')}${footerS}`)}
    }

    const empowerReroll = (dice) => { // reroll the dice selected in empowerSelect & output new rolls & total
        if (!dice || dice.length < 1) {
            sendAlert('Error', null, `Empty empower roll received!`)
            return;
        }
        let oldDiceArray = dice.replace(/[^\d\sd-]/g,'').split(/\s+/g);
        let reroll1, reroll2;
        let oldTotal1, oldTotal2;
        let splitRoll1 = [], splitRoll2 = [];
        if (oldDiceArray[0].search(/d/i) !== -1) { //look for split roll, dmg1 and dmg2 are different die type
            const splitType1 = new RegExp (`(\\d*)-d${r.dieType1}`);  //process different die sizes
            const splitType2 = new RegExp (`(\\d*)-d${r.dieType2}`);
            oldDiceArray.forEach(d => {
                if (d.search(splitType1) !== -1) {
                    splitRoll1.push(parseInt(d.match(splitType1)[1]));
                } else if (d.search(splitType2) !== -1) {
                    splitRoll2.push(parseInt(d.match(splitType2)[1]));
                } else {sendAlert('Error', null, `${lastPlayer} bad die input: ${d}`)}
            })
            reroll1 = `${splitRoll1.length}d${r.dieType1}`;
            reroll2 = `${splitRoll2.length}d${r.dieType2}`;
            oldTotal1 = (splitRoll1.length > 0) ? splitRoll1.reduce((a,b) => {return parseInt(a) + parseInt(b)}) : 0;
            oldTotal2 = (splitRoll2.length > 0) ? splitRoll2.reduce((a,b) => {return parseInt(a) + parseInt(b)}) : 0;
        } else {  // if all damage dice are the same dietype
            reroll1 = `${oldDiceArray.length}d${r.dieType1}`; 
            oldTotal1 = oldDiceArray.reduce((a,b) => {return parseInt(a) + parseInt(b)})
            splitRoll1 = oldDiceArray.join(',');
        }
        let splitCols = (splitRoll2.length > 0) ? 3 : 2;    // create reroll output
        let headerRDmg2 = '', bodyROldRoll = '', bodyRReroll = '';
        let footerName = (lastCharname) ? lastCharname : lastWho;
        let rollMath = `[[${r.damageGrandTotal}[OldTotal] - ${oldTotal1}[Old] + [[${reroll1}]][New]]]`, rollMath2 = ``;
        let newTotal = `colspan="${splitCols - 1}">$[[1]]`, oldTotal = `colspan="${splitCols - 1}">${r.damageGrandTotal}`;
        if (sorceryPointsValue) {sorceryPoints = parseInt(getObj('attribute', sorceryPointsValue).get('current'),10)} // update sorcery points

        if (splitCols === 3 ) {
            headerRDmg2 = `<th style="${style.empowerRerollTh}">Dmg 2 (d${r.dieType2})</th>`, bodyROldRoll = `<td style="${style.empowerRerollTd}">${splitRoll2}</td>`, bodyRReroll = `<td style="${style.empowerRerollTd}">$[[2]] (${reroll2})</td>`;
            rollMath = `[[${r.damage1Total}-${oldTotal1}+[[${reroll1}]]]]`, rollMath2 = `[[${r.damage2Total}-${oldTotal2}+[[${reroll2}]]]]`;
            newTotal = `>$[[1]]</th><th style="${style.empowerRerollTh}">$[[3]]`, oldTotal = `>${r.damage1Total}</td><td style="${style.empowerRerollTd}">${r.damage2Total}`;
            
        }
        let headerR = `<table class="empower empowerReroll" style="${style.empowerReroll}"><tr><td colspan="${splitCols}" style="${style.empowerRerollTh} font-size:15px;">Empowered ${lastSpellname}</td></tr><tr><th style="width:20%; ${style.empowerRerollTh}"></th><th style="${style.empowerRerollTh}">Dmg 1 (d${r.dieType1})</th>${headerRDmg2}</tr>`;
        let bodyR = `<tr><td style="display:none">${rollMath}</td><td style="display:none">${rollMath2}</td></tr><tr><td style="${style.empowerRerollTd}">Old Total:</td><td style="${style.empowerRerollTd}" ${oldTotal}</td></tr><tr><td style="${style.empowerRerollTd}">Discard:</td><td style="${style.empowerRerollTd}">${splitRoll1}</td>${bodyROldRoll}</tr><tr><td style="${style.empowerRerollTd}">Rerolls:</td><td style="${style.empowerRerollTd}">$[[0]] (${reroll1})</td>${bodyRReroll}</tr><tr><th style="${style.empowerRerollTh}">New Total:</th><th style="${style.empowerRerollTh}" ${newTotal}</th></tr>`;
        let footerR;
        if (settings.strictMode.search(/off/i) !== -1) {
            footerR = `<tr><td colspan="${splitCols}" style="${style.empowerRerollTd}">Sorcery Point tracking is turned off.</td></tr></table>`
        } else if (!sorceryPointsValue) {  // check sorcery points exist, decrement if so
            footerR = `<tr><td colspan="${splitCols}" style="${style.empowerRerollTd}">${footerName} spent 1 Sorcery Point (no sheet/attribute found, point not deducted)</td></tr></table>`
        } else if ((sorceryPoints < 0 || sorceryPoints === 0) || (!sorceryPoints && settings.strictMode.search(/strict/i) !== -1)) {
            sendAlert('Error', null, `${footerName} has no sorcery points left!`);
            return;
        } else {
            sorceryPoints = sorceryPoints - 1
            footerR = `<tr><td colspan="${splitCols}" style="${style.empowerRerollTd}">${footerName} spent 1 Sorcery Point (${sorceryPoints} SP remaining)</td></tr></table>`;
            getObj('attribute', sorceryPointsValue).set('current', sorceryPoints);
        }

        sendChat(lastWho, `${headerR}${bodyR}${footerR}`);
    }

    const getList = (playerGet, characterGet) => { // list currently registered players & characters
        let playerList, characterList;
        let headerP = `<table class="empower" style="${style.empower}"><tr><th colspan="3" style="${style.empowerTh}">Empowered Spell Registered Players</th></tr><br><tr><th style="${style.empowerTh}">Player</th><th style="${style.empowerTh}">Default Char</th><th style="width:10%; ${style.empowerTh}">DEL</th></tr>`;
        let bodyP = []
        let footerP = `<br><tr><th colspan="3" style="${style.empowerTh}">[Add Player](!empower --addplayer &#63;{Enter player name or id to add}, &#63;{Enter character name to link, optional}" style="${style.empowerAHref})</table>`;
        let headerC = `<table class="empower" style="${style.empower}"><tr><th colspan="3" style="${style.empowerTh}">Empowered Spell Registered Characters</th></tr><br><tr><th colspan="2" style="${style.empowerTh}">Character</th><th style="width:10%; ${style.empowerTh}">DEL</th></tr>`; // change the class names here once the style object is done
        let bodyC = []
        let footerC = `<br><tr><th colspan="3" style="${style.empowerTh}">[Add Character](!empower --addchar &#63;{Enter character name or id to add}" style="${style.empowerAHref})</table>`;

        if (Object.keys(settings.playerList).length < 1) { // assemble player list body
            bodyP.push(`<br><tr><td colspan="3" style="${style.empowerTd}">Player list is empty</td></tr>`);
        } else {
            for (let p in settings.playerList) {
                if (getObj('player', p)) {
                    bodyP.push(`<br><tr><td style="${style.empowerTd}">${getObj('player',p).get('_displayname')}</td>`);
                    if (getObj('character',settings.playerList[p].defaultChar)) {
                        bodyP.push(`<td style="${style.empowerTd}">${getObj('character',settings.playerList[p].defaultChar).get('name')}</td><td class="empowerDelete" style="${style.empowerTd}">[X](!empower --delplayer ${p}" style="${style.empowerDelete})</td></tr>`);
                    } else {
                        bodyP.push(`<td class="empowerAdd" style="${style.empowerTd}">[+](!empower --linkchar ${p}, &#63;{Enter character name to link}" style="${style.empowerAdd})</td><td class="empowerDelete" style="${style.empowerTd}">[X](!empower --delplayer ${p}" style="${style.empowerDelete})</td></tr>`)
                    }
                } else { bodyP.push(`<br><tr><td colspan="2" style="${style.empowerTd}">${p}: bad player id or link</td><td class="empowerDelete">[X](!empower --delplayer ${p}" style="${style.empowerDelete})</td></tr>`);
                }
            }
        }
        
        if (Object.keys(settings.characterList).length < 1) { // assemble character list body
            bodyC.push(`<br><tr><td colspan="3" style="${style.empowerTd}">Character list is empty</td></tr>`);
        } else {
            for (let char in settings.characterList) {
                if (getObj('character', settings.characterList[char].id)) {
                    bodyC.push(`<br><tr><td colspan="2" style="${style.empowerTd}">${settings.characterList[char].name}</td><td class="empowerDelete" style="${style.empowerTd}">[X](!empower --delchar ${char}" style="${style.empowerDelete})</td></tr>`);
                } else { bodyC.push(`<br><tr><td colspan="2" style="${style.empowerTd}">${char}: bad player id or link</td><td class="empowerDelete" style="${style.empowerTd}">[X](!empower --delchar ${char}&#44;character" style="${style.empowerDelete})</td></tr>`);}
            }
        }
        playerList = (playerGet !== false) ? `${headerP}${bodyP.join('')}${footerP}` : '';
        characterList = (characterGet !== false) ? `${headerC}${bodyC.join('')}${footerC}` : '';
        return `${playerList}${characterList}`;
    }

    const handleInput = (msg) => {
        if (msg.type === 'api' && msg.content.search(/^!empower\b/i) !== -1) {
            let commands = msg.content.slice(msg.content.indexOf(' ')).trim().split(/--/g);
            commands.shift();
            commands.forEach(command => {
                let cmd = command.split(/\s/,1).toString().toLowerCase(); 
                let args = command.slice(command.indexOf(' ')+1).trim(); 
                let chars = 0, player = 0, controlledChars = [], controlledCharsList = [], ids = [], arr = [], charId = [];
                lastPlayer = getObj('player', msg.playerid).get('displayname'), lastWho = msg.who;
                switch(cmd) {
                    case 'addchar':
                    case 'addchars':
                        chars = args.split(/\s*,\s*/g)
                            chars.forEach(char =>{
                                charId = isIdOrName(char, 'character');
                                registerId('character', charId);
                            })
                        break;
                    case 'addme':
                        player = msg.playerid;
                        if (playerIsGM(player)) {
                            sendAlert('Error', null, `Adding GM as a player is NOT recommended`,`Click here`,`!empower --fknaddme ${player}`,`if you really mean it!`);
                            break;
                        } // eslint-disable-next-line no-undef, underscore/prefer-invoke
                        controlledChars = _.map(findObjs({_type: 'character', controlledby: player}),c => c.get('_id')); 
                        controlledCharsList = []
                            if (controlledChars.length === 0) {
                                registerId('player', null, player);
                            } else {
                                controlledChars.forEach(char => {
                                    if (getObj('character', char)) {
                                        controlledCharsList.push(`<br><tr><td style="${style.empowerTd}">[${getObj('character', char).get('name')}](!empower --fknaddme ${player}, ${char}" style="${style.empowerAHref})</td></tr>`)
                                    }
                                })
                                sendAlert(null, null, `Select your default character:</th></tr>${controlledCharsList}</table>`);
                            }
                        break;
                    case 'addplay':
                    case 'addplayer': //--addplayer name, defchar      (comma separated)
                        arr = args.split(/,/,2);
                        player = isIdOrName(arr[0], 'player');
                        //log(player);
                        charId = isIdOrName(arr[1], 'character');
                        //log(charId);
                        if (playerIsGM(player)) {
                            sendAlert('Error', null, `Adding GM as a player is NOT recommended in a live game.`,`Click here`,`!empower --fknaddme ${player}, ${charId}`,`if you really mean it!`);
                            return;
                        } else {
                            registerId('player', charId, player);
                        }
                        break;
                    case 'delchar':
                    case 'delchars':
                        chars = args.split(/\s*,\s*/g)
                            chars.forEach(char =>{
                                charId = isIdOrName(char, 'character');
                                delete settings.characterList[getObj('character', charId).get('name')];
                                sendAlert(null, null, `${getObj('character',charId).get('name')} removed from list!`,`Show Character List`,`!empower --list false,true`);
                            })
                        updateState('settings');
                        break;
                    case 'delme':
                        player = msg.playerid;
                        sendChat('',`!empower --delplayer ${player}`);
                        break;
                    case 'delplay':
                    case 'delplayer':
                        player = isIdOrName(args, 'player');
                        if (Object.keys(settings.playerList).some(p => p === player)) {
                            delete settings.playerList[player];
                            sendAlert(null, null, `${getObj('player',player).get('_displayname')} removed from list!`,`Show Player List`,`!empower --list true,false`);
                            updateState('settings');
                        } else {sendAlert('Error', null, `Player not found!`)}
                        break;
                    case 'fknaddme': // add by _id's only
                        ids = args.split(/\s*,\s*/,2)
                        if (ids[0] === cmd) {
                            sendAlert('Error', null, `Error: no ids supplied`)
                            break;
                        }
                        registerId('player', ids[1], ids[0]);
                        break;
                    case 'help':
                    case '?':
                        sendChat(settings.esWho,`/w "${lastPlayer}" ${sendHelp()}`, null, {noarchive:true});
                        break;
                    case 'addlinkchar':
                    case 'linkchar':
                        ids = args.split(/,/,2)
                        //log(`${args}`);
                        player = isIdOrName(ids[0], 'player');
                        charId = isIdOrName(ids[1], 'character');
                        //log(`${player} ${charId}`)
                        if (Object.keys(settings.playerList).some(p => p === player) && getObj('character', charId)) {
                            settings.playerList[player].defaultChar = charId;
                            sendAlert(null, null, `Added default character!`,`Show Player List`,`!empower --list true,false`);
                        } else {
                            sendAlert('Error', null, `Player not registered or can't find character.`);
                        }
                        break;
                    case 'list':
                        arr = args.split(/\s*,\s*/,2);
                        player = (arr[0] === 'false' || arr[0] === '0') ? false : true;
                        chars = (arr[1] === 'false' || arr[1] === '0') ? false : true;
                        sendChat('', `/w "${lastPlayer}" ${getList(player, chars)}`);
                        break;
                    case 'emode':
                        if (args && args.match(/(full|quick|manual)/i)) {
                            settings.empowerMode = args.match(/(full|quick|manual)/i)[1];
                            sendAlert(null, null, `Empower mode updated to:`,`${settings.empowerMode}`,`#`);
                            updateState('settings');
                        } else {sendAlert('Error', null, `Bad syntax, mode not changed.`)}
                        break;
                    case 'smode':
                        if (args && args.match(/(strict|normal|off)/i)) {
                            settings.strictMode = args.match(/(strict|normal|off)/i)[1];
                            sendAlert(null, null, `Strict mode updated to:`,`${settings.strictMode}`,`#`);
                            updateState('settings');
                        } else {sendAlert('Error', null, `Bad syntax, mode not changed.`)}
                            break;
                    case 'resetall':
                        if (playerIsGM(msg.playerid)) {
                            r = {mainIndex1: 0, mainIndex2: 0, expression1: '', expression2: '', dieType1: 0, dieType2: 0, damageFields1: [], damageFields2: [], damageDice1: [], damageDice2: [], damageDiceAll: [], damage1Total: 0, damage2Total: 0, damageGrandTotal: 0}
                            Object.assign(settings, { playerList: {}, characterList: {}, empowerMode: 'full'})
                            lastMsg='', lastPlayer='', lastSpellname='', lastWho='', lastCharname='', lastCharacterId='', lastPlayerId='',sorceryPoints=0, sorceryPointsValue='',sorceryPointsName='';
                            sendAlert('Error', 'pub', `All empowered spell 5e script settings have been cleared!`);
                            updateState('settings chat roll');
                        }
                        return;
                    case 'setting':
                    case 'settings':
                        sendChat(settings.esWho,`/w "${lastPlayer}" ${sendSettings()}`, null, {noarchive:true});
                        return;
                    case 'empowerselect':
                        if (lastMsg && lastMsg.inlinerolls && lastPlayerId === msg.playerid) {empowerSelect()}
                        return;
                    case 'empowerreroll':
                        if (lastPlayerId === msg.playerid) {empowerReroll(args);}
                        return;
                    default:
                        sendAlert('Error', null, `Command not recognised => ${cmd}`);
                        break;
                }
            })
        } else if (msg.inlinerolls && (Object.keys(settings.playerList).some(p => p === msg.playerid) || Object.keys(settings.characterList).some(c => c === msg.who))) {
            if (msg.content.search(regex.spellSearch) === -1 || msg.content.search(regex.damage1) === -1) return;
            // spell filtering goes here when done
            lastMsg = msg;
            lastWho = msg.who;
            lastPlayerId = msg.playerid
            lastPlayer = getObj('player',msg.playerid).get('displayname');
            lastSpellname = (msg.content.match(regex.spellName)) ? msg.content.match(regex.spellName)[1] : 'Spell';
            lastCharname = (msg.content.search(/charname=(.*[^{}])/i) !== -1 ? msg.content.match(/charname=(.*[^{}])/i)[1] : null);
            updateState('chat');
            if (settings.empowerMode.search(/quick/i) !== -1) {
                empowerSelect();
                return;
            } else if (settings.empowerMode.search(/manual/i) !== -1) {
                //sendChat('',`/w ${lastPlayer} Roll info scraped...`)
            } else {
                sendChat(lastPlayer,`/w ${lastPlayer} <table style="${style.empowerCast}"><tr><td style="${style.empowerTd}">[Empower ${lastSpellname}](!empower --empowerSelect" style="${style.empowerCastAHref})</td></tr></table>`);
                return;
            }
        } else return;
    }

    const isIdOrName = (arg, type) => {  // process names into unique ids if required
        let nametype = (type === 'player') ? 'displayname' : 'name';
        //log(arg);
        if (arg && arg.search(/^-.*/) === -1) {
            if (findObjs({type: type, [nametype]: arg.trim()}, {caseInsensitive: true}).length > 0) {
                arg = findObjs({type: type, [nametype]: arg.trim()}, {caseInsensitive: true})[0].get('id');
            } else {
                return false;
            }
        }
        return arg;
    }

    const registerId = (type, characterId, playerId) => {  // push player & character registrations to arrays
        if (type === 'player') {
            if (getObj('player', playerId)) {
                let playerName = getObj('player', playerId).get('displayname');
                if (Object.keys(settings.playerList).some(p => p === playerId)) {
                    if (getObj('character', characterId)) {
                        sendAlert(null, null, `Player already registered:`,`Click here`,`!empower --linkchar ${playerId}, ${characterId}`,`to update default character with **${getObj('character', characterId).get('name')}**.</td></tr></table>`);
                    } else {
                        sendAlert(null, null, `Player already registered!`,`Show Player List`,`!empower --list true&#44;false`);
                    }
                } else {
                    settings.playerList[playerId] = {
                        id: playerId,
                        name: playerName,
                        defaultChar: characterId || '',
                    }
                    sendAlert(null, null, `Successfully added ${playerName}!`,`Show Player List`,`!empower --list true&#44;false`);
                }
            } else {sendAlert('Error', null, `Bad player id or name`)}
        }
        if (type === 'character') {
            if (getObj('character', characterId)) {
                let charName = getObj('character', characterId).get('name') || 'Charname error';
                if (Object.keys(settings.characterList).some(c=> c === charName)) {
                    sendAlert('Error', null, `Character already registered!`,`Show Character List`,`!empower --list false&#44;true`);
                } else {
                    settings.characterList[charName] = {
                        id: characterId,
                        name: charName,
                        sorcery: getSorceryPoints(characterId),
                    };
                    sendAlert(null ,null ,`Successfully added ${charName}!`,`Show Character List`,`!empower --list false&#44;true`);
                }
            } else {sendAlert('Error', null,`Bad character id or name`)}
        }
        updateState('settings');
        return;
    }

    const getSorceryPoints = (charId) => {
        if (charId && getObj('character', charId)) {
            let regexSorc = /sorcery\s*points/i;
            if (getAttrByName(charId, 'class_resource_name').search(regexSorc) !== -1) {
                sorceryPointsValue = findObjs({type:'attribute', characterid: charId, name: `class_resource`})[0].get('id');
                sorceryPointsName = findObjs({type:'attribute', characterid: charId, name: `class_resource_name`})[0].get('id');
            } else if (getAttrByName(charId, 'other_resource_name').search(regexSorc) !== -1) {
                sorceryPointsValue = findObjs({type:'attribute', characterid: charId, name: `other_resource`})[0].get('id');
                sorceryPointsName = findObjs({type:'attribute', characterid: charId, name: `other_resource_name`})[0].get('id');
            } else {
                let resourceArray = getRepIds(charId, 'repeating_resource_$0_resource_left_name')
                resourceArray.forEach(row => {
                    if (getAttrByName(charId, `repeating_resource_${row}_resource_left_name`).search(regexSorc) !== -1) {
                        sorceryPointsName = findObjs({type:'attribute', characterid: charId, name: `repeating_resource_${row}_resource_left_name`})[0].get('id');
                        sorceryPointsValue = findObjs({type:'attribute', characterid: charId, name: `repeating_resource_${row}_resource_left`})[0].get('id');
                    } else if (getAttrByName(charId, `repeating_resource_${row}_resource_right_name`).search(regexSorc) !== -1) {
                        sorceryPointsName = findObjs({type:'attribute', characterid: charId, name: `repeating_resource_${row}_resource_right_name`})[0].get('id');
                        sorceryPointsValue = findObjs({type:'attribute', characterid: charId, name: `repeating_resource_${row}_resource_right`})[0].get('id');
                    }
                })
            }
            updateState('settings');
            return {name: sorceryPointsName, value: sorceryPointsValue}
        }
        return null;
    }

    const getRepIds = (charId, sectionName) => {  // section name in the format repeating_npcaction_$0_attack_name
        if (getObj('character', charId)) {
            let repSecParts = sectionName.trim().split(/_\$+\d*_/);
            let regex = new RegExp(`${repSecParts[0]}_(-.*)_${repSecParts[1]}`)
            if (repSecParts.length !== 2 || repSecParts[0].search(/repeating/i) === -1) {
                return;
            }
            let idArray = [];
            findObjs({type: 'attribute', characterid: charId}).filter(attr => {
                if (attr.get('name').search(repSecParts[0]) !== -1 && attr.get('name').search(repSecParts[1]) !== -1 && attr.get('name').match(regex)) {
                    idArray.push(attr.get('name').match(regex)[1]);
                }
            })
            return idArray;
        }        
    }

    const sendAlert = (alertStyle = '', who, text, buttonLabel, buttonCommand, text2) => { // simple alert messages, who=all/pub for public
        let buttonHtml = '', extraText = (text2) ? `<br>${text2}` : '';
        let substyle = (!alertStyle) ? `empower` : `empower${alertStyle}`;         // eslint-disable-next-line no-unused-vars
        let Href = `${substyle}AHref`, Td = `${substyle}Td`, Th = `${substyle}Th`;
        let whisper = (who === 'all' || who === 'pub') ? '' : (who) ? `/w ${who} ` : (lastPlayer) ? `/w "${lastPlayer}" ` : '/w gm ';
        if (buttonLabel && buttonCommand) buttonHtml = `<br>[${buttonLabel}](${buttonCommand}" style="${style[Href]})`;
        let table = `<table class="${substyle}" style="${style[substyle]}"><tr><td style="${style[Td]}">${text}${buttonHtml}${extraText}</td></tr></table>`
        sendChat('',`${whisper}${table}`, null, {noarchive: true});
    }

    const sendHelp = () => {
        let c2 = `colspan="2"`;
        let headerHelp = `<table class="empower Help" style="${style.empowerHelp}width:110%"><tr><th ${c2} style="${style.empowerHelpTh}">==( ${settings.scriptName} )==<br>Help</th></tr><tr><td ${c2} style="${style.empowerHelpTd}">Players & Characters must be registered with empower5e before their rolls will be picked up. The easiest way is to use "!empower --addme" or the buttons via "!empower --list". Other command line options are below</td></tr>`
        let bodyHelp = `<tr><th style="${style.empowerHelpTh} width: 30%; text-align:left">Command</th><th style="width: 70%; ${style.empowerHelpTh}">Detail</th></tr><tr><td style="${style.empowerHelpTd}">--addme</td><td style="${style.empowerHelpTd}">The easiest way for a player to add themselves, will prompt for default character (optional)</td></tr>        <tr><td style="${style.empowerHelpTd}">--list</td><td style="${style.empowerHelpTd}">Show player & character registers. Contains link & delete & add functionality.</td></tr>        <tr><td style="${style.empowerHelpTd}">--addplay<br>--addplayer</td><td style="${style.empowerHelpTd}">--addplayer player, [character]<br>Add a player to register, optionally with a linked default character. Use names or id's.</td></tr>        <tr><td style="${style.empowerHelpTd}">--addchar<br>--addchars</td><td style="${style.empowerHelpTd}">--addchars character, [character] ...<br>Add one or more characters by name or id.</td></tr>        <tr><td style="${style.empowerHelpTd}">--linkchar</td><td style="${style.empowerHelpTd}">--linkchar player, character<br>Link a default character sheet to a player. This character sheet will be used as a default whenever the player rolls a spell, regardless of other character name output settings. Use names or id's.</td></tr>        <tr><td style="${style.empowerHelpTd}">--emode</td><td style="${style.empowerHelpTd}">--emode full|quick|manual<br>Response mode for empower5e once you're registered. Default is 'full' - every detected spellcast will generate an empower prompt for the registered player/character. 'Quick' mode generates a smaller response table with 1 less step. 'Manual' generates no response, but stores the roll info. Create a macro with the value "!empower --empowerSelect" to empower the last registered spell with manual mode.</td></tr> <tr><td style="${style.empowerHelpTd}">--smode</td><td style="${style.empowerHelpTd}">--smode normal|strict|off<br>Change Sorcery Point tracking mode. Normal blocks Empowering if Sorcery points are at 0. Strict blocks Empowered attempts if SP are at 0, or the resource cannot be found on the character sheet. Off disables SP tracking.</td></tr>        <tr><td style="${style.empowerHelpTd}">--delchar<br>--delplayer</td><td style="${style.empowerHelpTd}">Delete characters or players from register. Can just use the --list functionality instead.</td></tr>        <tr><td style="${style.empowerHelpTd}">--resetall</td><td style="${style.empowerHelpTd}">Reset all settings in script & state object, including player & character registers.</td></tr>        `
        let footerHelp = `<tr><th ${c2} style="${style.empowerHelpTh}">[Show Settings Table](!empower --settings" style="${style.empowerHelpAHref})</th></tr></table>`;
        return `${headerHelp}${bodyHelp}${footerHelp}`;
    }

    const sendSettings = () => {
        let c2 = `colspan="2"`;
        let headerSet = `<table class="empower Help" style="${style.empowerHelp}width:110%"><tr><th ${c2} style="${style.empowerHelpTh}">==( ${settings.scriptName} )==<br>Settings</th></tr><tr><th style="${style.empowerHelpTh}width: 40%;">Option</th><th style="${style.empowerHelpTh}width:60%; ">Current Value</th></tr>`;
        let bodySet = `<tr><td style="${style.empowerHelpTd}"><b>Response Mode</b></td><td style="${style.empowerHelpTd}text-align: center; ">[${settings.empowerMode.toUpperCase()}](!empower --emode &#63;{Change empower5e response mode to|Full|Quick|Manual}" style="${style.empowerHelpAHref})<br>Change empower5e feedback mode once a spell is detected</td></tr><tr><td style="${style.empowerHelpTd}"><b>Strict Mode</b></td><td style="${style.empowerHelpTd}text-align: center; ">[${settings.strictMode.toUpperCase()}](!empower --smode &#63;{Change empower5e spellpoint strictness to|Normal|Strict|Off}" style="${style.empowerHelpAHref})<br>Normal mode will block Empower attempts at 0 sorcery points. Strict will block Empower attempts at 0 or 'not found' SP. Off will not track Sorcery Points.</td></tr>`;
        let footerSet = `<tr><th ${c2} style="${style.empowerHelpTh}">Settings still under construction....</th></tr></table>`
        return `${headerSet}${bodySet}${footerSet}`;
    }

    const updateState = (whichVars) => {     // push settings changes to state object
        if (whichVars.search(/settings/i) !== -1) {
            state.empoweredSpell5e.playerList = settings.playerList;
            state.empoweredSpell5e.characterList = settings.characterList;
            state.empoweredSpell5e.empowerMode = settings.empowerMode
            state.empoweredSpell5e.strictMode = settings.strictMode
        }
        if (whichVars.search(/chat/i) !== -1) {
            state.empoweredSpell5e.lastPlayer = lastPlayer;
            state.empoweredSpell5e.lastWho = lastWho;
            state.empoweredSpell5e.lastMsg = lastMsg;
            state.empoweredSpell5e.lastSpellname = lastSpellname;
        }
        if (whichVars.search(/roll/i) !== -1) {
            state.empoweredSpell5e.lastRoll = r;
        }
        return;
    }

    const registerEventHandlers = () => {
        on('chat:message', handleInput);
    };
    on('ready', () => {
        checkInstall();
        registerEventHandlers();
    });
    return {
    };
})();
