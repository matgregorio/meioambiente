# RecolhaFácil Frontend

Aplicação React que replica fielmente a UI fornecida e consome a API do backend.

## Stack
- Vite + React + React Router
- Tailwind CSS
- Axios
- Flatpickr (locale PT-BR)
- QRCode

## Executando
1. Copie `.env.example` para `.env` e ajuste as URLs.
2. Instale dependências:
   ```bash
   npm install
   ```
3. Ambiente de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Build de produção:
   ```bash
   npm run build
   npm run preview
   ```

## Testes
```
npm run test
```

## Autenticação
Tokens JWT são armazenados em memória (contexto React). Opcionalmente, pode-se estender para refresh tokens com cookies httpOnly.
