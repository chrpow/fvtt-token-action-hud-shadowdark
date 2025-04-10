/* eslint-disable no-undef */
import { MODULE } from './constants.js'

/**
 * Register module settings
 * Called by Token Action HUD Core to register Token Action HUD system module settings
 * @param {function} coreUpdate Token Action HUD Core update function
 */
export function register(coreUpdate) {
	game.settings.register(MODULE.ID, 'showAttackRanges', {
		name: game.i18n.localize(
			'tokenActionHud.shadowdark.setting.showAttackRanges.name'
		),
		hint: game.i18n.localize(
			'tokenActionHud.shadowdark.setting.showAttackRanges.hint'
		),
		scope: 'client',
		config: true,
		type: Boolean,
		default: false,
		onChange: (value) => {
			coreUpdate(value)
		}
	})

	game.settings.register(MODULE.ID, 'showSpellRanges', {
		name: game.i18n.localize(
			'tokenActionHud.shadowdark.setting.showSpellRanges.name'
		),
		hint: game.i18n.localize(
			'tokenActionHud.shadowdark.setting.showSpellRanges.hint'
		),
		scope: 'client',
		config: true,
		type: Boolean,
		default: false,
		onChange: (value) => {
			coreUpdate(value)
		}
	})

	game.settings.register(MODULE.ID, 'wandScrollIcon', {
		name: game.i18n.localize(
			'tokenActionHud.shadowdark.setting.wandScrollIcon.name'
		),
		hint: game.i18n.localize(
			'tokenActionHud.shadowdark.setting.wandScrollIcon.hint'
		),
		scope: 'client',
		config: true,
		type: Boolean,
		default: true,
		onChange: (value) => {
			coreUpdate(value)
		}
	})

	game.settings.register(MODULE.ID, 'hideLantern', {
		name: game.i18n.localize(
			'tokenActionHud.shadowdark.setting.hideLantern.name'
		),
		hint: game.i18n.localize(
			'tokenActionHud.shadowdark.setting.hideLantern.hint'
		),
		scope: 'client',
		config: true,
		type: Boolean,
		default: true,
		onChange: (value) => {
			coreUpdate(value)
		}
	})

	game.settings.register(MODULE.ID, 'hideLost', {
		name: game.i18n.localize(
			'tokenActionHud.shadowdark.setting.hideLost.name'
		),
		hint: game.i18n.localize(
			'tokenActionHud.shadowdark.setting.hideLost.hint'
		),
		scope: 'client',
		config: true,
		type: Boolean,
		default: false,
		onChange: (value) => {
			coreUpdate(value)
		}
	})

	game.settings.register(MODULE.ID, 'hideNPCFeatures', {
		name: game.i18n.localize(
			'tokenActionHud.shadowdark.setting.hideNPCFeatures.name'
		),
		hint: game.i18n.localize(
			'tokenActionHud.shadowdark.setting.hideNPCFeatures.hint'
		),
		scope: 'world',
		config: true,
		type: Boolean,
		default: true,
		onChange: (value) => {
			coreUpdate(value)
		}
	})
}
