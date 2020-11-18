// Empowered Spell for 5e sheet

const empoweredSpell5e = (() => { // eslint-disable-line no-unused-vars
    const version = '0.2.0';
    const lastUpdate = 1531675536;
    const schemaVersion = 0.2;
    const checkInstall = () =>  {
        log('-=> empoweredSpell5e v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');// eslint-disable-next-line no-prototype-builtins
        if (! state.hasOwnProperty('empoweredSpell5e') || state.empoweredSpell5e.version !== schemaVersion) {
            log(` >>> Updating Schema to v${schemaVersion} <`);
            switch (state.empoweredSpell5e.version) {
                case '':
                    state.empoweredSpell5e = {
                        playerList: [],
                        characterList: [],
                    } // falls through
                case '0.1':
                    state.empoweredSpell5e = {
                        version: schemaVersion,
                        lastPlayer: '',
                        lastWho: '',
                        lastMsg: '',
                        lastSpellname: '',
                        lastRoll: '',
                    }
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
    };

    const settings = {
        playerList: [],
        characterList: [],
        esWho: 'empower5e bot',
        empowerMode: 'full',
    }

    let style = {
        empower: `background: #89bcbd; padding-top:10px; padding-bottom: 10px; width:100%; margin-left:-20px; border:2px solid #015959; border-radius: 10px; border-collapse: separate; `,
        empowerTd: `padding:5px; text-align:center; `,
        empowerTh: `font-size:14px; background:#86dedf; width:50%; border-top:1px solid #015959; border-bottom: 1px solid #015959; padding:5px; text-align:center; `,
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
        empowerReroll: `${style.empower}background:#9f7b28; font-weight:bold; `,
        empowerRerollTh: `${style.empowerTh}font-size:14px; background:#e1a220; border-top:1px solid #9f7b28; border-bottom: 1px solid #9f7b28; `,
        empowerRerollTd: `${style.empowerTd}background-color: #fff; border: 1px solid; border-color: #956502; `,
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

    let lastMsg, lastPlayer, lastSpellname, lastWho, lastCharname, lastCharacterId;
    let sorceryPointsAttr, sorceryPointsCurrent;

    const empowerSelect = () => {      // generate dialog for player to select dice to reroll
        let lastRoll = lastMsg.inlinerolls, lastContent = lastMsg.content;
        let lastCharacterIndex = settings.characterList.findIndex(c => c.name === lastWho);
        let maxRerolls;
        let splitRoll = 0;
        //log(JSON.stringify(lastRoll));
        //log(lastContent);
        if (lastCharname && isIdOrName(lastCharname,'character')) {   // grab character for charisma_mod
            lastCharacterId = isIdOrName(lastCharname, 'character');
            maxRerolls = Math.max(parseInt(getAttrByName(lastCharacterId,'charisma_mod'),10),1) || 5;        
        } else if (lastCharacterIndex > -1) {   
            lastCharacterId = settings.characterList[lastCharacterIndex].id;
            lastCharname = getObj('character', lastCharacterId).get('name');
            maxRerolls = Math.max(parseInt(getAttrByName(lastCharacterId,'charisma_mod'),10),1) || 5;
        } else if (settings.playerList.find(p => p.id === lastMsg.playerid)) {
            let index = settings.playerList.findIndex(p => p.id === lastMsg.playerid);
            lastCharacterId = settings.playerList[index].defaultChar;
            lastCharname = getObj('character', lastCharacterId).get('name');
            maxRerolls = Math.max(parseInt(getAttrByName(lastCharacterId,'charisma_mod'),10),1) || 5;
        } else {
            sendChat('',` /w ${lastPlayer} Error: empowerSelect should not have been triggered by id: ${lastMsg.playerid} or name: ${lastWho}`);
            return;
        }

        if (lastCharacterId && getObj('character', lastCharacterId)) { // find sorcery points, only main two resource fields for now
            log(`Searching for Sorcery Points...`);
            if (getAttrByName(lastCharacterId, 'class_resource_name').search(/sorcery\s*points/i) !== -1) {
                sorceryPointsAttr = 'class_resource';
            } else if (getAttrByName(lastCharacterId, 'other_resource_name').search(/sorcery\s*points/i) !== -1) {
                sorceryPointsAttr = 'other_resource';
            }
        }
        if (sorceryPointsAttr) {sorceryPointsCurrent = getAttrByName(lastCharacterId, sorceryPointsAttr)}

        if (sorceryPointsAttr && sorceryPointsCurrent < 1) {
            sendChat('',`/w ${lastWho} <table class="empower empowerError" style="${style.empowerError}"><tr><td>${lastCharname} has no sorcery points left!!!</td></tr></table>`);
            return;
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
                    r.damage1Total += lastRoll[i].results.total;
                    lastRoll[i].results.rolls.forEach(roll => {
                        if (roll.sides === r.dieType1 && roll.dice > 0) {
                            roll.results.forEach(v => {
                                r.damageDice1.push(v.v);
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
                        r.damage2Total += lastRoll[i].results.total;
                        lastRoll[i].results.rolls.forEach(roll => {
                            if (roll.sides === r.dieType2 && roll.dice > 0) {
                                roll.results.forEach(v => {
                                    r.damageDice2.push(v.v);
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
        let bodySTop = []; // need to do quickMode version of style
        let bodySBot = [];
        let bodyS = [];
        let footerS = (splitRoll === 0) ? `</tr><tr><th colspan="${maxRerolls}" style="${style.empowerSelectTh}">[Manual Reroll](!empower --empowerReroll &#63;{Reroll which dice (space separated values e.g. 1 1 1 3&rpar;}" style="${style.empowerSelectAHref})</th></tr></table>` : `</tr><tr><th colspan="${maxRerolls}" style="${style.empowerSelectTh}">[Manual Split Damage Reroll](!empower --empowerReroll &#63;{Reroll which dice values (space separated values use hyphen to denote which die type, e.g. 1-d6 1-d10  2-d6 4-d10&rpar;}" style="${style.empowerSelectAHref})</th></tr></table>`
        if (splitRoll === 0) {
            for (let i = 0; i < maxRerolls && i < r.damageDice1.length; i++) {
                if (i > 0 && i%5 === 0) {
                    bodySTop.push(`</tr><tr>`);
                    bodySBot.push(`</tr><tr>`);
                    bodyS.push(bodySTop.join(''), bodySBot.join(''));
                    bodySTop = [], bodySBot = [];
                }
                bodySTop.push(`<td style="${style.empowerSelectTd}">${i+1}</td>`)
                bodySBot.push(`<td style="${style.empowerSelectTd}">[${r.damageDice1[i]}](!empower --empowerReroll ${r.damageDice1.slice(0,i+1).join(' ')}" style="${style.empowerSelectTdAHref})</td>`)
            }
            bodyS.push(bodySTop.join(''), `</tr><tr>`, bodySBot.join(''));
        } else {
            bodyS.push(`<td colspan="5" style="${style.empowerSelectTd}">Dice are sorted according to percentage of maximum roll, e.g. 3 (d20) is "lower" than 2 (d4)</td></tr><tr>`)
            for (let i = 0; i < maxRerolls && i < r.damageDiceAll.length; i++) {
                if (i > 0 && i%5 === 0) {
                    bodySTop.push(`</tr><tr>`);
                    bodySBot.push(`</tr><tr>`);
                    bodyS.push(bodySTop.join(''), bodySBot.join(''));
                    bodySTop = [], bodySBot = [];
                }
                bodySTop.push(`<td style="${style.empowerSelectTd}">${i+1}</td>`);
                bodySBot.push(`<td style="${style.empowerSelectTd}">[${r.damageDiceAll[i]}](!empower --empowerReroll ${r.damageDiceAll.slice(0,i+1).join(' ')}" style="${style.empowerSelectTdAHref})</td>`)
            }
            bodyS.push(bodySTop.join(''), `</tr><tr>`, bodySBot.join(''));
        }
        sendChat(lastPlayer,`/w ${lastPlayer} ${headerS}${bodyS.join('')}${footerS}`);
    }

    const empowerReroll = (dice) => { // reroll the dice selected in empowerSelect & output new rolls & total
        if (!dice || dice.length < 1) {
            sendChat(lastPlayer, `/w ${lastPlayer} Empty empower roll received!`)
            return;
        }
        let oldDiceArray = dice.replace(/[^\d\sd-]/g,'').split(/\s+/g);
        let reroll1, reroll2;
        let oldTotal1, oldTotal2;
        let splitRoll1 = [], splitRoll2 = [];
        //log(`reroll array: ${oldDiceArray}`);
        if (oldDiceArray[0].search(/d/i) !== -1) { //look for split roll
            const splitType1 = new RegExp (`(\\d*)-d${r.dieType1}`);  //process different die sizes 
            const splitType2 = new RegExp (`(\\d*)-d${r.dieType2}`);
            oldDiceArray.forEach(d => {
                if (d.search(splitType1) !== -1) {
                    //log(d.match(splitType1)[1]);
                    splitRoll1.push(parseInt(d.match(splitType1)[1]));
                } else if (d.search(splitType2) !== -1) {
                    //log(d.match(splitType2)[1]);
                    splitRoll2.push(parseInt(d.match(splitType2)[1]));
                } else {sendChat('', `/w ${lastPlayer} bad die input: ${d}`)}
            })
            reroll1 = `${splitRoll1.length}d${r.dieType1}`;
            reroll2 = `${splitRoll2.length}d${r.dieType2}`;
            //log(`${splitRoll1}, ${splitRoll2}`);
            oldTotal1 = (splitRoll1.length > 0) ? splitRoll1.reduce((a,b) => {return parseInt(a) + parseInt(b)}) : 0;
            oldTotal2 = (splitRoll2.length > 0) ? splitRoll2.reduce((a,b) => {return parseInt(a) + parseInt(b)}) : 0;
        } else {  // all damage dice are the same
            reroll1 = `${oldDiceArray.length}d${r.dieType1}`; 
            oldTotal1 = oldDiceArray.reduce((a,b) => {return parseInt(a) + parseInt(b)})
            splitRoll1 = oldDiceArray.join(',');
        }
        log(`D1: ${r.damage1Total}, D2: ${r.damage2Total}<br>R1: ${reroll1}, R2: ${reroll2}<br>O1: ${oldTotal1}, O2: ${oldTotal2}`);
        let splitCols = (splitRoll2.length > 0) ? 3 : 2;    // create reroll output
        let headerRDmg2 = '', bodyROldRoll = '', bodyRReroll = '';
        let footerName = (lastCharname) ? lastCharname : lastWho;
        let rollMath = `[[${r.damageGrandTotal}[OldTotal] - ${oldTotal1}[Old] + [[${reroll1}]][New]]]`, rollMath2 = ``;
        let newTotal = `colspan="${splitCols - 1}">$[[1]]`, oldTotal = `colspan="${splitCols - 1}">${r.damageGrandTotal}`;
        if (sorceryPointsAttr) {sorceryPointsCurrent = getAttrByName(lastCharacterId, sorceryPointsAttr)} // update sorcery points

        if (splitCols === 3 ) {
            headerRDmg2 = `<th style="${style.empowerRerollTh}">Dmg 2 (d${r.dieType2})</th>`, bodyROldRoll = `<td style="${style.empowerRerollTd}">${splitRoll2}</td>`, bodyRReroll = `<td style="${style.empowerRerollTd}">$[[2]] (${reroll2})</td>`;
            rollMath = `[[${r.damage1Total}-${oldTotal1}+[[${reroll1}]]]]`, rollMath2 = `[[${r.damage2Total}-${oldTotal2}+[[${reroll2}]]]]`;
            log(`${rollMath}`);
            newTotal = `>$[[1]]</th><th style="${style.empowerRerollTh}">$[[3]]`, oldTotal = `>${r.damage1Total}</td><td style="${style.empowerRerollTd}">${r.damage2Total}`;
            
        }
        let headerR = `<table class="empower empowerReroll" style="${style.empowerReroll}"><tr><th colspan="${splitCols}" style="${style.empowerRerollTh}">Empowered ${lastSpellname}</th></tr><tr><th style="${style.empowerRerollTh}"></th><th style="${style.empowerRerollTh}">Dmg 1 (d${r.dieType1})</th>${headerRDmg2}</tr>`;
        let bodyR = `<tr><td style="display:none">${rollMath}</td><td style="display:none">${rollMath2}</td></tr><tr><td style="${style.empowerRerollTd}">Old Total:</td><td style="${style.empowerRerollTd}" ${oldTotal}</td></tr><tr><td style="${style.empowerRerollTd}">Discard:</td><td style="${style.empowerRerollTd}">${splitRoll1}</td>${bodyROldRoll}</tr><tr><td style="${style.empowerRerollTd}">Rerolls:</td><td style="${style.empowerRerollTd}">$[[0]] (${reroll1})</td>${bodyRReroll}</tr><tr><th style="${style.empowerRerollTh}">New Total:</th><th style="${style.empowerRerollTh}" ${newTotal}</th></tr>`;
        let footerR;
        if (!sorceryPointsAttr) {
            footerR = `<tr><td colspan="${splitCols}" style="${style.empowerRerollTd}">${footerName} spent 1 Sorcery Point (no sheet/attribute found, point not deducted)</td></tr></table>`
        } else if (sorceryPointsCurrent < 1) {
            sendChat(lastWho,`<table class="empower empowerError" style="${style.empowerError}"><tr><td style="${style.empowerTd}">${footerName} has no sorcery points left!!!</td></tr></table>`);
            return;
        } else {
            sorceryPointsCurrent = parseInt(getAttrByName(lastCharacterId, sorceryPointsAttr),10);
            footerR = `<tr><td colspan="${splitCols}" style="${style.empowerRerollTd}">${footerName} spent 1 Sorcery Point (${sorceryPointsCurrent - 1} SP remaining)</td></tr></table>`;
            findObjs({type: 'attribute', characterid: lastCharacterId, name: sorceryPointsAttr})[0].set('current', sorceryPointsCurrent - 1);
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

        if (settings.playerList.length < 1) { // assemble player list body
            bodyP.push(`<br><tr><td colspan="3" style="${style.empowerTd}">Player list is empty</td></tr>`);
        } else {
            settings.playerList.forEach(player => {
                if (getObj('player',player.id)) {
                    bodyP.push(`<br><tr><td style="${style.empowerTd}">${getObj('player',player.id).get('_displayname')}</td>`);
                    if (getObj('character',player.defaultChar)) {
                        bodyP.push(`<td style="${style.empowerTd}">${getObj('character',player.defaultChar).get('name')}</td><td class="empowerDelete" style="${style.empowerTd}">[X](!empower --delplayer ${player.id}" style="${style.empowerDelete})</td></tr>`);
                    } else {
                        bodyP.push(`<td class="empowerAdd" style="${style.empowerTd}">[+](!empower --linkchar ${player.id}, &#63;{Enter character name to link}" style="${style.empowerAdd})</td><td class="empowerDelete" style="${style.empowerTd}">[X](!empower --delplayer ${player.id}" style="${style.empowerDelete})</td></tr>`)
                    }
                } else { bodyP.push(`<br><tr><td colspan="2" style="${style.empowerTd}">Bad player id or link</td><td class="empowerDelete">[X](!empower --delrow ${settings.playerList.findIndex(p => {return p.id === `${player.id}`})}&#44;player)</td></tr>`);}
            });
        
        if (settings.characterList.length < 1) { // assemble character list body
            bodyC.push(`<br><tr><td colspan="3" style="${style.empowerTd}">Character list is empty</td></tr>`);
        } else {
            settings.characterList.forEach(char => {
                if (getObj('character',char.id)) {
                    bodyC.push(`<br><tr><td colspan="2" style="${style.empowerTd}">${char.name}</td><td class="empowerDelete" style="${style.empowerTd}">[X](!empower --delchar ${char.id}" style="${style.empowerDelete})</td></tr>`);
                } else { bodyC.push(`<br><tr><td colspan="2" style="${style.empowerTd}">Bad player id or link</td><td class="empowerDelete" style="${style.empowerTd}">[X](!empower --delrow ${settings.characterList.findIndex(c => {return c.id === `${char.id}`})}&#44;character" style="${style.empowerDelete})</td></tr>`);}
            });
        }
        playerList = (playerGet !== false) ? `${headerP}${bodyP.join('')}${footerP}` : '';
        characterList = (characterGet !== false) ? `${headerC}${bodyC.join('')}${footerC}` : '';
        return `${playerList}${characterList}`;
        }
    }

    const handleInput = (msg) => {
        if (msg.type === 'api' && msg.content.search(/^!empower\b/i) !== -1) {
            let commands = msg.content.slice(msg.content.indexOf(' ')).trim().split(/--/g);
            commands.shift();
            commands.forEach(command => {
                let cmd = command.split(/\s/,1).toString(); 
                let args = command.slice(command.indexOf(' ')+1).trim(); 
                let chars = 0, index = 0, player = 0, controlledChars = [], controlledCharsList = [], ids = [], arr = [], charId = [];
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
                            sendChat(settings.esWho,`<table class="empowerList" style="${style.empowerError}"><tr><td style="${style.empowerTd}">Adding GM as a player is NOT recommended.<br><br>[Click here](!empower --fknaddme ${player}" style="${style.empowerAHref})<br>if you really mean it!</td></tr></table>`);
                            break;
                        } // eslint-disable-next-line no-undef, underscore/prefer-invoke
                        controlledChars = _.map(findObjs({_type: 'character', controlledby: player}),c => c.get('_id')); 
                        controlledCharsList = []
                            if (controlledChars.length === 0) {
                                settings.playerList.push({
                                    id: player, 
                                    defaultChar: ''
                                });
                                sendChat(settings.esWho,`<table class="empowerList" style="${style.empower}"><tr><td style="${style.empowerTd}">${getObj('player',player).get('_displayname')} added, no controlled characters found.<br>[Show Player List](!empower --list true, false" style="${style.empowerAHref})</td></tr></table>`);
                                updateState('settings');
                            } else {
                                controlledChars.forEach(char => {
                                    if (getObj('character', char)) {
                                        controlledCharsList.push(`<br><tr><td style="${style.empowerTd}">[${getObj('character', char).get('name')}](!empower --fknaddme ${player}, ${char}" style="${style.empowerAHref})</td></tr>`)
                                    }
                                })
                                sendChat(settings.esWho,`<table class="empowerList" style="${style.empower}"><tr><th style="${style.empowerTh}">Select your default character:</th></tr>${controlledCharsList}</table>`)
                            }
                        break;
                    case 'fknaddme': // add by _id's only
                        ids = args.split(/,/,2)
                            if (ids[0] === cmd) {
                                sendChat(settings.esWho,`<table class="empowerList" style="${style.empowerError}"><tr><td style="${style.empowerTd}">Error: no ids supplied</td></tr></table>`)
                                break;
                            }
                            registerId('player', ids[1], ids[0]);
                            break;
                    case 'addplay':
                    case 'addplayer': //--addplayer name, defchar      (comma separated)
                        arr = args.split(/,/,2);
                        player = isIdOrName(arr[0], 'player');
                        //log(player);
                        charId = isIdOrName(arr[1], 'character');
                        //log(charId);
                        if (playerIsGM(player)) {
                            sendChat(settings.esWho,`<table class="empowerList" style="${style.empowerError}"><tr><td style="${style.empowerTd}">Adding GM as a player is NOT recommended in a live game.<br><br>[Click here](!empower --fknaddme ${player}, ${charId}" style="${style.empowerAHref})<br>if you really mean it!</td></tr></table>`);
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
                                index = settings.characterList.findIndex(c => {return c.id === `${charId}`});
                                settings.characterList.splice(index,1);
                                sendChat(settings.esWho,`<table class="empower" style="${style.empower}"><tr><td style="${style.empowerTd}">${getObj('character',char).get('name')} removed from list!<br>[Show Character List](!empower --list false,true" style="${style.empowerAHref})</tr></td></table>`);
                            })
                        updateState('settings');
                        break;
                    case 'delme':
                        player = msg.playerid;
                        sendChat(settings.esWho,`!empower --delplayer ${player}`);
                        break;
                    case 'delplay':
                    case 'delplayer':
                        player = isIdOrName(args, 'player');
                        index = settings.playerList.findIndex(p => {return p.id === `${player}`});
                            if (index === -1) {
                                sendChat(settings.esWho,`<table class="empowerList" style="${style.empower}"><tr><td style="${style.empowerTd}">Player not found!</tr></td></table>`);
                            } else {
                                settings.playerList.splice(index,1);
                                sendChat(settings.esWho,`<table class="empowerList" style="${style.empower}"><tr><td style="${style.empowerTd}">${getObj('player',player).get('_displayname')} removed from list!<br>[Show Player List](!empower --list true,false" style="${style.empowerAHref})</tr></td></table>`);
                                updateState('settings');
                            }
                        break;
                    case 'delrow':
                        index = args.split(/,/,2);
                        if (index[1].search(/char/) === -1) {
                            settings.playerList.splice(index[0],1);
                            sendChat(settings.esWho,`<table class="empowerList" style="${style.empower}"><tr><td style="${style.empowerTd}">Row ${index[0] + 1} deleted!<br>[Show Player List](!empower --list true,false" style="${style.empowerAHref})</tr></td></table>`);
                        } else {
                            settings.characterList.splice(index[0],1);
                            sendChat(settings.esWho,`<table class="empowerList" style="${style.empower}"><tr><td style="${style.empowerTd}">Row ${index[0] + 1} deleted!<br>[Show Character List](!empower --list false,true" style="${style.empowerAHref})</tr></td></table>`);
                        }
                        break;
                    case 'help':
                        // show help
                        break;
                    case 'addlinkchar':
                    case 'linkchar':
                        ids = args.split(/,/,2)
                        //log(`${args}`);
                        player = isIdOrName(ids[0].trim(), 'player');
                        charId = isIdOrName(ids[1].trim(), 'character');
                        //log(`${player} ${charId}`)
                        if (settings.playerList.find(p => p.id === player) && getObj('character', charId)) {
                            index = settings.playerList.findIndex(p => p.id === player);
                            settings.playerList[index] = {id: player,defaultChar: charId};
                            sendChat(settings.esWho,`<table class="empowerList" style="${style.empower}"><tr><td style="${style.empowerTd}">Added default character!<br>[Show List](!empower --list true,false" style="${style.empowerAHref})</tr></td></table>`);
                        } else {
                            sendChat(settings.esWho,`<table class="empowerList" style="${style.empower}"><tr><td style="${style.empowerTd}">Player not registered or can't find character.</tr></td></table>`);
                        }
                        break;
                    case 'list':
                        arr = args.split(/\s*,\s*/,2);
                        player = (arr[0] === 'false' || arr[0] === '0') ? false : true;
                        chars = (arr[1] === 'false' || arr[1] === '0') ? false : true;
                        sendChat(settings.esWho,getList(player, chars));
                        break;
                    case 'empowerSelect':
                        if (lastMsg && lastMsg.inlinerolls) {empowerSelect()}
                        break;
                    case 'empowerReroll':
                        empowerReroll(args);
                        return;
                    default:
                        sendChat(settings.esWho,`/w ${msg.who} command not recognised => ${cmd}`);
                        break;
                }
            })
        } else if (msg.inlinerolls && (settings.playerList.find(p => p.id === msg.playerid) || settings.characterList.find(c => c.name === msg.who))) {
            if (msg.content.search(regex.spellSearch) === -1 || msg.content.search(regex.damage1) === -1) return;
            // spell filtering goes here when done
            lastMsg = msg;
            lastWho = msg.who;
            lastPlayer = getObj('player',msg.playerid).get('displayname');
            lastSpellname = (msg.content.match(regex.spellName)) ? msg.content.match(regex.spellName)[1] : 'Spell';
            lastCharname = (msg.content.search(/charname=(.*[^{}])/i) !== -1 ? msg.content.match(/charname=(.*[^{}])/i)[1] : null);
            updateState('chat');
            if (settings.empowerMode === 'full') {
                    sendChat(lastPlayer,`/w ${lastPlayer} <table style="${style.empowerCast}"><tr><td style="${style.empowerTd}">[Empower ${lastSpellname}](!empower --empowerSelect" style="${style.empowerCastAHref})</td></tr></table>`);
                return;
            } else if (settings.empowerMode === 'manual') {
                sendChat('',`/w ${lastPlayer} Roll info scraped...`) // remember to remove style line! also rearrange style "if" so 'full' catches all
            } else empowerSelect();
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
        let changes = 0;
        if (type === 'player') {
            if (getObj('player', playerId)) {
                if (settings.playerList.find(p => p.id === playerId)) {
                    if (getObj('character', characterId)) {
                        sendChat(settings.esWho,`<table class="empowerList" style="${style.empower}"><tr><td style="${style.empowerTd}">Player already registered:<br>[Click here](!empower --linkchar ${playerId}, ${characterId}" style="${style.empowerAHref}) to update default character with **${getObj('character', characterId).get('name')}**.</td></tr></table>`);
                    } else {
                        sendChat(settings.esWho,`<table class="empowerList" style="${style.empower}"><tr><td style="${style.empowerTd}">Player already registered!<br>[Show List](!empower --list true&#44;false" style="${style.empowerAHref})</td></tr></table>`);
                    }
                } else {
                    settings.playerList.push({
                        id: playerId,
                        defaultChar: characterId || '',
                    })
                    sendChat(settings.esWho,`<table class="empowerList" style="${style.empower}"><tr><td style="${style.empowerTd}">Successfully added!<br>[Show Player List](!empower --list true&#44;false" style="${style.empowerAHref})</tr></td></table>`);
                    changes = 1;
                }
            } else {sendChat(settings.esWho,`/w ${lastWho} Bad player id or name`)}
        }
        if (type === 'character') {
            if (getObj('character', characterId)) {
                if (settings.characterList.find(c=> c.id === characterId)) {
                    sendChat(settings.esWho,`<table class="empowerList" style="${style.empower}"><tr><td style="${style.empowerTd}">Character already registered!<br>[Show Character List](!empower --list false&#44;true" style="${style.empower}")</td></tr></table>`);
                } else {
                    let charName = getObj('character', characterId).get('name') || 'Charname error';
                    settings.characterList.push({
                        id: characterId,
                        name: charName,
                    });
                    sendChat(settings.esWho,`<table class="empowerList" style="${style.empower}"><tr><td style="${style.empowerTd}">Successfully added ${charName}!<br>[Show Character List](!empower --list false&#44;true" style="${style.empowerAHref})</tr></td></table>`);
                    changes = 1;
                }
            } else {sendChat(settings.esWho,`/w ${lastWho} Bad character id or name`)}
        }
        if (changes === 1) {updateState('settings')}
        changes = 0;
        return;
    }

    const updateState = (whichVars) => {     // push settings changes to state object
        if (whichVars.search(/settings/i) !== -1) {
            state.empoweredSpell5e.playerList = settings.playerList;
            state.empoweredSpell5e.characterList = settings.characterList;
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