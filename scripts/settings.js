import { MODULE } from './constants.js'

/**
 * Register module settings
 * Called by Token Action HUD Core to register Token Action HUD system module settings
 * @param {function} coreUpdate Token Action HUD Core update function
 */
export function register (coreUpdate) {
    game.settings.register(MODULE.ID, 'showAttackBonus', {
        name: 'Show Roll Bonus for Attacks',//game.i18n.localize('tokenActionHud.template.settings.displayUnequipped.name'),
        hint: 'Show roll bonus for attacks',//game.i18n.localize('tokenActionHud.template.settings.displayUnequipped.hint'),
        scope: 'client',
        config: true,
        type: Boolean,
        default: true,
        onChange: (value) => {
            coreUpdate(value)
        }
    })

    game.settings.register(MODULE.ID, 'showAbilityBonus', {
        name: 'Show Roll Bonus for Abilities',//game.i18n.localize('tokenActionHud.template.settings.displayUnequipped.name'),
        hint: 'Show roll bonus for abilities',//game.i18n.localize('tokenActionHud.template.settings.displayUnequipped.hint'),
        scope: 'client',
        config: true,
        type: Boolean,
        default: true,
        onChange: (value) => {
            coreUpdate(value)
        }
    })

    game.settings.register(MODULE.ID, 'showAttackRanges', {
        name: 'Show Range Icons for Attacks',//game.i18n.localize('tokenActionHud.template.settings.displayUnequipped.name'),
        hint: 'Show range icons for attacks',//game.i18n.localize('tokenActionHud.template.settings.displayUnequipped.hint'),
        scope: 'client',
        config: true,
        type: Boolean,
        default: false,
        onChange: (value) => {
            coreUpdate(value)
        }
    })

    game.settings.register(MODULE.ID, 'showSpellRanges', {
        name: 'Show Range Icons for Spells',//game.i18n.localize('tokenActionHud.template.settings.displayUnequipped.name'),
        hint: 'Show range icons for spells',//game.i18n.localize('tokenActionHud.template.settings.displayUnequipped.hint'),
        scope: 'client',
        config: true,
        type: Boolean,
        default: false,
        onChange: (value) => {
            coreUpdate(value)
        }
    })

    game.settings.register(MODULE.ID, 'wandScrollIcon', {
        name: 'Show Icon for Wands and Scrolls',//game.i18n.localize('tokenActionHud.template.settings.displayUnequipped.name'),
        hint: 'Abbreviate wand and scroll names with icons',//game.i18n.localize('tokenActionHud.template.settings.displayUnequipped.hint'),
        scope: 'client',
        config: true,
        type: Boolean,
        default: true,
        onChange: (value) => {
            coreUpdate(value)
        }
    })

    game.settings.register(MODULE.ID, 'hideLantern', {
        name: 'Hide Oil When No Lantern Equipped',//game.i18n.localize('tokenActionHud.template.settings.displayUnequipped.name'),
        hint: 'Hide oil from the Light menu when no lantern is present',//game.i18n.localize('tokenActionHud.template.settings.displayUnequipped.hint'),
        scope: 'client',
        config: true,
        type: Boolean,
        default: true,
        onChange: (value) => {
            coreUpdate(value)
        }
    })
}
