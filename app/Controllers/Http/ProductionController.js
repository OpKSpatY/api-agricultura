const Production = use('App/Models/Production')
const Producer = use('App/Models/Producer')
const ProductionType = use('App/Models/ProductionType')
const { validate } = use('Validator')
const { v4: uuidv4 } = require('uuid');
const dayjs = require('dayjs');
const validationMessagesModule  = require('../../Validators/ValidationMessages')
const Validations = require('../../shared/validations/validations');

class ProductionController{
  async createProduction({ params, request, response }) {
    const { user_id } = params;
    const data = request.only(['name', 'description', 'notes', 'start_date', 'end_date', 'latitude', 'longitude', 'production_type_id']);
    //const productionImage = request.file('image');

    try {
      const validationRules = {
        name: 'required|string|max:200',
        description: 'required|string',
        notes: 'string',
        latitude: 'number',
        longitude: 'number',
        start_date: 'required|date',
        end_date: 'required|date',
        production_type_id: 'required|string'
      };

      const validationMessages = {
        'name.required': validationMessagesModule.required('nome'),
        'name.string': validationMessagesModule.string('nome'),
        'name.max': validationMessagesModule.max('nome', 200),
        'description.required': validationMessagesModule.required('descrição'),
        'description.string': validationMessagesModule.string('descrição'),
        'notes.string': validationMessagesModule.string('notas'),
        'latitude.number': validationMessagesModule.number('latitude'),
        'longitude.number': validationMessagesModule.number('longitude'),
        'start_date.required': validationMessagesModule.required('data de início'),
        'start_date.date': validationMessagesModule.date('data de início'),
        'end_date.required': validationMessagesModule.required('data de término'),
        'end_date.date': validationMessagesModule.date('data de término'),
        'production_type_id.required': validationMessagesModule.required('production_type_id'),
        'production_type_id.string': validationMessagesModule.string('production_type_id')
      };

      const validation = await validate(data, validationRules, validationMessages);

      if (validation.fails()) {
        return response.status(400).send({ message: validation.messages() });
      }

      /*if (!productionImage) {
        return response.status(400).send([{ message: 'Campo image é obrigatório.' }]);
      }*/

      if (!user_id) {
        return response.status(400).send([{ message: 'ID do usuário é obrigatório.' }]);
      }

      const isValidStartDate = dayjs(data.start_date, { strict: true, iso: true }).isValid();
      const isValidEndDate = dayjs(data.end_date, { strict: true, iso: true }).isValid();

      if (!isValidStartDate || !isValidEndDate) {
        return response.status(400).send({ message: 'Datas no formato incorreto.' });
      }

      const formattedStartDate = dayjs(data.start_date).format('YYYY-MM-DD');
      const formattedEndDate = dayjs(data.end_date).format('YYYY-MM-DD');

      try {
        //const nameImage = `${uuidv4()}.${productionImage.extname}`;

        const newProduction = await Production.create({
          id: uuidv4(),
          surname: data.name,
          description: data.description,
          latitude: data.latitude,
          longitude: data.longitude,
          producer_id: user_id,
          notes: data.notes,
          start_date: formattedStartDate,
          end_date: formattedEndDate,
          production_type_id: data.production_type_id
          //image: nameImage
        });

        //const dataImage = { name: nameImage, overwrite: true };
        //await productionImage.move(Helpers.tmpPath('productions'), dataImage);

        /*if (!productionImage.moved()) {
          return response.status(500).send({ message: 'Erro ao mover a imagem.' });
        }*/

        return response.status(201).send({
          production_id: newProduction.id,
        });
      } catch (error) {
        console.log(error);
        return response.status(500).send({ message: 'Não foi possível finalizar a requisição.' });
      }
    } catch (error) {
      console.log(error);
      return response.status(500).send({ message: 'Erro de validação.' });
    }
  }

  async getProduction({ params, response }) {
    try {
      const { production_id } = params;

      if (!production_id) {
        return response.status(400).send({ message: 'ID da produção é obrigatório.' });
      }

      const production = await Production.query()
        .where('id', production_id)
        .select('id', 'surname', 'description', 'latitude', 'longitude', 'created_at', 'notes')
        .first();

      if (!production) {
        return response.status(404).send({ message: 'Produção não encontrada.' });
      }

      return response.status(200).send(production);
    } catch (error) {
      console.log(error);
      return response.status(500).send({ message: 'Não foi possível obter a produção.' });
    }
  }

