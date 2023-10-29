// System Module Imports
import { ACTION_TYPE, ITEM_TYPE } from './constants.js'
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
                // this.#buildSkills(),
                // this.#buildSpells(),
                this.#buildStrikes(),
                // this.#buildToggles()
            ])
        }

        /**
         * Build strikes
         */
        async #buildStrikes() {
            console.log('building strikes')
            const actionType = 'attack'

            // Create parent group data
            const parentGroupData = { id: 'attacks', type: 'system' }

            // Get strikes
            const attacks = this.actor.itemTypes.Weapon;
            // Exit if no strikes exist
            if (!attacks) return
            console.log('attacks:')
            console.log(attacks)
            const groupData = []

            for (const attack of attacks) {
                let strikeGroupData = null

                const strikeId = `${attack.id}-${attack.name.slugify()}`
                console.log(strikeId)
                const strikeGroupId = strikeId
                console.log(strikeGroupId)
                const strikeGroupName = attack.name
                console.log(strikeGroupName)
                const strikeGroupListName = `${coreModule.api.Utils.i18n(ACTION_TYPE[actionType])}: ${attack.name} (${attack.id})`
                console.log(strikeGroupListName)
                // const image = attack.img
                const showTitle = this.showStrikeNames
                const tooltipData = await this.#getTooltipData(actionType, attack)
                const tooltip = await this.#getTooltip(actionType, tooltipData)
                // Create group data
                strikeGroupData = {
                    id: strikeGroupId,
                    name: strikeGroupName,
                    listName: strikeGroupListName,
                    type: 'system-derived',
                    settings: { showTitle },
                    tooltip }
                // if (this.showStrikeImages) { strikeGroupData.settings.image = image }
                console.log('strikeGroupData')
                console.log(strikeGroupData)
                // Add group to action list
                this.addGroup(strikeGroupData, parentGroupData)

                // Get actions
                const id = encodeURIComponent(`${attack.id}>${attack.name.slugify()}>0>` + attack.system.type)
                const name = attack.name
                const actionData = {
                    id: id,
                    name: name,
                    encodedValue: 'placeholder'
                }
                console.log('adding action:')
                console.log(actionData)
                
                this.addActions([actionData], strikeGroupData)
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

        #getActionName(entity) {
            return entity?.name ?? entity?.label ?? ''
        }
        async #buildNpcActions() { }
        async #buildLightActions() { }
        async #buildMultipleTokenActions() { }
    }
})