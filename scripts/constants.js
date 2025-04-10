/**
 * Module-based constants
 */
export const MODULE = {
	ID: 'token-action-hud-shadowdark'
}

/**
 * Core module
 */
export const CORE_MODULE = {
	ID: 'token-action-hud-core'
}

/**
 * Core module version required by the system module
 */
export const REQUIRED_CORE_MODULE_VERSION = '2.0'

/**
 * Action types
 */
export const ACTION_TYPE = {
	attack: 'SHADOWDARK.sheet.npc.attacks_label',
	ability: 'SHADOWDARK.class-ability.ability.label',
	spell: 'SHADOWDARK.item_type.spell',
	item: 'tokenActionHud.template.item',
	light: 'SHADOWDARK.sheet.item.tab.light',
	feature: 'SHADOWDARK.sheet.npc.features_label',
	melee: 'SHADOWDARK.weapon.type.melee',
	ranged: 'SHADOWDARK.weapon.type.ranged',
	wands: 'SHADOWDARK.inventory.section.wands',
	scrolls: 'SHADOWDARK.inventory.section.scrolls',
	armor: 'SHADOWDARK.item_type.armor',
	basic: 'SHADOWDARK.item_type.basic',
	treasure: 'SHADOWDARK.item.treasure',
	tier: 'SHADOWDARK.sheet.player.spells_tier',
	specialAttack: 'SHADOWDARK.sheet.npc.specials_label'
}

/**
 * Groups
 */
export const GROUP = {
	inventory: { id: 'inventory', name: 'SHADOWDARK.sheet.player.tab.inventory', type: 'system' },
	attacks: { id: 'attacks', name: 'SHADOWDARK.sheet.npc.attacks_label', type: 'system' },
	abilities: { id: 'abilities', name: 'SHADOWDARK.sheet.abilities.label', type: 'system' },
	classAbilities: { id: 'classAbilities', name: 'SHADOWDARK.sheet.special_abilities.label', type: 'system' },
	spells: { id: 'spells', name: 'SHADOWDARK.sheet.player.spells', type: 'system' },
	light: { id: 'light', name: 'SHADOWDARK.sheet.item.tab.light', type: 'system' },
	features: { id: 'features', name: 'SHADOWDARK.sheet.npc.features_label', type: 'system' },
	talents: { id: 'talents', name: 'SHADOWDARK.class.talents.label', type: 'system' }
}

export const ABILITY = {
	str: { name: 'SHADOWDARK.ability_strength' },
	dex: { name: 'SHADOWDARK.ability_dexterity' },
	con: { name: 'SHADOWDARK.ability_constitution' },
	int: { name: 'SHADOWDARK.ability_intelligence' },
	wis: { name: 'SHADOWDARK.ability_wisdom' },
	cha: { name: 'SHADOWDARK.ability_charisma' }
}

export const ICON = {
	thrown: 'fa-solid fa-share',
	wand: 'fa-solid fa-wand-magic-sparkles',
	scroll: 'fa-solid fa-scroll',
	flame: 'fa-solid fa-fire-flame-curved',
	close: 'fa-solid fa-circle-c',
	near: 'fa-solid fa-circle-n',
	far: 'fa-solid fa-circle-f',
	self: 'fa-solid fa-circle-user'
}
