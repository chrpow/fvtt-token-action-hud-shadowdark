/* eslint-disable no-undef */
// System Module Imports
import { ACTION_TYPE, GROUP, ICON } from './constants.js'
import { Utils } from './utils.js'

export let ActionHandler = null

// eslint-disable-next-line no-undef
Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
	/**
	 * Extends Token Action HUD Core's ActionHandler class and builds system-defined actions for the HUD
	 */
	ActionHandler = class ActionHandler extends coreModule.api.ActionHandler {
		// Initialize actor and token variables
		actors = null
		actorId = null
		actorType = null
		tokenId = null

		// Initialize items variable
		items = null

		// Initialize groupIds variables
		groupIds = null
		activationGroupIds = null
		effectGroupIds = null
		inventoryGroupIds = null
		spellGroupIds = null

		// Initialize action variables
		featureActions = null
		inventoryActions = null
		spellActions = null

		/**
		 * Build system actions
		 * Called by Token Action HUD Core
		 * @override
		 * @param {array} groupIds
		 */
		async buildSystemActions(groupIds) {
			// Set actor and token variables
			this.actors = !this.actor ? this.#getActors() : [this.actor]
			this.actorType = this.actor?.type

			// Exit if actor is not a known type
			const knownActors = ['Player', 'NPC', 'Light']
			if (this.actorType && !knownActors.includes(this.actorType)) return

			// Settings
			this.wandScrollIcon = Utils.getSetting('wandScrollIcon')
			this.hideLantern = Utils.getSetting('hideLantern')
			this.showAttackRanges = Utils.getSetting('showAttackRanges')
			this.showSpellRanges = Utils.getSetting('showSpellRanges')
			this.hideLost = Utils.getSetting('hideLost')

			// Set items variable
			if (this.actor) {
				let items = Array.from(this.actor?.items)
				items = coreModule.api.Utils.sortItemsByName(items)
				this.items = items
			}

			// Set settings variables
			this.abbreviateSkills = Utils.getSetting('abbreviateSkills')
			this.addAuxiliaryActions = Utils.getSetting('addAuxiliaryActions')
			this.addDamageAndCritical = Utils.getSetting('addDamageAndCritical')
			this.addStowedItems = Utils.getSetting('addStowedItems')
			this.addUnequippedItems = Utils.getSetting('addUnequippedItems')
			this.calculateAttackPenalty = Utils.getSetting(
				'calculateAttackPenalty'
			)
			this.colorSkills = Utils.getSetting('colorSkills')
			this.showAttackImages = Utils.getSetting('showAttackImages')
			this.showAttackNames = Utils.getSetting('showAttackNames')
			this.splitAttacks = Utils.getSetting('splitAttacks')

			// Set group variables
			this.groupIds = groupIds

			if (this.actorType === 'Player') {
				await this.#buildCharacterActions()
			} else if (this.actorType === 'NPC') {
				await this.#buildNpcActions()
				// } else if (this.actorType === 'Light') {
				//     this.#buildLightActions()
			} else if (!this.actor) {
				this.#buildGroupActions()
			}
		}

		/**
		 * Build character actions
		 * @private
		 */
		async #buildCharacterActions() {
			await Promise.all([
				this.#buildAbilities(),
				this.#buildSpells(),
				this.#buildClassAbilities(),
				this.#buildAttacks(),
				this.#buildInventory(),
				this.#buildTalents(),
				this.#buildLight()
			])
		}

		/**
		 * Build NPC actions
		 * @private
		 */
		async #buildNpcActions() {
			await Promise.all([
				this.#buildNPCAttacks(),
				this.#buildNPCSpells(),
				this.#buildNPCFeatures(),
				this.#buildAbilities()
			])
		}

		/**
		 * Build group actions
		 * @private
		 */
		async #buildGroupActions() {
			await Promise.all([this.#buildAbilities()])
		}

		#getActors() {
			const allowedTypes = ['Player', 'NPC']
			const actors = canvas.tokens.controlled.map((token) => token.actor)
			if (actors.every((actor) => allowedTypes.includes(actor?.type))) {
				return actors
			}
		}

		/**
		 * Build attacks
		 */
		async #buildAttacks() {
			// Get attacks
			const attacks = this.actor?.itemTypes.Weapon.filter(
				(attack) => !attack.system.stashed
			)
			// Exit if no attacks exist
			if (!attacks || attacks?.length === 0) return

			const actionType = 'attack'

			const meleeAttackActions = []
			const rangedAttackActions = []

			// Sort attacks by type
			for (const attack of attacks) {
				const weaponMasterBonus =
					this.actor?.calcWeaponMasterBonus(attack)
				const baseAttackBonus = (await attack.isFinesseWeapon())
					? Math.max(
						this.actor?.attackBonus('melee'),
						this.actor?.attackBonus('ranged')
					)
					: this.actor?.attackBonus(attack.system.type)

				if (attack.system.type === 'melee') {
					const meleeAttackBonus =
						baseAttackBonus +
						this.actor?.system.bonuses.meleeAttackBonus +
						attack.system.bonuses.attackBonus +
						weaponMasterBonus
					// handle versatile weapons
					const hands = []
					if (attack.system.damage.oneHanded) {
						hands.push('1h')
					}
					if (attack.system.damage.twoHanded) {
						hands.push('2h')
					}
					for (const handedness of hands) {
						const name = `${attack.name}
                            ${(await attack.isVersatile())
								? ` ${handedness.toUpperCase()}`
								: ''
							}`
						meleeAttackActions.push(
							new Action(attack, actionType, {
								name,
								range: this.showAttackRanges
									? 'close'
									: undefined,
								handedness,
								info1: {
									text: coreModule.api.Utils.getModifier(meleeAttackBonus),
									title: `${game.i18n.localize('SHADOWDARK.item.effect.predefined_effect.meleeAttackBonus')}: ${coreModule.api.Utils.getModifier(meleeAttackBonus)}`
								}
							})
						)
						// Duplicate melee weapons that can be thrown, adding a 'thrown' icon to them.
						if (await attack.isThrownWeapon()) {
							const thrownAttackBonus =
								baseAttackBonus +
								parseInt(
									this.actor?.system.bonuses
										.rangedAttackBonus,
									10
								) +
								parseInt(
									attack.system.bonuses.attackBonus,
									10
								) +
								weaponMasterBonus
							rangedAttackActions.push(
								new Action(attack, actionType, {
									name,
									range: this.showAttackRanges
										? attack.system.range
										: undefined,
									handedness,
									info1: {
										text: coreModule.api.Utils.getModifier(thrownAttackBonus),
										title: `${game.i18n.localize('SHADOWDARK.item.effect.predefined_effect.rangedAttackBonus')}: ${coreModule.api.Utils.getModifier(thrownAttackBonus)}`
									}
								})
							)
						}
					}
				} else if (attack.system.type === 'ranged') {
					const rangedAttackBonus =
						baseAttackBonus +
						this.actor?.system.bonuses.rangedAttackBonus +
						attack.system.bonuses.attackBonus +
						weaponMasterBonus
					const hands = []
					if (attack.system.damage.oneHanded) {
						hands.push('1h')
					}
					if (attack.system.damage.twoHanded) {
						hands.push('2h')
					}
					for (const handedness of hands) {
						rangedAttackActions.push(
							new Action(attack, actionType, {
								name: `${attack.name}
										${(await attack.isVersatile())
										? ` ${handedness.toUpperCase()}`
										: ''}`,
								range: this.showAttackRanges
									? attack.system.range
									: undefined,
								handedness,
								info1: {
									text: coreModule.api.Utils.getModifier(rangedAttackBonus),
									title: `${game.i18n.localize('SHADOWDARK.item.effect.predefined_effect.rangedAttackBonus')} ${coreModule.api.Utils.getModifier(rangedAttackBonus)}`
								}
							})
						)
					}
				}
			}

			if (meleeAttackActions.length > 0) {
				const meleeGroupData = {
					id: 'melee',
					name: coreModule.api.Utils.i18n(ACTION_TYPE.melee),
					type: 'system-derived'
				}
				this.addGroup(meleeGroupData, GROUP.attacks)
				this.addActions(meleeAttackActions, meleeGroupData)
			}
			if (rangedAttackActions.length > 0) {
				const rangedGroupData = {
					id: 'ranged',
					name: coreModule.api.Utils.i18n(ACTION_TYPE.ranged),
					type: 'system-derived'
				}
				this.addGroup(rangedGroupData, GROUP.attacks)
				this.addActions(rangedAttackActions, rangedGroupData)
			}
		}

		/**
		 * Build abilities
		 */
		async #buildAbilities() {
			const actionType = 'ability'
			const abilities = CONFIG.SHADOWDARK.ABILITY_KEYS

			const abilityActions = await Promise.all(
				abilities.map(async (ability) => {
					const name = coreModule.api.Utils.i18n(CONFIG.SHADOWDARK.ABILITIES_LONG[ability])
					const mod = this.actor?.system.abilities[ability].mod
					return {
						id: `${actionType}-${ability}`,
						name: (this.abbreviateSkills)
							? coreModule.api.Utils.capitalize(ability)
							: name,
						info1: (this.actor)
							? {
								text: coreModule.api.Utils.getModifier(mod),
								title: `${game.i18n.localize('SHADOWDARK.class-ability.ability.check')}: ${coreModule.api.Utils.getModifier(mod)}`
							}
							: null,
						system: { actionType, actionId: ability }
					}
				})
			)
			this.addActions(abilityActions, GROUP.abilities)
		}

		/**
		 * Build spells
		 */
		async #buildSpells() {
			const actionType = 'spell'

			const spells = this.actor?.itemTypes.Spell

			if (spells.length > 0) {
				const activeTiers = [
					...new Set(spells.map((item) => item.system.tier))
				]

				for (const tier of activeTiers) {
					const tierGroupId = `tier${tier}`
					const tierGroupName = `${coreModule.api.Utils.i18n(
						ACTION_TYPE.tier
					)} ${tier}`

					const tierGroupData = {
						id: tierGroupId,
						name: tierGroupName,
						type: 'system-derived'
					}

					const activeSpells = this.hideLost
						? spells.filter(
							(spell) =>
								spell.system.tier === tier &&
								!spell.system.lost
						)
						: spells.filter((spell) => spell.system.tier === tier)
					const spellActions = await Promise.all(activeSpells.map(async (spell) => {
						const ability = (await this.actor.getSpellcastingAbility(spell.id))
						const spellBonus = this.actor?.system.abilities[ability].mod +
							this.actor.system.bonuses?.spellcastingCheckBonus
						return new Action(spell, actionType, {
							info1: {
								text: coreModule.api.Utils.getModifier(spellBonus),
								title: game.i18n.localize('SHADOWDARK.item.effect.predefined_effect.spellCastingBonus')
							},
							range: this.showSpellRanges
								? spell.system.range
								: undefined,
							cssClass: spell.system.lost
								? 'tah-shadowdark-lost'
								: ''
						})
					}))
					this.addGroup(tierGroupData, GROUP.spells)
					this.addActions(spellActions, tierGroupData)
				}
			}

			const wands = this.actor?.itemTypes.Wand.filter(
				(wand) =>
					wand.system.class.includes(this.actor?.system.class) ||
					this.actor.itemTypes.Talent.find(
						(t) => t.name === 'Magical Dabbler'
					)
			)
			const usableWands = this.hideLost
				? wands.filter(
					(wand) => !wand.system.lost && !wand.system.stashed
				)
				: wands
			if (usableWands.length > 0) {
				const wandGroupData = {
					id: 'spells_wands',
					name: coreModule.api.Utils.i18n(ACTION_TYPE.wands),
					type: 'system-derived'
				}

				const wandActions = await Promise.all(usableWands.map(async (wand) => {
					const ability = (await this.actor.getSpellcastingAbility(wand.id))
					const spellBonus = this.actor?.system.abilities[ability].mod +
						this.actor.system.bonuses?.spellcastingCheckBonus
					return new Action(wand, actionType, {
						name: wand.system.spellName,
						info1: {
							text: coreModule.api.Utils.getModifier(spellBonus),
							title: game.i18n.localize('SHADOWDARK.item.effect.predefined_effect.spellCastingBonus')
						},
						icon2: this.#getWandScrollIcon('wand'),
						range: this.showSpellRanges
							? wand.system.range
							: undefined,
						cssClass: wand.system.lost ? 'tah-shadowdark-lost' : ''
					})
				}))
				this.addGroup(wandGroupData, GROUP.spells)
				this.addActions(wandActions, wandGroupData)
			}

			const scrolls = this.actor?.itemTypes.Scroll.filter(
				(scroll) =>
					scroll.system.class.includes(this.actor?.system.class) ||
					this.actor.itemTypes.Talent.find(
						(t) => t.name === 'Magical Dabbler'
					)
			)
			const usableScrolls = scrolls.filter(
				(scroll) => !scroll.system.stashed
			)
			if (usableScrolls.length > 0) {
				const scrollGroupData = {
					id: 'spells_scrolls',
					name: coreModule.api.Utils.i18n(ACTION_TYPE.scrolls),
					type: 'system-derived'
				}

				const scrollActions = await Promise.all(usableScrolls.map(async (scroll) => {
					const ability = (await this.actor.getSpellcastingAbility(scroll.id))
					const spellBonus = this.actor?.system.abilities[ability].mod +
						this.actor.system.bonuses?.spellcastingCheckBonus
					return new Action(scroll, actionType, {
						name: scroll.system.spellName,
						info1: {
							text: coreModule.api.Utils.getModifier(spellBonus),
							title: game.i18n.localize('SHADOWDARK.item.effect.predefined_effect.spellCastingBonus')
						},
						icon2: this.#getWandScrollIcon('scroll'),
						range: this.showSpellRanges
							? scroll.system.range
							: undefined
					})
				}))

				this.addGroup(scrollGroupData, GROUP.spells)
				this.addActions(scrollActions, scrollGroupData)
			}
		}

		/**
		 * Build spells
		 */
		#buildNPCSpells() {
			const spells = this.actor?.itemTypes['NPC Spell']

			if (!spells || spells?.length === 0) return

			const actionType = 'npcSpell'

			const spellActions = [
				...(this.hideLost
					? spells.filter((a) => !a.system?.lost)
					: spells)
			].map((c) => {
				return new Action(c, actionType, {
					info1: {
						text: coreModule.api.Utils.getModifier(this.actor.system?.spellcastingBonus),
						title: game.i18n.localize('SHADOWDARK.item.effect.predefined_effect.spellCastingBonus')
					},
					cssClass: c.system?.lost ? 'tah-shadowdark-lost' : ''
				})
			})
			this.addActions(spellActions, GROUP.spells)
		}

		/**
		 * Build class abilities (e.g. bard presence and ranger herbalism)
		 */
		// async #buildClassAbilities (actionGroup, talentName, groupName) {
		async #buildClassAbilities() {
			const actionType = 'classAbility'
			const classAbilities = this.actor?.itemTypes['Class Ability']

			if (classAbilities.length > 0) {
				const activeGroups = [
					...new Set(classAbilities.map((item) => item.system.group))
				]

				for (const g of activeGroups) {
					const groupData = {
						id: g.slugify(),
						name: g,
						type: 'system'
					}

					const activeAbilities = this.hideLost
						? classAbilities.filter(
							(ab) => ab.system.group === g && !ab.system.lost
						)
						: classAbilities.filter((ab) => ab.system.group === g)
					const abilityActions = await Promise.all(activeAbilities.map(async (ab) => {
						const ability = (ab.system?.ability)
						const abBonus = this.actor?.system.abilities[ability].mod
						return new Action(ab, actionType, {
							info1: {
								text: coreModule.api.Utils.getModifier(abBonus),
								title: game.i18n.localize('SHADOWDARK.dialog.item_roll.ability_bonus')
							},
							cssClass: ab.system.lost
								? 'tah-shadowdark-lost'
								: ''
						})
					}))
					this.addGroup(groupData, GROUP.classAbilities)
					this.addActions(abilityActions, groupData)
				}
			}
		}

		/**
		 * Build talents
		 */
		async #buildTalents() {
			// Get talents
			const talents = this.actor?.itemTypes.Talent
			// Exit if no talents exist
			if (!talents || talents?.length === 0) return

			// Get category headings
			const categories = [...new Set(talents.map(t => t.system.talentClass))]

			const actionType = 'item'

			for (const category of categories) {
				const talentArray = talents.filter(
					(t) => t.system.talentClass === category
				)
				if (!talentArray || talentArray?.length === 0) continue

				const talentTypeGroupData = {
					id: `talents_${category}`,
					name: coreModule.api.Utils.i18n(
						ACTION_TYPE[category] ?? coreModule.api.Utils.capitalize(category)
					),
					type: 'system-derived'
				}
				if (talentArray.length > 0) {
					this.addGroup(talentTypeGroupData, GROUP.talents)
					const itemActions = talentArray.map((t) => {
						return new Action(t, actionType)
					})
					this.addActions(itemActions, talentTypeGroupData)
				}
			}
		}

		/**
		 * Build inventory
		 */
		async #buildInventory() {
			const actionType = 'item'

			// The types of items shown in the inventory menu
			const itemTypes = [
				'Armor',
				'Basic',
				'Potion',
				'Scroll',
				'Wand',
				'Weapon'
			]

			const treasureTypes = ['Gem']

			const treasure = []

			for (const itemType of itemTypes) {
				const itemArray = this.actor?.itemTypes[itemType].filter(
					(item) => !item.system.stashed
				)
				if (!itemArray || itemArray?.length === 0) continue

				const items = []
				for (const item of itemArray) {
					item.system?.treasure
						? treasure.push(item)
						: items.push(item)
				}
				const itemTypeGroupData = {
					id: `inventory_${itemType.slugify()}`,
					name: coreModule.api.Utils.i18n(
						ACTION_TYPE[itemType.slugify()]
					),
					type: 'system-derived'
				}
				if (items.length > 0) {
					this.addGroup(itemTypeGroupData, GROUP.inventory)
					const itemActions = items.map((item) => {
						return new Action(item, actionType)
					})
					this.addActions(itemActions, itemTypeGroupData)
				}
			}

			for (const itemType of treasureTypes) {
				for (const item of this.actor?.itemTypes[itemType]) {
					treasure.push(item)
				}
			}
			if (!treasure || treasure?.length === 0) return
			const itemTypeGroupData = {
				id: 'inventory_treasure',
				name: coreModule.api.Utils.i18n(ACTION_TYPE.treasure),
				type: 'system-derived'
			}
			const treasureActions = treasure.map((treasure) => {
				return new Action(treasure, actionType)
			})
			this.addGroup(itemTypeGroupData, GROUP.inventory)
			this.addActions(treasureActions, itemTypeGroupData)
		}

		/**
		 * Build lights
		 */
		async #buildLight() {
			const actionType = 'light'

			const lights = []

			for (const light of this.actor?.itemTypes.Basic.filter(
				(item) => item.system.light.isSource
			)) {
				if (!light.system.light.remainingSecs) continue
				if (this.hideLantern) {
					if (light.name === 'Oil, Flask') {
						if (
							this.actor?.itemTypes.Basic.some(
								(item) => item.name === 'Lantern'
							)
						) {
							lights.push(light)
						}
					} else lights.push(light)
				} else lights.push(light)
			}

			const lightActions = await Promise.all(
				lights.map(async (light) => {
					return light.system.light.active
						? new Action(light, actionType, {
							icon2: `<i class='${ICON.flame}'></i>`,
							cssClass: 'toggle active'
						})
						: new Action(light, actionType, { cssClass: 'toggle' })
				})
			)
			this.addActions(lightActions, GROUP.light)
		}

		/**
		 * Build NPC attacks
		 */
		async #buildNPCAttacks() {
			// Get attacks
			const attacks = this.actor?.itemTypes['NPC Attack']
			const specialAttacks = this.actor?.itemTypes['NPC Special Attack']

			// Exit if no attacks exist
			if (
				!(attacks || specialAttacks) ||
				(attacks?.length === 0 && specialAttacks?.length === 0)
			) {
				return
			}

			const meleeAttackActions = []
			const rangedAttackActions = []

			// Sort attacks by type
			for (const attack of attacks) {
				const ranges = attack.system.ranges
				if (ranges.includes('close')) {
					meleeAttackActions.push(
						new Action(attack, 'npcAttack', {
							name: coreModule.api.Utils.capitalize(attack.name),
							info1: {
								text: coreModule.api.Utils.getModifier(attack.system.bonuses.attackBonus),
								title: game.i18n.localize('SHADOWDARK.item.npc_attack_bonus')
							},
							range: this.showAttackRanges ? 'close' : undefined
						})
					)

					// Duplicate melee weapons that can be thrown, adding a 'thrown' icon to them.
					if (ranges.includes('near') || ranges.includes('far')) {
						const maxRange = ranges.includes('far') ? 'far' : 'near'
						rangedAttackActions.push(
							new Action(attack, 'npcAttack', {
								icon2: this.#getThrownIcon(),
								name: coreModule.api.Utils.capitalize(attack.name),
								info1: {
									text: coreModule.api.Utils.getModifier(attack.system.bonuses.attackBonus),
									title: game.i18n.localize('SHADOWDARK.item.npc_attack_bonus')
								},
								range: this.showAttackRanges
									? maxRange
									: undefined
							})
						)
						continue
					}
				} else if (ranges.includes('near') || ranges.includes('far')) {
					const maxRange = ranges.includes('far') ? 'far' : 'near'
					rangedAttackActions.push(
						new Action(attack, 'npcAttack', {
							name: coreModule.api.Utils.capitalize(attack.name),
							info1: {
								text: coreModule.api.Utils.getModifier(attack.system.bonuses.attackBonus),
								title: game.i18n.localize('SHADOWDARK.item.npc_attack_bonus')
							},
							range: this.showAttackRanges ? maxRange : undefined
						})
					)
				}
			}

			if (meleeAttackActions.length > 0) {
				const meleeGroupData = {
					id: 'melee',
					name: coreModule.api.Utils.i18n(ACTION_TYPE.melee),
					type: 'system-derived'
				}
				this.addGroup(meleeGroupData, GROUP.attacks)
				this.addActions(meleeAttackActions, meleeGroupData)
			}
			if (rangedAttackActions.length > 0) {
				const rangedGroupData = {
					id: 'ranged',
					name: coreModule.api.Utils.i18n(ACTION_TYPE.ranged),
					type: 'system-derived'
				}
				this.addGroup(rangedGroupData, GROUP.attacks)
				this.addActions(rangedAttackActions, rangedGroupData)
			}
			if (specialAttacks.length > 0) {
				const specialAttackActions = specialAttacks.map((s) => {
					return new Action(s, 'specialAttack', { name: s.name })
				})
				const specialGroupData = {
					id: 'specialAttacks',
					name: coreModule.api.Utils.i18n(ACTION_TYPE.specialAttack),
					type: 'system-derived'
				}
				this.addGroup(specialGroupData, GROUP.attacks)
				this.addActions(specialAttackActions, specialGroupData)
			}
		}

		/**
		 * Build NPC features
		 */
		async #buildNPCFeatures() {
			const features = this.actor?.itemTypes['NPC Feature']
			// Exit if no features exist
			if (!features || features?.length === 0) return

			const actionType = 'feature'

			const featureActions = await Promise.all(
				features.map(async (feature) => {
					return new Action(feature, actionType)
				})
			)
			this.addActions(featureActions, GROUP.features)
		}

		#getWandScrollIcon(itemKey) {
			const title = game.i18n.localize(`SHADOWDARK.item.${itemKey}.label`)
			const icon = ICON[itemKey]
			return this.wandScrollIcon && icon
				? `<i class='${icon}' title='${title}'></i>`
				: ''
		}

		#getThrownIcon() {
			const title = game.i18n.localize(
				'SHADOWDARK.weapon.properties.thrown'
			)
			const icon = ICON.thrown
			return `<i class='${icon}' title='${title}'></i>`
		}
	}

	function _getRangeIcon(range) {
		const title = CONFIG.SHADOWDARK.RANGES[range] ?? ''
		const icon = ICON[range]
		return icon ? `<i class='${icon}' title='${title}'></i>` : ''
	}

	class Action {
		constructor(item, actionType, options) {
			// NOTE: The action ID must be unique across groups
			// Ex. actions in buildLight and buildAttack may reference the same item in buildInventory
			this.id = `${actionType}-${item.id}${options?.handedness ? `-${options?.handedness}` : ''
				}`
			this.name = options?.name || item.name
			this.img = coreModule.api.Utils.getImage(item)
			this.icon1 = _getRangeIcon(options?.range)
			this.icon2 = options?.icon2
			this.cssClass = options?.cssClass
			this.system = { actionType, actionId: item.id }
			this.info1 = options?.info1
			if (options?.handedness) this.system.handedness = options.handedness
		}
	}
})
