// System Module Imports
import { ACTION_TYPE, ITEM_TYPE, COMPENDIUM_ID, ABILITY, GROUP, ICON } from './constants.js'
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
            this.showAttackImages = Utils.getSetting('showAttackImages')
            this.showAttackNames = Utils.getSetting('showAttackNames')
            this.splitAttacks = Utils.getSetting('splitAttacks')

            // Set group variables
            this.groupIds = groupIds

            if (this.actorType === 'Player') {
                this.#buildCharacterActions()
            } else if (this.actorType === 'NPC') {
                this.#buildNpcActions()
                // } else if (this.actorType === 'Light') {
                //     this.#buildLightActions()
                // } else if (!this.actor) {
                //     this.#buildMultipleTokenActions()
                // }
            }
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

                // this.#buildPerceptionCheck(),
                // this.#buildRecoveryCheck(),
                // this.#buildRests(),
                // this.#buildSaves(),
                // this.#buildSkillActions(),
                this.#buildAbilities(),
                this.#buildSpells(),
                this.#buildAttacks(),
                this.#buildInventory(),
                // this.#buildToggles()
            ])
        }

        /**
         * Build attacks
         */
        async #buildAttacks() {
            const actionType = 'attack'
            // Get attacks
            const attacks = this.actor.itemTypes.Weapon.filter((attack) => !attack.system.stashed)
            // Exit if no attacks exist
            if (!attacks) return

            const meleeAttacks = attacks.filter((attack) => attack.system.type === 'melee')
            const rangedAttacks = attacks.filter((attack) => (attack.system.type === 'ranged'))
            const thrownAttacks = attacks.filter((attack) => (attack.system.properties.some(p => p === COMPENDIUM_ID.thrown)))

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

            this.#addActions(meleeAttacks, meleeGroupData, actionType)
            this.#addActions(rangedAttacks, rangedGroupData, actionType)
            this.#addActions(thrownAttacks, rangedGroupData, actionType, {icon: ICON.thrown})
        }
        /**
                 * Build abilities
                 */
        async #buildAbilities() {
            const actionType = 'ability'
            const groupId = 'abilities'
            const abilities = ['str', 'dex', 'con', 'int', 'wis', 'cha']
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
            this.#addActions(actions, groupData, actionType)
        }

        async #buildSpells() {
            const actionType = 'spell'
            const groupId = 'spells'
            const groupName = 'Spells'//coreModule.api.Utils.i18n(GROUP[groupId].name)

            const parentGroupData = {
                id: groupId,
                name: groupName,
                type: 'system'
            }

            const spells = this.actor.itemTypes.Spell
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

                const activeSpells = spells.filter(spell => spell.system.tier === tier && !spell.system.lost)

                this.addGroup(tierGroupData, parentGroupData, { update: true })
                this.#addActions(activeSpells, tierGroupData, actionType)
            }

            const wands = this.actor.itemTypes.Wand
            const usableWands = wands.filter(wand => wand.system.class.includes(this.actor.system.class) && !wand.system.lost && !wand.system.stashed)
            if (usableWands.length > 0) {
                const wandGroupData = {
                    id: `spells_wands`,
                    name: `Wands`,
                    type: `system-derived`
                }
                this.addGroup(wandGroupData, parentGroupData)
                this.#addActions(usableWands, wandGroupData, actionType)
            }

            const scrolls = this.actor.itemTypes.Scroll
            const usableScrolls = scrolls.filter(scroll => scroll.system.class.includes(this.actor.system.class) && !scroll.system.stashed)
            if (usableScrolls.length > 0) {
                const scrollGroupData = {
                    id: `spells_scrolls`,
                    name: `Scrolls`,
                    type: `system-derived`
                }

                this.addGroup(scrollGroupData, parentGroupData)
                this.#addActions(usableScrolls, scrollGroupData, actionType)
            }
        }

        async #buildInventory() {
            const actionType = 'item'
            const groupId = 'inventory'
            const groupName = 'Inventory'

            // The types of items shown in the inventory menu
            const itemTypes = [
                'Armor',
                'Basic',
                'Potion',
                'Scroll',
                'Wand',
                'Weapon'
            ]

            const treasureGroupName = 'Gems and Treasure'
            const treasureTypes = [
                'Gem'
            ]

            const parentGroupData = {
                id: groupId,
                name: groupName,
                type: 'system'
            }

            const treasure = [];

            for (const itemType of itemTypes) {

                const itemArray = this.actor.itemTypes[itemType].filter(item => !item.system.stashed)
                if (itemArray.length > 0) {
                    const items = []
                    for (const item of itemArray) {
                        item.system.treasure ? treasure.push(item) : items.push(item)
                    }
                    const itemTypeGroupData = {
                        id: `inventory_${itemType.slugify()}`,
                        name: itemType,
                        type: 'system-derived'
                    }
                    if (items.length > 1) {
                        this.addGroup(itemTypeGroupData, parentGroupData)
                        this.#addActions(items, itemTypeGroupData, actionType)
                    }
                }
            }


            for (const itemType of treasureTypes) {
                for (const item of this.actor.itemTypes[itemType]) {
                    treasure.push(item)
                }
                const itemTypeGroupData = {
                    id: `inventory_treasure`,
                    name: treasureGroupName,
                    type: 'system-derived'
                }
                if (treasure.length > 0) {
                    this.addGroup(itemTypeGroupData, parentGroupData)
                    this.#addActions(treasure, itemTypeGroupData, actionType)
                }
            }
        }

        async #addActions(actions, groupData, actionType, options) {
            for (const action of actions) {
                const actionData = {
                    id: action.id,
                    name: action.name,
                    encodedValue: [actionType, action.id].join(this.delimiter),
                    img: coreModule.api.Utils.getImage(action),
                    icon1: options?.icon
                }
                this.addActions([actionData], groupData)
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
        async #getActionName(entity) {
            return entity?.name ?? entity?.label ?? ''
        }
        async #buildNpcActions() { }
        async #buildLightActions() { }
        async #buildMultipleTokenActions() { }
    }
})