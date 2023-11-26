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
export const REQUIRED_CORE_MODULE_VERSION = '1.5'

/**
 * Action types
 */
export const ACTION_TYPE = {
    attack: 'SHADOWDARK.sheet.npc.attacks_label',
    ability: 'SHADOWDARK.class-ability.ability.label',
    spell: 'SHADOWDARK.item_type.spell',
    perform: 'Perform',
    herbalism: 'Herbalism',
    item: 'tokenActionHud.template.item',
    light: 'SHADOWDARK.sheet.item.tab.light',
    feature: 'SHADOWDARK.sheet.npc.features_label'
}

/**
 * Groups
 */
export const GROUP = {
    inventory: { id: 'inventory', name: 'SHADOWDARK.sheet.player.tab.inventory', type: 'system' },
    attacks: { id: 'attacks', name: 'SHADOWDARK.sheet.npc.attacks_label', type: 'system' },
    abilities: { id: 'abilities', name: 'SHADOWDARK.sheet.abilities.label', type: 'system' },
    spells: { id: 'spells', name: 'SHADOWDARK.sheet.player.spells', type: 'system' },
    perform: { id: 'perform', name: 'Perform', type: 'system' },
    herbalism: { id: 'herbalism', name: 'Herbalism', type: 'system' },
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
    thrown: '<i class="fa-solid fa-share"></i>',
    wand: '<i class="fa-solid fa-wand-magic-sparkles"></i>',
    scroll: '<i class="fa-solid fa-scroll"></i>',
    flame: '<i class="fa-solid fa-fire-flame-curved"></i>',
    close: '<i class="fa-solid fa-circle-c"></i>',
    near: '<i class="fa-solid fa-circle-n"></i>',
    far: '<i class="fa-solid fa-circle-f"></i>',
    self: '<i class="fa-solid fa-circle-user"></i>'
}
