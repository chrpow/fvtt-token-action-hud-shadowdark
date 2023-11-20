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
         * @param {string} encodedValue The encoded value
         */
        async doHandleActionEvent(event, encodedValue) {
            const payload = encodedValue.split('|')
            console.log(payload)

            if (payload.length !== 2) {
                super.throwInvalidValueErr()
            }


            const actionTypeId = payload[0]
            const actionId = payload[1]

            // const renderable = ['attack', 'ability']

            // if (renderable.includes(actionTypeId) && this.isRenderItem()) {
            //     return this.doRenderItem(this.actor, actionId)
            // }

            const knownCharacters = ['Player', 'NPC']

            // If single actor is selected
            if (this.actor) {
                await this.#handleAction(event, this.actor, this.token, actionTypeId, actionId)
                return
            }

            const controlledTokens = canvas.tokens.controlled
                .filter((token) => knownCharacters.includes(token.actor?.type))

            // If multiple actors are selected
            for (const token of controlledTokens) {
                const actor = token.actor
                await this.#handleAction(event, actor, token, actionTypeId, actionId)
            }
        }

        /**
         * Handle action
         * @private
         * @param {object} event        The event
         * @param {object} actor        The actor
         * @param {object} token        The token
         * @param {string} actionTypeId The action type id
         * @param {string} actionId     The actionId
         */
        async #handleAction(event, actor, token, actionTypeId, actionId) {
            switch (actionTypeId) {
                case 'attack':
                    await this.#handleAttackAction(event, actor, actionId)
                    break
                case 'ability':
                    await this.#handleAbilityAction(event, actor, actionId)
                    break
                case 'spell':
                    await this.#handleSpellAction(event, actor, actionId)
                    break
                case 'item':
                    this.#handleItemAction(event, actor, actionId)
                    break
                case 'light':
                    this.#handleLightAction(event, actor, actionId)
                    break
                case 'feature':
                    this.#handleItemAction(event, actor, actionId)
                    break
                case 'classAbility':
                    this.#handleClassAbility(event, actor, actionId)
                    break
                // case 'utility':
                //     this.#handleUtilityAction(token, actionId)
                //     break
            }
        }

        /**
        * Handle attack action
        * @private
        * @param {object} event    The event
        * @param {object} actor    The actor
        * @param {string} actionId The action id
        */
        async #handleAttackAction(event, actor, actionId) {
            actor.rollAttack(actionId)
        }

        /**
         * Handle ability action
         * @private
         * @param {object} event    The event
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        async #handleAbilityAction(event, actor, actionId) {
            actor.rollAbility(actionId, { event: event })
        }

        /**
         * Handle spell action
         * @private
         * @param {object} event    The event
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        async #handleSpellAction(event, actor, actionId) {
            actor.castSpell(actionId)
        }

        /**
         * Handle class ability
         * @private
         * @param {object} event    The event
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
            async #handleClassAbility(event, actor, actionId) {
                actor.useAbility(actionId)
            }

        /**
         * Handle item action
         * @private
         * @param {object} event    The event
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        #handleItemAction(event, actor, actionId) {
            const item = actor.items.get(actionId)
            item.displayCard()
        }

        /**
         * Handle light action
         * @private
         * @param {object} event    The event
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        #handleLightAction(event, actor, actionId) {
            const light = actor.getEmbeddedDocument("Item", actionId)
            light.parent.sheet._toggleLightSource(light)
        }
    }
})
