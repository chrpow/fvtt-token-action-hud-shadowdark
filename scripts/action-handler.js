// System Module Imports
import { ACTION_TYPE, ITEM_TYPE } from './constants.js'
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
            } else if (this.actorType === 'NPC') {
                this.#buildNpcActions()
            } else if (this.actorType === 'Light') {
                this.#buildLightActions()
            } else if (!this.actor) {
                this.#buildMultipleTokenActions()
            }
        }

        /**
         * Build character actions
         * @private
         */
        async #buildCharacterActions() {
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
            const actionType = 'Weapon'

            // Create parent group data
            const parentGroupData = { id: 'weapon', type: 'system' }

            // Get strikes
            const strikes = this.actor.items
                .filter(action => action.type === actionType)
            // Exit if no strikes exist
            if (!strikes) return

            for (const strike of strikes) {
                let auxiliaryActions = []
                let versatileOptionActions = []
                let strikeGroupData = null
                const usageData = []

                const strikeId = `${strike.id}-${strike.name}`
                const strikeGroupId = `strikes+${strikeId}`
                const strikeGroupName = strike.name
                const strikeGroupListName = `${coreModule.api.Utils.i18n(ACTION_TYPE[actionType])}: ${strike.name} (${strike.id})`
                const image = strike.img
                const showTitle = this.showStrikeNames
                // const tooltipData = await this.#getTooltipData(actionType, strike)
                // const tooltip = await this.#getTooltip(actionType, tooltipData)
                // Create group data
                strikeGroupData = { id: strikeGroupId, name: strikeGroupName, listName: strikeGroupListName, type: 'system-derived', settings: { showTitle }, tooltip }
                if (this.showStrikeImages) { strikeGroupData.settings.image = image }

                // Add group to action list
                this.addGroup(strikeGroupData, parentGroupData)
            }
        }
        async #buildNpcActions() { }
        async #buildLightActions() { }
        async #buildMultipleTokenActions() { }
    }
})