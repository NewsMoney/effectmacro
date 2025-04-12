import {EffectMethods, callMacro, hasMacro} from "../../effectMethods.mjs";

export class SystemDND5E {
  /* Inicializa o submódulo. */
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
    // Adicionando o novo trigger "Pre Attack Roll"
    Hooks.on("dnd5e.preAttackRoll", SystemDND5E.preAttackRoll.bind("dnd5e.preAttackRoll"));
  }

  /**
   * Método utilitário para filtrar e chamar os efeitos aplicados que tenham o macro associado ao trigger.
   * @param {Actor5e} actor  O ator que possui os efeitos.
   * @param {string} hook    O identificador do trigger.
   * @param {object} context Parâmetros a serem passados para o macro.
   */
  static async _filterAndCall(actor, hook, context) {
    if (!EffectMethods.isExecutor(actor)) return;
    for (const e of actor.appliedEffects.filter(e => hasMacro.call(e, hook))) {
      await callMacro(e, hook, context);
    }
  }

  static rollAttack(item, roll, ammoUpdate) {
    if (!item) return;
    return SystemDND5E._filterAndCall(item.actor, this, {item, roll, ammoUpdate});
  }

  // Nova função para o trigger Pre Attack Roll
  static preAttackRoll(item, config) {
    // Verifica se o item foi informado e se possui ator associado
    if (!item) return;
    if (!item.actor) {
      console.error("preAttackRoll: Item sem ator associado", item);
      return;
    }
  
    // Garante que config seja um objeto, mesmo que vazio, para evitar erros de acesso
    config = config || {};
  
    // Se necessário, garanta a propriedade data (ou outras que os macros esperem)
    // Exemplo: se os macros acessam config.data, podemos definir:
    if (config.data === undefined) config.data = {};
  
    // Usa um identificador explícito para o hook
    const hookIdentifier = "dnd5e.preRollAttack";
  
    // Chama os efeitos com o objeto de contexto adequado
    return SystemDND5E._filterAndCall(item.actor, hookIdentifier, { item, config });
  }


  static rollAbilitySave(actor, roll, abilityId) {
    return SystemDND5E._filterAndCall(actor, this, {roll, abilityId});
  }

  static rollDeathSave(actor, roll, updates) {
    return SystemDND5E._filterAndCall(actor, this, {roll, updates});
  }

  static rollAbilityTest(actor, roll, abilityId) {
    return SystemDND5E._filterAndCall(actor, this, {roll, abilityId});
  }

  static rollSkill(actor, roll, skillId) {
    return SystemDND5E._filterAndCall(actor, this, {roll, skillId});
  }

  static rollDamage(item, roll) {
    if (!item) return;
    return SystemDND5E._filterAndCall(item.actor, this, {item, roll});
  }

  static rollToolCheck(actor, roll, toolId) {
    return SystemDND5E._filterAndCall(actor, this, {roll, toolId});
  }

  static restCompleted(actor, data) {
    return SystemDND5E._filterAndCall(actor, data.longRest ? "dnd5e.longRest" : "dnd5e.shortRest", {data});
  }

  static healActor(actor, changes, update, userId) {
    return SystemDND5E._filterAndCall(actor, this, {changes, update, userId});
  }

  static damageActor(actor, changes, update, userId) {
    return SystemDND5E._filterAndCall(actor, this, {changes, update, userId});
  }
}
