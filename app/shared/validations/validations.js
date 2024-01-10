const { validate, rule } = use("Validator");

class Validations {
  /**
   *
   * @param {string} id UUID to validate
   * @param {string} fieldName Word to display when occur an error
   */
  static async uuid(id, fieldName) {
    const rules = {
      id: [
        rule(
          "regex",
          new RegExp(
            /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
          )
        ),
        rule("required"),
      ],
    };

    try {
      const validation = await validate(id, rules, {
        "id.required": `${fieldName} é obrigatório`,
        "id.regex": `${fieldName} inválido`,
      });

      if (validation.fails()) throw validation.messages();

      return { validate: true };
    } catch (error) {
      return { error, validate: false };
    }
  }
}

module.exports = Validations;
