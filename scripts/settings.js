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
        name: 'Show Icon for wands and scrolls',//game.i18n.localize('tokenActionHud.template.settings.displayUnequipped.name'),
        hint: 'Show icon for wands and scrolls',//game.i18n.localize('tokenActionHud.template.settings.displayUnequipped.hint'),
        scope: 'client',
        config: true,
        type: Boolean,
        default: true,
        onChange: (value) => {
            coreUpdate(value)
        }
    })
}
