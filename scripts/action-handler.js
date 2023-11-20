// System Module Imports
import { ABILITY, GROUP, ICON } from './constants.js'
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
            this.actors = (!this.actor) ? this.#getActors() : [this.actor]
            this.actorType = this.actor?.type

            // Exit if actor is not a known type
            const knownActors = ['Player', 'NPC', 'Light']
            if (this.actorType && !knownActors.includes(this.actorType)) return

            // Settings
            this.displayUnequipped = Utils.getSetting('displayUnequipped')

            // Set items variable
            if (this.actor) {
                let items = Array.from(this.actor?.items)
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

            this.showAttackBonus = Utils.getSetting('showAttackBonus')
            this.showAbilityBonus = Utils.getSetting('showAbilityBonus')
            this.wandScrollIcon = Utils.getSetting('wandScrollIcon')
            this.hideLantern = Utils.getSetting('hideLantern')
            this.showAttackRanges = Utils.getSetting('showAttackRanges')
            this.showSpellRanges = Utils.getSetting('showSpellRanges')

            // Set group variables
            this.groupIds = groupIds

            if (this.actorType === 'Player') {
                await this.#buildCharacterActions()
            } else if (this.actorType === 'NPC') {
                await this.#buildNpcActions()
                // } else if (this.actorType === 'Light') {
                //     this.#buildLightActions()
            } else if (!this.actor) {
                this.#buildGroupActions()
            }
        }
        /**
         * Build character actions
         * @private
         */
        async #buildCharacterActions() {
            await Promise.all([
                this.#buildAbilities(),
                this.#buildSpells(),
                this.#buildPerform(),
                this.#buildHerbalism(),
                this.#buildAttacks(),
                this.#buildInventory(),
                this.#buildLight()
            ])
        }

        /**
         * Build NPC actions
         * @private
         */
        async #buildNpcActions() {
            if (!this.actor?.backgroundItems?.class) {
                this.actor?._populateBackgroundItems()
            }
            await Promise.all([
                this.#buildNPCAttacks(),
                this.#buildNPCFeatures(),
                this.#buildAbilities()                
            ])
        }

        /**
         * Build group actions
         * @private
         */
        async #buildGroupActions() {
            await Promise.all([
                this.#buildAbilities()
            ])
        }

        #getActors () {
            const allowedTypes = ['Player', 'NPC']
            const actors = canvas.tokens.controlled.map(token => token.actor)
            if (actors.every(actor => allowedTypes.includes(actor?.type))) { return actors }
        }

        /**
         * Build attacks
         */
        async #buildAttacks() {
            // Get attacks
            const attacks = this.actor?.itemTypes.Weapon.filter((attack) => !attack.system.stashed)
            // Exit if no attacks exist
            if (!attacks || attacks?.length === 0) return

            const actionType = 'attack'

            const meleeAttackActions = []
            const rangedAttackActions = []

            const weaponOptions = {}

            if (this.showAttackBonus) {
                // Sort attacks by type
                for (const attack of attacks) {
                    const weaponMasterBonus = this.actor?.calcWeaponMasterBonus(attack)
                    const baseAttackBonus = await attack.isFinesseWeapon()
                        ? Math.max(this.actor?.attackBonus('melee'), this.actor?.attackBonus('ranged'))
                        : this.actor?.attackBonus(attack.system.type);

                    if (attack.system.type === 'melee') {
                        const meleeAttackBonus = baseAttackBonus
                            + this.actor?.system.bonuses.meleeAttackBonus
                            + attack.system.bonuses.attackBonus
                            + weaponMasterBonus
                        meleeAttackActions.push(new Action(attack, actionType, {
                            name: attack.name + this.#getBonusString(meleeAttackBonus),
                            range: (this.showAttackRanges) ? 'close' : undefined
                        })
                        )

                        // Duplicate melee weapons that can be thrown, adding a 'thrown' icon to them.
                        if (await attack.hasProperty('thrown')) {
                            const thrownAttackBonus = baseAttackBonus
                                + parseInt(this.actor?.system.bonuses.rangedAttackBonus, 10)
                                + parseInt(attack.system.bonuses.attackBonus, 10)
                                + weaponMasterBonus

                            rangedAttackActions.push(new Action(attack, actionType, {
                                icon2: ICON.thrown,
                                name: attack.name + this.#getBonusString(thrownAttackBonus),
                                range: (this.showAttackRanges) ? attack.system.range : undefined
                            })
                            )
                            continue
                        }
                    } else if (attack.system.type === 'ranged') {
                        const rangedAttackBonus = baseAttackBonus
                            + this.actor?.system.bonuses.rangedAttackBonus
                            + attack.system.bonuses.attackBonus
                            + weaponMasterBonus

                        rangedAttackActions.push(new Action(attack, actionType, {
                            name: attack.name + this.#getBonusString(rangedAttackBonus),
                            range: (this.showAttackRanges) ? attack.system.range : undefined
                        })
                        )
                    }
                }
            } else {
                // Sort attacks by type
                for (const attack of attacks) {
                    if (attack.system.type === 'melee') {
                        meleeAttackActions.push(new Action(attack, actionType, { range: (this.showAttackRanges) ? attack.system.range : undefined }))
                        // Duplicate melee weapons that can be thrown, adding a 'thrown' icon to them.
                        if (await attack.hasProperty('thrown')) {
                            rangedAttackActions.push(new Action(attack, actionType, { icon2: ICON.thrown }))
                            continue
                        }
                    } else if (attack.system.type === 'ranged') {
                        rangedAttackActions.push(new Action(attack, actionType, { range: (this.showAttackRanges) ? attack.system.range : undefined }))
                    }
                }
            }

            if (meleeAttackActions.length > 0) {
                const meleeGroupData = {
                    id: 'melee',
                    name: 'Melee',
                    type: 'system-derived'
                }
                this.addGroup(meleeGroupData, GROUP.attacks)
                this.addActions(meleeAttackActions, meleeGroupData)
            }
            if (rangedAttackActions.length > 0) {
                const rangedGroupData = {
                    id: 'ranged',
                    name: 'Ranged',
                    type: 'system-derived'
                }
                this.addGroup(rangedGroupData, GROUP.attacks)
                this.addActions(rangedAttackActions, rangedGroupData)
            }
        }
        /**
         * Build abilities
         */
        async #buildAbilities() {
            const actionType = 'ability'
            const abilities = ['str', 'dex', 'con', 'int', 'wis', 'cha']

            const abilityActions = await Promise.all(
                abilities.map(async (ability) => {
                    const id = ability
                    const name = coreModule.api.Utils.i18n(ABILITY[ability].name) + ((this.showAbilityBonus && this.actor) ? this.#getBonusString(this.actor?.system.abilities[ability].mod) : '')
                    const encodedValue = [actionType, id].join(this.delimiter)

                    return {
                        id,
                        name,
                        encodedValue
                    }
                })
            )
            this.addActions(abilityActions, GROUP.abilities)
        }

        async #buildSpells() {
            const actionType = 'spell'

            const spells = this.actor?.itemTypes.Spell

            // Exit if no spells exist
            if (spells.length > 0) {

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
                    const spellActions = activeSpells.map(spell => {
                        return new Action(spell, actionType, { range: (this.showSpellRanges) ? spell.system.range : undefined })
                    })
                    this.addGroup(tierGroupData, GROUP.spells)
                    this.addActions(spellActions, tierGroupData)
                }
            }


            const wands = this.actor?.itemTypes.Wand
            const usableWands = wands.filter(wand => wand.system.class.includes(this.actor?.system.class) && !wand.system.lost && !wand.system.stashed)
            if (usableWands.length > 0) {
                const wandGroupData = {
                    id: `spells_wands`,
                    name: `Wands`,
                    type: `system-derived`
                }

                const wandActions = usableWands.map(wand => {
                    return new Action(wand, actionType, {
                        name: wand.system.spellName,
                        icon2: this.wandScrollIcon ? ICON.wand : undefined,
                        range: this.showSpellRanges ? wand.system.range : undefined
                    })
                })
                this.addGroup(wandGroupData, GROUP.spells)
                this.addActions(wandActions, wandGroupData)
            }

            const scrolls = this.actor?.itemTypes.Scroll
            const usableScrolls = scrolls.filter(scroll => scroll.system.class.includes(this.actor?.system.class) && !scroll.system.stashed)
            if (usableScrolls.length > 0) {
                const scrollGroupData = {
                    id: `spells_scrolls`,
                    name: `Scrolls`,
                    type: `system-derived`
                }

                const scrollActions = usableScrolls.map(scroll => {
                    return new Action(scroll, actionType, {
                        name: scroll.system.spellName,
                        icon2: this.wandScrollIcon ? ICON.scroll : undefined,
                        range: this.showSpellRanges ? scroll.system.range : undefined
                    })
                })

                this.addGroup(scrollGroupData, GROUP.spells)
                this.addActions(scrollActions, scrollGroupData)
            }
        }

        async #buildPerform() {
            if (this.actor.itemTypes.Talent.find((t) => t.name === 'Perform')) {
                // Get attacks
                const perform = this.actor?.itemTypes['Class Ability']
                // Exit if no performs exist
                if (!perform || perform?.length === 0) return

                const actionType = 'classAbility'

                const performActions = [...perform.filter((a) => !a.system.lost)].map((p, index) => {
                    return new Action(p, actionType)
                })
                this.addActions(performActions, GROUP.perform)
            }
        }

        async #buildHerbalism() {
            if (this.actor.itemTypes.Talent.find((t) => t.name === 'Herbalism')) {
                // Get attacks
                const herbalism = this.actor?.itemTypes['Class Ability']
                console.log(herbalism)
                // Exit if no remedies exist
                if (!herbalism || herbalism?.length === 0) return

                const actionType = 'classAbility'

                const herbalismActions = [...herbalism.filter((a) => !a.system.lost)].map((h) => {
                    return new Action(h, actionType)
                })
                console.log(herbalismActions)

                this.addActions(herbalismActions, GROUP.herbalism)
            }
        }

        async #buildInventory() {
            const actionType = 'item'

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

            const treasure = [];

            for (const itemType of itemTypes) {
                const itemArray = this.actor?.itemTypes[itemType].filter(item => !item.system.stashed)
                if (!itemArray || itemArray?.length === 0) continue

                const items = []
                for (const item of itemArray) {
                    item.system.treasure ? treasure.push(item) : items.push(item)
                }
                const itemTypeGroupData = {
                    id: `inventory_${itemType.slugify()}`,
                    name: itemType,
                    type: 'system-derived'
                }
                if (items.length > 0) {
                    this.addGroup(itemTypeGroupData, GROUP.inventory)
                    const itemActions = items.map(item => {
                        return new Action(item, actionType)
                    })
                    this.addActions(itemActions, itemTypeGroupData)
                }
            }


            for (const itemType of treasureTypes) {
                for (const item of this.actor?.itemTypes[itemType]) {
                    treasure.push(item)
                }
            }
            if (!treasure || treasure?.length === 0) return
            const itemTypeGroupData = {
                id: `inventory_treasure`,
                name: treasureGroupName,
                type: 'system-derived'
            }
            const treasureActions = treasure.map(treasure => {
                return new Action(treasure, actionType)
            })
            this.addGroup(itemTypeGroupData, GROUP.inventory)
            this.addActions(treasureActions, itemTypeGroupData)
        }

        async #buildLight() {
            const actionType = 'light'

            const lights = [];

            for (const light of this.actor?.itemTypes.Basic.filter(item => item.system.light.isSource)) {
                if (!light.system.light.remainingSecs) continue
                if (this.hideLantern) {
                    if (light.name === 'Oil, Flask') {
                        if (this.actor?.itemTypes.Basic.some(item => item.name === 'Lantern')) {
                            lights.push(light)
                        }
                    } else lights.push(light)
                } else lights.push(light)
            }

            const lightActions = await Promise.all(
                lights.map(async (light) => {
                    return (light.system.light.active ? new Action(light, actionType, { icon2: ICON.flame }) : new Action(light, actionType))
                })
            )
            this.addActions(lightActions, GROUP.light)
        }

        async #buildNPCAttacks() {
            // Get attacks
            const attacks = this.actor?.itemTypes['NPC Attack']
            // Exit if no attacks exist
            if (!attacks || attacks?.length === 0) return

            const actionType = 'attack'

            const meleeAttackActions = []
            const rangedAttackActions = []

            // Sort attacks by type
            for (const attack of attacks) {
                const ranges = attack.system.ranges
                if (ranges.includes('close')) {
                    meleeAttackActions.push(new Action(attack, actionType, {
                        name: _toTitleCase(attack.name) + `${this.showAttackBonus ? this.#getBonusString(attack.system.bonuses.attackBonus) : ''}`,
                        range: this.showAttackRanges ? 'close' : undefined
                    }))

                    // Duplicate melee weapons that can be thrown, adding a 'thrown' icon to them.
                    if (ranges.includes('near') || ranges.includes('far')) {
                        const maxRange = ranges.includes('far') ? 'far' : 'near'
                        rangedAttackActions.push(new Action(attack, actionType, {
                            icon2: ICON.thrown,
                            name: _toTitleCase(attack.name) + `${this.showAttackBonus ? this.#getBonusString(attack.system.bonuses.attackBonus) : ''}`,
                            range: this.showAttackRanges ? maxRange : undefined
                        }))
                        continue
                    }
                } else if (ranges.includes('near') || ranges.includes('far')) {
                    const maxRange = ranges.includes('far') ? 'far' : 'near'
                    rangedAttackActions.push(new Action(attack, actionType, {
                        name: _toTitleCase(attack.name) + `${this.showAttackBonus ? this.#getBonusString(attack.system.bonuses.attackBonus) : ''}`,
                        range: this.showAttackRanges ? maxRange : undefined
                    }))
                }
            }


            if (meleeAttackActions.length > 0) {
                const meleeGroupData = {
                    id: 'melee',
                    name: 'Melee',
                    type: 'system-derived'
                }
                this.addGroup(meleeGroupData, GROUP.attacks)
                this.addActions(meleeAttackActions, meleeGroupData)
            }
            if (rangedAttackActions.length > 0) {
                const rangedGroupData = {
                    id: 'ranged',
                    name: 'Ranged',
                    type: 'system-derived'
                }
                this.addGroup(rangedGroupData, GROUP.attacks)
                this.addActions(rangedAttackActions, rangedGroupData)
            }
        }

        async #buildNPCFeatures() {
            const features = this.actor?.itemTypes['NPC Feature']
            // Exit if no features exist
            if (!features || features?.length === 0) return

            const actionType = 'feature'

            const featureActions = await Promise.all(
                features.map(async (feature) => {
                    return (new Action(feature, actionType))
                })
            )
            this.addActions(featureActions, GROUP.features)
        }

        #getBonusString(bonus) {
            return ` (${bonus >= 0 ? '+' : ''}${bonus})`
        }

        // async #buildMultipleTokenActions() { }
    }

    // convert a string to titlecase (useful for monsters from monster importer)
    function _toTitleCase(str) {
        return str.replace(
          /\w\S*/g,
          function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
          }
        );
      }

    class Action {
        constructor(item, actionType, options) {
            this.id = item.id
            this.name = (options?.name || item.name)
            this.encodedValue = [actionType, item.id].join('|')
            this.img = coreModule.api.Utils.getImage(item)
            this.icon1 = ICON[options?.range],
                this.icon2 = options?.icon2
        }
    }
})