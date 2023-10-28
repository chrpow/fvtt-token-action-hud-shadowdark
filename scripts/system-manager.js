// System Module Imports
import { ActionHandler } from './action-handler.js'
import { RollHandler as Core } from './roll-handler.js'
import { DEFAULTS } from './defaults.js'
import * as systemSettings from './settings.js'

export let SystemManager = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    /**
     * Extends Token Action HUD Core's SystemManager class
     */
    SystemManager = class SystemManager extends coreModule.api.SystemManager {
        /**
         * Returns an instance of the ActionHandler to Token Action HUD Core
         * Called by Token Action HUD Core
         * @override
         * @returns {ActionHandler} The ActionHandler instance
         */
        doGetActionHandler () {
            return new ActionHandler()
        }

        /**
         * Returns a list of roll handlers to Token Action HUD Core
         * Used to populate the Roll Handler module setting choices
         * Called by Token Action HUD Core
         * @override
         * @returns {object} The available roll handlers
         */
        getAvailableRollHandlers () {
            const coreTitle = 'Core Template'
            const choices = { core: coreTitle }
            return choices
        }

        /**
         * Returns an instance of the RollHandler to Token Action HUD Core
         * Called by Token Action HUD Core
         * @override
         * @param {string} rollHandlerId The roll handler ID
         * @returns {rollHandler}        The RollHandler instance
         */
        doGetRollHandler (rollHandlerId) {
            let rollHandler
            switch (rollHandlerId) {
            case 'core':
            default:
                rollHandler = new Core()
                break
            }
            return rollHandler
        }

        /**
         * Register Token Action HUD system module settings
         * Called by Token Action HUD Core
         * @override
         * @param {function} coreUpdate The Token Action HUD Core update function
         */
        doRegisterSettings (coreUpdate) {
            systemSettings.register(coreUpdate)
        }

        /**
         * Returns the default layout and groups to Token Action HUD Core
         * Called by Token Action HUD Core
         * @returns {object} The default layout and groups
         */
        async doRegisterDefaultFlags () {
            return DEFAULTS
        }
    }
})