  async getProductionsList({ response }) {
    try {
      const productions = await Production.query()
        .select('id', 'surname')
        .fetch();

      return response.status(200).send(productions);
    } catch (error) {
      console.log(error);
      return response.status(500).send({ message: 'Não foi possível obter as produções.' });
    }
  }

  async updateProduction({ request, response, params }) {
    const { production_id } = params;

    try {
      const { surname, description, latitude, longitude, producer_id, notes, start_date, end_date, production_type_id } = request.only([
        'surname',
        'description',
        'latitude',
        'longitude',
        'producer_id',
        'notes',
        'start_date',
        'end_date',
        'production_type_id'
      ]);

      const validationRules = {
        surname: 'string|max:200',
        description: 'string',
        notes: 'string',
        latitude: 'number',
        longitude: 'number',
        start_date: 'date',
        end_date: 'date',
        production_type_id: 'string'
      };

      const validationMessages = {
        'surname.string': validationMessagesModule.string('surname'),
        'surname.max': validationMessagesModule.max('surname', 200),
        'description.string': validationMessagesModule.string('descrição'),
        'notes.string': validationMessagesModule.string('notas'),
        'latitude.number': validationMessagesModule.number('latitude'),
        'longitude.number': validationMessagesModule.number('longitude'),
        'start_date.date': validationMessagesModule.date('data de início'),
        'end_date.date': validationMessagesModule.date('data de término'),
        'production_type_id.string': validationMessagesModule.string('production_type_id')
      };

      const validation = await validate(request.all(), validationRules, validationMessages);

      if (validation.fails()) {
        return response.status(400).send({ message: validation.messages() });
      }

      if (!production_id) {
        return response.status(404).json({ message: "Produção não informada." });
      }

      const production = await Production.findBy('producer_id', production_id);

      if (!production) {
        return response.status(404).json({ message: "Produção não encontrada." });
      }

      if (surname) { production.surname = surname; }

      if (description) { production.description = description; }

      if (latitude) { production.latitude = latitude; }

      if (longitude) { production.longitude = longitude; }

      if (producer_id) {
        const user = await Producer.findBy('id', producer_id);
        if (!user) {
          return response.status(404).json({ message: "Usuário não encontrado." });
        }
        production.producer_id = producer_id;
      }

      if (notes) { production.notes = notes; }

      if (start_date) { production.start_date = start_date; }

      if (end_date) { production.end_date = end_date; }

      if (production_type_id) { production.production_type_id = production_type_id}

      await production.save();

      return response.json({ message: 'Produção atualizada com sucesso' });
    } catch (error) {
      console.error(error);
      return response.status(500).json({ error: 'Erro ao atualizar a produção' });
    }
  }

  async getMyProductionsList({ params, response }) {
    const { user_id } = params;
    try {
      const productions = await Production.query()
        .select('id', 'surname')
        .where('producer_id', user_id)
        .fetch();

      if (productions.rows.length == 0) {
        return response.status(204).send();
      }

      return response.status(200).send(productions);
    } catch (error) {
      console.log(error);
      return response.status(500).send({ message: 'Não foi possível obter as produções.' });
    }
  }

  async searchForProductionByType({ params, request, response }) {
    const { production_type_value } = params;
    const { user_id } = request.only(['user_id']);
    try {

      const isUserIdValid = await Validations.uuid(user_id, 'Id do usuário');
      if (!isUserIdValid.validate) return response.status(401).send(isUserIdValid.error);

      let title;
      switch (production_type_value) {
        case 'vegetacao':
          title = 'Vegetação'
          break;
        case 'recursos-hidricos':
          title = 'Recursos Hídricos'
          break;
        default:
          return response.status(404).send({ message: 'Tipo de produção não encontrado.' });
      }

      const production_type = await ProductionType.findBy('title', title);

      const productions = await Production.query()
        .select('id', 'surname')
        .where('producer_id', user_id)
        .where('production_type_id', production_type.id)
        .fetch();

      if (productions.rows.length == 0) {
        return response.status(204).send();
      }
      return response.status(200).send(productions);
    } catch (error) {
      console.log(error);
      return response.status(500).send({ message: 'Não foi possível obter as produções.' });
    }
  }

  async createProductionType({ request, response }) {
    try {
      const data = request.only([
        'title',
      ])

      const productionType = await ProductionType.create(data)

      return response.status(201).json({ message: 'Tipo de Produção criado com sucesso', data: productionType })
    } catch (error) {
      console.error(error)
      return response.status(500).json({ message: 'Erro ao criar tipo de produção', error: error.message })
    }
  }

}

module.exports = ProductionController