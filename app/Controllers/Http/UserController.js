'use strict'
const Producer = use('App/Models/Producer')
const Database = use('Database');
const Hash = use('Hash')
const { validate } = use('Validator')
const { limparCpf, formatarCpf} = require('../../Helpers/clearCPF')
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const Env = use('Env');
const validationMessagesModule  = require('../../Validators/ValidationMessages')

class UserController {
  async createUser({ request, response }) {
    try {
      const validationRules = {
        name: 'required|string',
        cpf: 'required|string',
        email: 'required|email',
        password: 'required|string',
        confirm_password: 'required|string',
      }

      const validationMessages = {
        'name.required': validationMessagesModule.required('nome'),
        'name.string': validationMessagesModule.string('nome'),
        'cpf.required': validationMessagesModule.required('CPF'),
        'cpf.string': validationMessagesModule.string('CPF'),
        'email.required': validationMessagesModule.required('email'),
        'email.email': validationMessagesModule.email('email'),
        'password.required': validationMessagesModule.required('senha'),
        'password.string': validationMessagesModule.string('senha'),
        'confirm_password.required': validationMessagesModule.required('confirmação de senha'),
        'confirm_password.string': validationMessagesModule.string('confirmação de senha'),
      };

      const validation = await validate(request.all(), validationRules, validationMessages)

      if (validation.fails()) {
        return response.status(400).send({ message: validation.messages() })
      }

      const userData = request.only(['name', 'cpf', 'email', 'password', 'confirm_password'])
      const clearCPF = limparCpf(userData.cpf);
      if (clearCPF.length !== 11) {
        return response.status(400).send({ message: 'O CPF deve ter 11 dígitos, desprezando os símbolos.' });
      }

      if (userData.password !== userData.confirm_password) {
        return response.status(400).send({ message: 'A senha e a confirmação de senha não coincidem' })
      }

      const existingEmail = await Producer.findBy('email', userData.email)
      if (existingEmail) {
        return response.status(400).send({ message: 'Este e-mail pertence a um usuário cadastrado' })
      }

      const existingCpf = await Producer.findBy('cpf', clearCPF)
      if (existingCpf) {
        return response.status(400).send({ message: 'Este CPF pertence a um usuário cadastrado' })
      }

      const hashedPassword = await Hash.make(userData.password)

      const newUser = await Producer.create({
        id: uuidv4(),
        name: userData.name,
        cpf: clearCPF,
        email: userData.email,
        hashed_password: hashedPassword,
      })

      const token = jwt.sign({ id: newUser.id }, Env.get('APP_KEY'));

      return response.status(201).send({
        user_id: newUser.id,
        token: token
      })
    } catch (error) {
      return response.status(500).send({ message: 'Não foi possível finalizar a requisição'})
    }
  }

  async login({ request, response }) {
    try {
      const { email, password } = request.only(['email', 'password']);

      const user = await Producer.findBy('email', email);

      if (!user) {
        return response.status(401).send({ message: 'E-mail ou senha inválidos' });
      }

      const isPasswordValid = await Hash.verify(password, user.hashed_password);

      if (!isPasswordValid) {
        return response.status(401).send({ message: 'E-mail ou senha inválidos' });
      }

      const token = jwt.sign({ id: user.id}, Env.get('APP_KEY'));

      return response.json({ token, user_id: user.id });
    } catch (error) {
      console.error(error);
      return response.status(500).send({ message: 'Não foi possível realizar a requisição' });
    }
  }

  async returnAllProducers({ response }) {
    try {
      const producers = await Producer.all()
      console.log('Registros de produtores:', producers.toJSON())
      return response.json(producers)
    } catch (error) {
      console.error('Erro ao buscar produtores:', error)
      return response.status(500).json({ error: 'Erro ao buscar produtores' })
    }
  }

  async returnUserData({ params, response }) {
    try {
      const { user_id } = params;
      const user = await Producer.findBy('id', user_id)
      if (!user){
        return response.status(400).send({message: "Usuário não encontrado"})
      }
      return response.json({
        name: user.name,
        cpf: formatarCpf(user.cpf),
        email: user.email
      })
    } catch (error) {
      return response.status(error.status || 500).send([{ message: 'Não foi possível finalizar a requisição.' }]);
    }
  }

  async updateProfile({ request, response, params }) {
    const { user_id } = params;

    try {
      const { name, cpf, email, password, confirm_password } = request.only([
        'name',
        'cpf',
        'email',
        'password',
        'confirm_password',
      ]);

      const validationRules = {
        name: 'string',
        cpf: 'string',
        email: 'email',
        password: 'string',
        confirm_password: 'string',
      }

      const validationMessages = {
        'name.string': validationMessagesModule.string('name'),
        'cpf.string': validationMessagesModule.string('cpf'),
        'email.email': validationMessagesModule.email('email'),
        'password.required': validationMessagesModule.required('password'),
        'password.string': validationMessagesModule.string('password'),
        'confirm_password.required': validationMessagesModule.required('confirm_password'),
        'confirm_password.string': validationMessagesModule.string('confirm_password'),
      }

      const validation = await validate(request.all(), validationRules, validationMessages);

      if (validation.fails()) {
        return response.status(400).send({ message: validation.messages() });
      }

      const user = await Producer.findBy('id', user_id);

      if (!user) {
        return response.status(404).json({ message: "Usuário não encontrado." });
      }

      if (cpf) {
        const clearCPF = limparCpf(cpf);

        if (clearCPF.length !== 11) {
          return response.status(400).send({ message: 'O CPF deve ter 11 dígitos, desprezando os símbolos.' });
        }

        // Verifique se o CPF já está em uso
        const existingCpfUser = await Producer.findBy('cpf', clearCPF);
        if (existingCpfUser && existingCpfUser.id !== user.id) {
          return response.status(400).send({ message: 'Este CPF pertence a outro usuário cadastrado.' });
        }

        user.cpf = clearCPF;
      }

      if (name) { user.name = name; }

      if (email) {
        // Verifique se o e-mail já está em uso
        const existingEmailUser = await Producer.findBy('email', email);
        if (existingEmailUser && existingEmailUser.id !== user.id) {
          return response.status(400).send({ message: 'Este e-mail pertence a outro usuário cadastrado.' });
        }

        user.email = email;
      }

      if (password && confirm_password && password === confirm_password) {
        const hashedPassword = await Hash.make(password);
        user.password = hashedPassword;
      }

      await user.save();

      return response.json({ message: 'Perfil atualizado com sucesso' });
    } catch (error) {
      console.error(error);
      return response.status(500).json({ error: 'Erro ao atualizar o perfil' });
    }
  }

}

  module.exports = UserController;