// System Module Imports
import { ACTION_TYPE, ITEM_TYPE, COMPENDIUM_ID, ABILITY, GROUP} from './constants.js'
import { Utils } from './utils.js'

export let ActionHandler = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    /**
     * Extends Token Action HUD Core's ActionHandler class and builds system-defined actions for the HUD
     */
    console.log("Hello!")
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
            console.log('~~~~~~building system actions...')
            // Set actor and token variables
            this.actors = (!this.actor) ? this._getActors() : [this.actor]
            this.actorType = this.actor?.type
            console.log(`actor: ${this.actor.name}`)

            // Exit if actor is not a known type
            const knownActors = ['Player', 'NPC', 'Light']
            console.log(`actorType = ${this.actorType}`)
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
            console.log('building player actions')
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
            console.log('building strikes')
            // Get strikes
            const attacks = this.actor.itemTypes.Weapon;
            // Exit if no strikes exist
            if (!attacks) return

            const meleeAttacks = attacks.filter((attack) => attack.system.type === 'melee')
            const rangedAttacks = attacks.filter((attack) => attack.system.type === 'ranged'
                || attack.system.properties.some(p => p === COMPENDIUM_ID.thrown))

            console.log('melee:')
            console.log(meleeAttacks)
            console.log('ranged:')
            console.log(rangedAttacks)

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
            console.log('building abilities')
            const actionType = 'ability'
            const groupId = 'abilities'
            const abilities = Object.keys(this.actor.system.abilities)

            const groupData = { id: groupId, name: 'Abilities', type: 'system' }

            const actions = await Promise.all(
                abilities.map(async (ability) => {
                    const id = ability
                    // const label = coreModule.api.Utils.i18n(ABILITY[ability].name)
                    const name = coreModule.api.Utils.i18n(ABILITY[ability].name)
                    // const fullName = label
                    // const actionTypeName = `${coreModule.api.Utils.i18n(ACTION_TYPE[actionType])}: ` ?? ''
                    // const listName = `${actionTypeName}${name}`
                    const encodedValue = [actionType, id].join(this.delimiter)

                    return {
                        id,
                        name,
                        encodedValue
                    }
                })
            )
            console.log(actions)
            this.addActions(actions, groupData)
        }

        async #buildSpells() {
            console.log('building spells')
            const actionType = 'spell'
            const groupId = 'spells'
            const groupName = 'Spells'//coreModule.api.Utils.i18n(GROUP[groupId].name)

            const spells = this.actor.itemTypes.Spell

            const spellGroupData = {
                id: groupId,
                name: groupName,
                type: 'system'
            }

            const activeTiers = []
            for (const spell of spells) {
                if (!activeTiers.includes(spell.system.tier)) {
                    activeTiers.push(spell.system.tier)
                }
            }

            for (const tier of activeTiers) {
                const tierGroupId = `tier${tier}`
                const tierGroupName = `Tier ${tier}`

                const tierGroupData = {
                    id: tierGroupId,
                    name: tierGroupName,
                    type: 'system-derived'
                }

                await this.addGroup(tierGroupData, spellGroupData)

                //get available spells of this tier
                const activeSpells = spells.filter(spell => spell.system.tier === tier && !spell.system.lost)
                console.log(`active spells of tier ${tier}:`)
                console.log(activeSpells)
            }
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
                        id: encodeURIComponent(`${attack.id}>${attack.name.slugify()}>0>` + attack.system.type),
                        name: attack.name,
                        encodedValue: ['attack', attack.id].join(this.delimiter)
                    }
                    console.log(`encodedValue: ${actionData.encodedValue}`)
                    console.log(actionData)
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