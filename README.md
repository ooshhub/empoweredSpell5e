# empoweredSpell5e v0.4.0
API script for Roll20

Listens for rolls from registered Sorcerers, and responds with Empowered Roll options. Pulls charisma_mod from the character sheet to determine maximum allowed rerolls. Automatically prompts the caster to reroll a number of dice up to maximum, automatically sorted so it suggests the lowest rolls. Manual input is possible if the lowest rolls aren't the desired discards, but AFAIK checkboxes are not possible to output from the API so "manual" must be typed into a Query input.

Players & Characters must be registered with empower5e before their rolls will be picked up. The easiest way is to use "!empower --addme" or the buttons via "!empower --list". This info can be brought up with "!empower --help".

A default character can be linked for each player. This character will be used for charisma_mod and Sorcery Points tracking, regardless of other name detection methods & "speaking as" settings. This is optional, but should cover players using macros that don't output any "charname=".

Registering a GM as player is not recommended for a live game. There is no roll cache, so all GM spell rolls will overwrite the roll in memory. If you have a Sorcerer NPC, add them as a Character only, and either output their name to templates, or change "speaking as" so their spellcasts are picked up.

Once set up, if the player doesn't wish to be constantly prompted for Empowering, set the response mode to "manual" via "!empower --settings"
Spells can then be empowered with the line "!empower --empowerselect" run from a macro button. The command will fail if it is not run by the same player who generated the spell damage roll in the script's memory.

Command Line:
--addme	The easiest way for a player to add themselves, will prompt for default character (optional)

--list	Show player & character registers. Contains link & delete & add functionality.

--addplayer	player, [character]
Add a player to register, optionally with a linked default character. Use names or id's.

--addchars character, [character] ...
Add one or more characters by name or id.

--linkchar	--linkchar player, character
Link a default character sheet to a player. This character sheet will be used as a default whenever the player rolls a spell, regardless of other character name output settings. Use names or id's.

--emode	--emode full|quick|manual
Response mode for empower5e once you're registered. Default is 'full' - every detected spellcast will generate an empower prompt for the registered player/character. 'Quick' mode generates a smaller response table with 1 less step. 'Manual' generates no response, but stores the roll info. Create a macro with the value "!empower --empowerSelect" to empower the last registered spell with manual mode.

--delchar/--delplayer	Delete characters or players from register. Easier to just use the --list functionality instead.

--resetall	Reset all settings in script & state object, including player & character registers.
