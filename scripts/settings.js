import { MODULE } from './constants.js'

/**
 * Register module settings
 * Called by Token Action HUD Core to register Token Action HUD system module settings
 * @param {function} coreUpdate Token Action HUD Core update function
 */
export function register(coreUpdate) {
    game.settings.register(MODULE.ID, 'showAttackBonus', {
        name: 'Show Roll Bonus for Attacks',
        hint: 'Show roll bonus for attacks.',
        scope: 'client',
        config: true,
        type: Boolean,
        default: true,
        onChange: (value) => {
            coreUpdate(value)
        }
    })

    game.settings.register(MODULE.ID, 'showAbilityBonus', {
        name: 'Show Roll Bonus for Abilities',
        hint: 'Show roll bonus for abilities.',
        scope: 'client',
        config: true,
        type: Boolean,
        default: true,
        onChange: (value) => {
            coreUpdate(value)
        }
    })

    game.settings.register(MODULE.ID, 'showAttackRanges', {
        name: 'Show Range Icons for Attacks',
        hint: 'Show range icons for attacks.',
        scope: 'client',
        config: true,
        type: Boolean,
        default: false,
        onChange: (value) => {
            coreUpdate(value)
        }
    })

    game.settings.register(MODULE.ID, 'showSpellRanges', {
        name: 'Show Range Icons for Spells',
        hint: 'Show range icons for spells.',
        scope: 'client',
        config: true,
        type: Boolean,
        default: false,
        onChange: (value) => {
            coreUpdate(value)
        }
    })

    game.settings.register(MODULE.ID, 'wandScrollIcon', {
        name: 'Show Icon for Wands and Scrolls',
        hint: 'Abbreviate wand and scroll names with icons.',
        scope: 'client',
        config: true,
        type: Boolean,
        default: true,
        onChange: (value) => {
            coreUpdate(value)
        }
    })

    game.settings.register(MODULE.ID, 'hideLantern', {
        name: 'Hide Oil When No Lantern Equipped',
        hint: 'Hide oil from the Light menu when no lantern is present.',
        scope: 'client',
        config: true,
        type: Boolean,
        default: true,
        onChange: (value) => {
            coreUpdate(value)
        }
    })

    game.settings.register(MODULE.ID, 'hideLost', {
        name: 'Hide Lost Spells and Abilities',
        hint: 'Hide lost spells and abilities from the HUD.',
        scope: 'client',
        config: true,
        type: Boolean,
        default: false,
        onChange: (value) => {
            coreUpdate(value)
        }
    })
}
