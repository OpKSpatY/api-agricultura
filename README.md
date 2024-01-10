# API AGRICULTURA

Essa é uma API voltada para a agricultura, construído utilizando Docker, Postgres, Adonis.js e Knex.js como query builder.

## Instalação

Certifique-se de ter o Node.js (v.18 ou superior), o npm e o Docker instalados no seu sistema.

1. Clone o repositório:
```bash
https://github.com/OpKSpatY/api-agricultura.git
```

2. Navegue até o diretório do projeto
```bash
cd api-agricultura
```
3. Instale as dependências
```bash
npm install
```

4. Suba a instância no Docker utilizando o docker-compose
```bash
docker compose up -d
```

5. Execute as migrações para criar as tabelas no banco de dados:
```bash
adonis migration:run
```

Para a visualização do banco, recomendo utilizar o Datagrip ou o Dbeaver, as informações para conexão com o banco estão dentro do arquivo .env

Divirta-se! =)

