import { GROUP } from './constants.js'

/**
 * Default layout and groups
 */
export let DEFAULTS = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    const groups = GROUP

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
                    { ...groups.attacks, nestId: 'attacks_attacks' },
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
                name: coreModule.api.Utils.i18n('SHADOWDARK.sheet.abilities.label'),
                groups: [
                    { ...groups.abilities, nestId: 'abilities_abilities' },
                ]
            },
            {
                nestId: 'inventory',
                id: 'inventory',
                name: coreModule.api.Utils.i18n('SHADOWDARK.sheet.player.tab.inventory'),
                groups: [
                    { ...groups.inventory, nestId: 'inventory_inventory' },
                ]
            },
            {
                nestId: 'light',
                id: 'light',
                name: coreModule.api.Utils.i18n('SHADOWDARK.sheet.item.tab.light'),
                groups: [
                    { ...groups.light, nestId: 'light_light'}
                ]
            },
            {
                nestId: 'features',
                id: 'features',
                name: coreModule.api.Utils.i18n('SHADOWDARK.sheet.npc.features_label'),
                groups: [
                    { ...groups.features, nestId: 'features_features' }
                ]
            }
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
