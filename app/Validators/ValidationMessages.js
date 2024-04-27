// validationMessages.js
module.exports = {
  required: (field) => `O campo ${field} é obrigatório.`,
  string: (field) => `O campo ${field} deve ser uma string.`,
  max: (field, length) =>
    `O campo ${field} deve ter no máximo ${length} caracteres.`,
  min: (field, length) =>
    `O campo ${field} deve ter no mínimo ${length} caracteres.`,
  number: (field) => `O campo ${field} deve ser um número.`,
  integer: (field) => `O campo ${field} deve ser um número inteiro.`,
  array: (field) => `O campo ${field} deve ser um array.`,
  date: (field) => `O campo ${field} deve ser uma data válida.`,
  email: (field) => `O campo ${field} deve ser um e-mail válido.`,
  unique: (field) => `O campo ${field} deve ser único.`,
  in: (field, values) =>
    `O campo ${field} deve ser um dos valores permitidos: ${values}.`,
  notIn: (field, values) =>
    `O campo ${field} não pode ser um dos valores: ${values}.`,
  confirmed: (field) => `A confirmação do campo ${field} não coincide.`,
  regex: (field) => `O formato do campo ${field} é inválido.`,
  url: (field) => `O campo ${field} deve ser uma URL válida.`,
  enum: (field, values) =>
    `O campo ${field} deve ser um dos valores permitidos: ${values}.`,
}
