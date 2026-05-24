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
		async handleActionClick(event) {
			const system = this.action.system

			const knownCharacters = ['Player', 'NPC']

			// If single actor is selected
			if (this.actor) {
				await this.#handleAction(event, this.actor, system)
				return
			}

			const controlledTokens = canvas.tokens.controlled
				.filter((token) => knownCharacters.includes(token.actor?.type))

			// If multiple actors are selected
			for (const token of controlledTokens) {
				const actor = token.actor
				await this.#handleAction(event, actor, system)
			}
		}

		/**
		 * Handle action
		 * @private
		 * @param {object} event        The event
		 * @param {object} actor        The actor
		 * @param {object} token        The token
		 * @param {object} system       Data for the action
		 */
		async #handleAction(event, actor, system) {
			switch (system.actionType) {
				case 'attack':
					await this.#handleAttackAction(event, actor, system)
					break
				case 'npcAttack':
					await this.#handleNPCAttackAction(event, actor, system)
					break
				case 'specialAttack':
					await this.#handleSpecialAttackAction(actor, system)
					break
				case 'ability':
					await this.#handleAbilityAction(event, actor, system)
					break
				case 'spell':
					await this.#handleSpellAction(event, actor, system)
					break
				case 'npcSpell':
					await this.#handleNPCSpell(event, actor, system)
					break
				case 'item':
					await this.#handleItemAction(actor, system)
					break
				case 'light':
					await this.#handleLightAction(actor, system)
					break
				case 'feature':
					await this.#handleNPCFeature(actor, system)
					break
				case 'classAbility':
					await this.#handleClassAbility(event, actor, system)
					break
			}
		}

		/**
		* Handle attack action
		* @private
		* @param {object} event     The event
		* @param {object} actor     The actor
		* @param {object} system    Data for the action
		*/
		async #handleAttackAction(event, actor, system) {
			const actionId = system.actionId
			const weaponUuid = actor.items.get(actionId)?.uuid
			const config = {
				handedness: system?.handedness,
				skipPrompt: event.shiftKey
			}
			await actor.system.rollAttack(weaponUuid, config)
		}

		async #handleNPCAttackAction(event, actor, system) {
			const actionId = system.actionId
			const attackUuid = actor.items.get(actionId)?.id
			const config = { skipPrompt: event.shiftKey }
			await actor.system.rollAttack(attackUuid, config)

			const rollMode = Utils.getSetting('hideNPCFeatures') ? 'selfroll' : undefined
			const feature = actor.items.find((i) => i.type === 'NPC Feature' && i.name === actor.items.get(actionId).name)
			await feature?.displayCard({ rollMode })
		}

		/**
		* Handle special attack action
		* @private
		* @param {object} event    The event
		* @param {object} system   Data for the action
		*/
		async #handleSpecialAttackAction(actor, system) {
			const actionId = system.actionId
			const rollMode = Utils.getSetting('hideNPCFeatures') ? 'selfroll' : undefined
			const item = actor.items.get(actionId)
			await item?.displayCard({ rollMode })
		}

		/**
		 * Handle ability action
		 * @private
		 * @param {object} event    The event
		 * @param {object} actor    The actor
		 * @param {object} system   Data for the action
		 */
		async #handleAbilityAction(event, actor, system) {
			const actionId = system.actionId
			const config = { skipPrompt: event.shiftKey }
			await actor.system.rollStatCheck(actionId, config)
		}

		/**
		 * Handle spell action
		 * @private
		 * @param {object} event    The event
		 * @param {object} actor    The actor
		 * @param {object} system   Data for the action
		 */
		async #handleSpellAction(event, actor, system) {
			const actionId = system.actionId
			const spellUuid = actor.items.get(actionId)?.uuid
			const config = { skipPrompt: event.shiftKey }
			await actor.system.castSpell(spellUuid, config)
		}

		/**
		* Handle NPC spell action
		* @private
		* @param {object} event    The event
		* @param {object} actor    The actor
		* @param {object} system   Data for the action
		*/
		async #handleNPCSpell(event, actor, system) {
			const actionId = system.actionId
			const spellUuid = actor.items.get(actionId)?.uuid
			const config = { skipPrompt: event.shiftKey }
			await actor.system.castSpell(spellUuid, config)
		}

		/**
		 * Handle NPC feature action
		 * @private
		 * @param {object} event    The event
		 * @param {object} actor    The actor
		 * @param {object} system   Data for the action
		 */
		async #handleNPCFeature(actor, system) {
			const actionId = system.actionId
			const feature = actor.items.get(actionId)
			const rollMode = Utils.getSetting('hideNPCFeatures') ? 'selfroll' : undefined
			await feature?.displayCard({ rollMode })
		}

		/**
		 * Handle class ability
		 * @private
		 * @param {object} event    The event
		 * @param {object} actor    The actor
		 * @param {object} system   Data for the action
		 */
		async #handleClassAbility(event, actor, system) {
			const actionId = system.actionId
			const abilityUuid = actor.items.get(actionId)?.uuid
			const config = { skipPrompt: event.shiftKey }
			await actor.system.useAbility(abilityUuid, config)
		}

		/**
		 * Handle item action
		 * @private
		 * @param {object} event    The event
		 * @param {object} actor    The actor
		 * @param {object} system   Data for the action
		 */
		async #handleItemAction(actor, system) {
			const actionId = system.actionId
			const item = actor.items.get(actionId)
			await item.displayCard()
		}

		/**
		 * Handle light action
		 * @private
		 * @param {object} actor    The actor
		 * @param {object} system   Data for the action
		 */
		async #handleLightAction(actor, system) {
			const actionId = system.actionId
			const light = actor.items.get(actionId)
			await actor.toggleLight(!light.system.light.active, actionId)
		}
	}
})
