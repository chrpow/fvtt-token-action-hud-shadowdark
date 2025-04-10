/* eslint-disable no-undef */
import { Utils } from './utils.js'
export let RollHandler = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    /**
     * Extends Token Action HUD Core's RollHandler class and handles action events triggered when an action is clicked
     */
    RollHandler = class RollHandler extends coreModule.api.RollHandler {
        /**
         * Handle action event
         * Called by Token Action HUD Core when an action event is triggered
         * @override
         * @param {object} event        The event
         */
        async handleActionClick (event) {
            const actionType = this.action.system.actionType
			const actionId = this.action.system.actionId
			const handedness = this.action.system?.handedness
            // const renderable = ['attack', 'ability']

            // if (renderable.includes(actionTypeId) && this.isRenderItem()) {
            //     return this.doRenderItem(this.actor, actionId)
            // }

            const knownCharacters = ['Player', 'NPC']

            // If single actor is selected
            if (this.actor) {
				const options = {handedness}
                await this.#handleAction(event, this.actor, this.token, actionType, actionId, options)
                return
            }

            const controlledTokens = canvas.tokens.controlled
                .filter((token) => knownCharacters.includes(token.actor?.type))

            // If multiple actors are selected
            for (const token of controlledTokens) {
                const actor = token.actor
				const options = {handedness}
                await this.#handleAction(event, actor, token, actionType, actionId, options)
            }
        }

        /**
         * Handle action
         * @private
         * @param {object} event        The event
         * @param {object} actor        The actor
         * @param {object} token        The token
         * @param {string} actionType The action type id
         * @param {string} actionId     The actionId
         */
        async #handleAction (event, actor, token, actionType, actionId, options) {
            switch (actionType) {
            case 'attack':
                await this.#handleAttackAction(actor, actionId, options)
                break
            case 'npcAttack':
                await this.#handleNPCAttackAction(actor, actionId)
                break
            case 'specialAttack':
                await this.#handleSpecialAttackAction(actor, actionId)
                break
            case 'ability':
                await this.#handleAbilityAction(event, actor, actionId)
                break
            case 'spell':
                await this.#handleSpellAction(actor, actionId)
                break
            case 'npcSpell':
                await this.#handleNPCSpell(actor, actionId)
                break
            case 'item':
                await this.#handleItemAction(actor, actionId)
                break
            case 'light':
                await this.#handleLightAction(actor, actionId)
                break
            case 'feature':
                await this.#handleNPCFeature(actor, actionId)
                break
            case 'classAbility':
                await this.#handleClassAbility(actor, actionId)
                break
            }
        }

        /**
        * Handle attack action
        * @private
        * @param {object} event    The event
        * @param {object} actor    The actor
        * @param {string} actionId The action id
		* @param {string} handedness Weapon handedness
        */
        async #handleAttackAction (actor, actionId, options) {
			const handedness = options?.handedness
			console.log(handedness)
			const o = {handedness}
            await actor.rollAttack(actionId, o)
        }

        async #handleNPCAttackAction (actor, actionId) {
            await actor.rollAttack(actionId)
            const rollMode = Utils.getSetting('hideNPCFeatures') ? 'selfroll' : undefined
            const feature = actor.items.find((i) => i.type === 'NPC Feature' && i.name === actor.items.get(actionId).name)
            await feature?.displayCard({ rollMode })
        }

        /**
        * Handle special attack action
        * @private
        * @param {object} event    The event
        * @param {object} actor    The actor
        * @param {string} actionId The action id
        */
        async #handleSpecialAttackAction (actor, actionId) {
            await actor.useAbility(actionId)
            const rollMode = Utils.getSetting('hideNPCFeatures') ? 'selfroll' : undefined
            const feature = actor.items.find((i) => i.type === 'NPC Feature' && i.name === actor.items.get(actionId).name)
            await feature?.displayCard({ rollMode })
        }

        /**
         * Handle ability action
         * @private
         * @param {object} event    The event
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        async #handleAbilityAction (event, actor, actionId) {
            await actor.rollAbility(actionId, { event })
        }

        /**
         * Handle spell action
         * @private
         * @param {object} event    The event
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        async #handleSpellAction (actor, actionId) {
            await actor.castSpell(actionId)
        }

        /**
        * Handle NPC spell action
        * @private
        * @param {object} event    The event
        * @param {object} actor    The actor
        * @param {string} actionId The action id
        */
        async #handleNPCSpell (actor, actionId) {
            await actor.castNPCSpell(actionId)
        }

        /**
         * Handle NPC feature action
         * @private
         * @param {object} event    The event
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        async #handleNPCFeature (actor, actionId) {
            const feature = actor.items.get(actionId)
            const rollMode = Utils.getSetting('hideNPCFeatures') ? 'selfroll' : undefined
            await feature?.displayCard({ rollMode })
        }

        /**
         * Handle class ability
         * @private
         * @param {object} event    The event
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        async #handleClassAbility (actor, actionId) {
            await actor.useAbility(actionId)
        }

        /**
         * Handle item action
         * @private
         * @param {object} event    The event
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        async #handleItemAction (actor, actionId) {
            const item = actor.items.get(actionId)
            await item.displayCard()
        }

        /**
         * Handle light action
         * @private
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        async #handleLightAction (actor, actionId) {
            const light = actor.getEmbeddedDocument('Item', actionId)
            await light.parent.sheet._toggleLightSource(light)
        }
    }
})
