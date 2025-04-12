import {EffectMethods, callMacro, hasMacro} from "../../effectMethods.mjs";

export class SystemDND5E {
  /* Inicializa o submódulo somente para o sistema dnd5e */
  static init() {
    if (game.system.id !== "dnd5e") return;

    Hooks.on("dnd5e.restCompleted", SystemDND5E.restCompleted.bind("dnd5e.restCompleted"));
    Hooks.on("dnd5e.rollAbilitySave", SystemDND5E.rollAbilitySave.bind("dnd5e.rollAbilitySave"));
    Hooks.on("dnd5e.rollAbilityTest", SystemDND5E.rollAbilityTest.bind("dnd5e.rollAbilityTest"));
    Hooks.on("dnd5e.rollAttack", SystemDND5E.rollAttack.bind("dnd5e.rollAttack"));
    Hooks.on("dnd5e.rollDamage", SystemDND5E.rollDamage.bind("dnd5e.rollDamage"));
    Hooks.on("dnd5e.rollDeathSave", SystemDND5E.rollDeathSave.bind("dnd5e.rollDeathSave"));
    Hooks.on("dnd5e.rollSkill", SystemDND5E.rollSkill.bind("dnd5e.rollSkill"));
    Hooks.on("dnd5e.rollToolCheck", SystemDND5E.rollToolCheck.bind("dnd5e.rollToolCheck"));
    Hooks.on("dnd5e.healActor", SystemDND5E.healActor.bind("dnd5e.healActor"));
    Hooks.on("dnd5e.damageActor", SystemDND5E.damageActor.bind("dnd5e.damageActor"));

    // Novo trigger de pré-roll substituindo o antigo
    Hooks.on("dnd5e.preAttackRoll", SystemDND5E.preRollAttack.bind("dnd5e.preAttackRoll"));
  }

  /**
   * Método auxiliar que filtra e chama os efeitos que possuem macro para o trigger.
   * @param {Actor5e} actor  O ator que possui os efeitos aplicados.
   * @param {string} hook    O nome do trigger invocado.
   * @param {object} context Contexto com as informações (config e dialog) para o macro.
   */
  static async _filterAndCall(actor, hook, context) {
    if (!EffectMethods.isExecutor(actor)) return;
    for (const e of actor.appliedEffects.filter(e => hasMacro.call(e, hook))) {
      await callMacro(e, hook, context);
    }
  }

  /**
   * Trigger chamado antes do roll de ataque.
   * @param {object} config Objeto de configuração que deve conter actor ou item.actor.
   * @param {any} dialog (opcional) Informações de diálogo, se houver.
   */
  static preRollAttack(config, dialog) {
    console.log("Trigger preRollAttack disparado com hook:", this);
    const actor = config.actor ?? config.item?.actor;
    if (!actor) {
      console.warn("Actor não encontrado na configuração.");
      return;
    }
    return SystemDND5E._filterAndCall(actor, this, { config, dialog });
  }

  static rollAttack(item, roll, ammoUpdate) {
    if (!item) return;
    return SystemDND5E._filterAndCall(item.actor, this, { item, roll, ammoUpdate });
  }

  static rollAbilitySave(actor, roll, abilityId) {
    return SystemDND5E._filterAndCall(actor, this, { roll, abilityId });
  }

  static rollDeathSave(actor, roll, updates) {
    return SystemDND5E._filterAndCall(actor, this, { roll, updates });
  }

  static rollAbilityTest(actor, roll, abilityId) {
    return SystemDND5E._filterAndCall(actor, this, { roll, abilityId });
  }

  static rollSkill(actor, roll, skillId) {
    return SystemDND5E._filterAndCall(actor, this, { roll, skillId });
  }

  static rollDamage(item, roll) {
    if (!item) return;
    return SystemDND5E._filterAndCall(item.actor, this, { item, roll });
  }

  static rollToolCheck(actor, roll, toolId) {
    return SystemDND5E._filterAndCall(actor, this, { roll, toolId });
  }

  static restCompleted(actor, data) {
    return SystemDND5E._filterAndCall(actor, data.longRest ? "dnd5e.longRest" : "dnd5e.shortRest", { data });
  }

  static healActor(actor, changes, update, userId) {
    return SystemDND5E._filterAndCall(actor, this, { changes, update, userId });
  }

  static damageActor(actor, changes, update, userId) {
    return SystemDND5E._filterAndCall(actor, this, { changes, update, userId });
  }
}
