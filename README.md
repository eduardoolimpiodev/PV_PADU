# User Data Processor

Teste de sistema para processamento e armazenamento de dados de usuários em múltiplos formatos (CSV, JSON, XML) com API REST.

## Funcionalidades

- Upload e processamento de arquivos CSV, JSON e XML
- Armazenamento em banco de dados PostgreSQL
- API REST para upload e consulta de dados
- Validação robusta de dados e formatos
- Arquitetura extensível para novos formatos

## Tecnologias

- Node.js + TypeScript
- Express.js
- TypeORM + PostgreSQL
- Multer (upload de arquivos)
- Joi (validação)

## Configuração

1. Copie `.env.example` para `.env` e configure as variáveis
2. Execute `npm install` para instalar dependências
3. Configure o banco de dados PostgreSQL
4. Execute `npm run dev` para desenvolvimento

## API Endpoints

- `POST /api/users/upload` - Upload de arquivo
- `GET /api/users` - Consulta de usuários
