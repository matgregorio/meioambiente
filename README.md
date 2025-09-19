# RecolhaFácil

Monorepo contendo frontend (React) e backend (Node.js/Express) para o sistema de agendamento de recolhas.

## Estrutura
- `backend/`: API REST com Express, MongoDB, autenticação JWT, Swagger e testes com Jest/Supertest.
- `frontend/`: SPA em React + React Router replicando fielmente a UI fornecida, com Flatpickr (PT-BR), QR Code e React Testing Library.

## Executando com Docker
```bash
docker compose up --build
```
(frontend em `http://localhost:5173`, backend em `http://localhost:8080`).

## Desenvolvimento
Cada pasta possui README próprio com detalhes de configuração, scripts e respostas às perguntas funcionais.
