// System Module Imports
import { ACTION_TYPE, ITEM_TYPE, COMPENDIUM_ID, ABILITY, GROUP} from './constants.js'
import { Utils } from './utils.js'

export let ActionHandler = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    /**
     * Extends Token Action HUD Core's ActionHandler class and builds system-defined actions for the HUD
     */
    ActionHandler = class ActionHandler extends coreModule.api.ActionHandler {
        // Initialize actor and token variables
        actors = null
        actorId = null
        actorType = null
        tokenId = null

        // Initialize items variable
        items = null

        // Initialize groupIds variables
        groupIds = null
        activationGroupIds = null
        effectGroupIds = null
        inventoryGroupIds = null
        spellGroupIds = null

        // Initialize action variables
        featureActions = null
        inventoryActions = null
        spellActions = null

        /**
         * Build system actions
         * Called by Token Action HUD Core
         * @override
         * @param {array} groupIds
         */a
        async buildSystemActions(groupIds) {
            // Set actor and token variables
            this.actors = (!this.actor) ? this._getActors() : [this.actor]
            this.actorType = this.actor?.type

            // Exit if actor is not a known type
            const knownActors = ['Player', 'NPC', 'Light']
            if (this.actorType && !knownActors.includes(this.actorType)) return

            // Settings
            this.displayUnequipped = Utils.getSetting('displayUnequipped')

            // Set items variable
            if (this.actor) {
                let items = Array.from(this.actor.items)
                items = coreModule.api.Utils.sortItemsByName(items)
                this.items = items
            }

            // Set settings variables
            this.abbreviateSkills = Utils.getSetting('abbreviateSkills')
            this.addAuxiliaryActions = Utils.getSetting('addAuxiliaryActions')
            this.addDamageAndCritical = Utils.getSetting('addDamageAndCritical')
            this.addStowedItems = Utils.getSetting('addStowedItems')
            this.addUnequippedItems = Utils.getSetting('addUnequippedItems')
            this.calculateAttackPenalty = Utils.getSetting('calculateAttackPenalty')
            this.colorSkills = Utils.getSetting('colorSkills')
            this.showStrikeImages = Utils.getSetting('showStrikeImages')
            this.showStrikeNames = Utils.getSetting('showStrikeNames')
            this.splitStrikes = Utils.getSetting('splitStrikes')

            // Set group variables
            this.groupIds = groupIds

            if (this.actorType === 'Player') {
                this.#buildCharacterActions()
            }
            // else if (this.actorType === 'NPC') {
            //     this.#buildNpcActions()
            // } else if (this.actorType === 'Light') {
            //     this.#buildLightActions()
            // } else if (!this.actor) {
            //     this.#buildMultipleTokenActions()
            // }
        }

        /**
         * Build character actions
         * @private
         */
        async #buildCharacterActions() {
            if (!this.actor.backgroundItems?.class) {
                this.actor._populateBackgroundItems()
            }
            await Promise.all([
                // this.#buildCombat(),
                // this.#buildConditions(),
                // this.#buildEffects(),
                // this.#buildElementalBlasts(),
                // this.#buildFeats(),
                // this.#buildHeroActions(),
                // this.#buildHeroPoints(),
                // this.#buildInitiative(),
                // this.#buildInventory(),
                // this.#buildPerceptionCheck(),
                // this.#buildRecoveryCheck(),
                // this.#buildRests(),
                // this.#buildSaves(),
                // this.#buildSkillActions(),
                this.#buildAbilities(),
                this.#buildSpells(),
                this.#buildStrikes(),
                // this.#buildToggles()
            ])
        }

        /**
         * Build strikes
         */
        async #buildStrikes() {
            // Get strikes
            const attacks = this.actor.itemTypes.Weapon;
            // Exit if no strikes exist
            if (!attacks) return

            const meleeAttacks = attacks.filter((attack) => attack.system.type === 'melee')
            const rangedAttacks = attacks.filter((attack) => attack.system.type === 'ranged'
                || attack.system.properties.some(p => p === COMPENDIUM_ID.thrown))

            // Create group data
            const parentGroupData = {
                id: 'attacks',
                type: 'system'
            }
            const meleeGroupData = {
                id: 'melee',
                name: 'Melee',
                type: 'system-derived'
            }
            const rangedGroupData = {
                id: 'ranged',
                name: 'Ranged',
                type: 'system-derived'
            }
            this.addGroup(meleeGroupData, parentGroupData)
            this.addGroup(rangedGroupData, parentGroupData)

            this.#addAttacks(meleeAttacks, meleeGroupData)
            this.#addAttacks(rangedAttacks, rangedGroupData)
        }
        /**
                 * Build abilities
                 */
        async #buildAbilities() {
            const actionType = 'ability'
            const groupId = 'abilities'
            const abilities = Object.keys(this.actor.system.abilities)

            const groupData = { id: groupId, name: 'Abilities', type: 'system' }

            const actions = await Promise.all(
                abilities.map(async (ability) => {
                    const id = ability
                    const name = coreModule.api.Utils.i18n(ABILITY[ability].name)
                    const encodedValue = [actionType, id].join(this.delimiter)

                    return {
                        id,
                        name,
                        encodedValue
                    }
                })
            )
            this.addActions(actions, groupData)
        }

        async #buildSpells() {
            // Get strikes
            const spells = this.actor.itemTypes.Spell;
            // Exit if no strikes exist
            if (!spells) return

            const meleespells = Array.from(spells.filter((spell) => spell.system.tier === 1 && !spell.system.lost))
            const rangedspells = Array.from(spells.filter((spell) => spell.system.tier === 2 && !spell.system.lost))

            // Create group data
            const parentGroupData = {
                id: 'spells',
                type: 'system'
            }
            const meleeGroupData = {
                id: 'tier1',
                name: 'Tier 1',
                type: 'system-derived'
            }
            const rangedGroupData = {
                id: 'tier2',
                name: 'Tier 2',
                type: 'system-derived'
            }
            await this.addGroup(meleeGroupData, parentGroupData)
            await this.addGroup(rangedGroupData, parentGroupData)

            await this.#addSpells(meleespells, meleeGroupData)
            await this.#addSpells(rangedspells, rangedGroupData)
        }
        /**
         * Get tooltip data
         * @param {string} actionType The action type
         * @param {object} entity     The entity
         * @returns {object}          The tooltip data
         */
        async #getTooltipData(actionType, entity) {
                return ''
            }

        /**
         * Get tooltip
         * @private
         * @param {string} actionType  The action type
         * @param {object} tooltipData The tooltip data
         * @returns {string}           The tooltip
         */
        async #getTooltip(actionType, tooltipData) {
                return ''
            }

        async #addAttacks(attacks, groupData) {
                for (const attack of attacks) {
                    const actionData = {
                        id: attack.id,
                        name: attack.name,
                        encodedValue: ['attack', attack.id].join(this.delimiter)
                    }
                    this.addActions([actionData], groupData)
                }
            }
        async #addSpells(spells, groupData) {
            for (const spell of spells) {
                const actionData = {
                    id: spell.id,
                    name: spell.name,
                    encodedValue: ['spell', spell.id].join(this.delimiter)
                }
                this.addActions([actionData], groupData)
            }
        }
        async #getActionName(entity) {
                return entity?.name ?? entity?.label ?? ''
            }
        async #buildNpcActions() { }
        async #buildLightActions() { }
        async #buildMultipleTokenActions() { }
        }
    })