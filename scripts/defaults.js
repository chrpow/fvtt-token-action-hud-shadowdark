import { GROUP } from './constants.js'

/**
 * Default layout and groups
 */
export let DEFAULTS = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    console.log('Core Module:')
    console.log(coreModule)
    const groups = GROUP
// weapons: { id: 'weapons', name: 'SHADOWDARK.inventory.section.weapon', type: 'system' },

    Object.values(groups).forEach(group => {
        group.name = coreModule.api.Utils.i18n(group.name)
        group.listName = `Group: ${coreModule.api.Utils.i18n(group.listName ?? group.name)}`
    })
    const groupsArray = Object.values(groups)
    DEFAULTS = {
        layout: [
            {
                nestId: 'attacks',
                id: 'attacks',
                name: coreModule.api.Utils.i18n('SHADOWDARK.sheet.npc.attacks_label'),
                groups: [
                    { ...groups.attacks, nestId: 'attacks' },
                ]
            },
            {
                nestId: 'spells',
                id: 'spells',
                name: coreModule.api.Utils.i18n('SHADOWDARK.sheet.player.spells'),
                groups: [
                    { ...groups.spells, nestId: 'spells_spells' },
                ]
            },
            {
                nestId: 'abilities',
                id: 'abilities',
                name: coreModule.api.Utils.i18n('SHADOWDARK.sheet.player.tab.abilities'),
                groups: [
                    { ...groups.abilities, nestId: 'abilities_abilities' },
                ]
            },
            // ,
            // {
            //     nestId: 'utility',
            //     id: 'utility',
            //     name: coreModule.api.Utils.i18n('tokenActionHud.utility'),
            //     groups: [
            //         { ...groups.combat, nestId: 'utility_combat' },
            //         { ...groups.token, nestId: 'utility_token' },
            //         { ...groups.rests, nestId: 'utility_rests' },
            //         { ...groups.utility, nestId: 'utility_utility' }
            //     ]
            // }
        ],
        groups: groupsArray
    }
})
