import { MODULE } from './constants.js'

/**
 * Register module settings
 * Called by Token Action HUD Core to register Token Action HUD system module settings
 * @param {function} coreUpdate Token Action HUD Core update function
 */
export function register (coreUpdate) {
    game.settings.register(MODULE.ID, 'displayUnequipped', {
        name: game.i18n.localize('tokenActionHud.template.settings.displayUnequipped.name'),
        hint: game.i18n.localize('tokenActionHud.template.settings.displayUnequipped.hint'
        ),
        scope: 'client',
        config: true,
        type: Boolean,
        default: true,
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
