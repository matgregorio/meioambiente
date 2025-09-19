# RecolhaFácil API

API em Node.js/Express responsável pelo agendamento de recolhas conforme requisitos do projeto.

## Requisitos
- Node.js 20+
- MongoDB 6+

## Configuração
1. Copie `.env.example` para `.env` e ajuste variáveis.
2. Instale dependências:
   ```bash
   npm install
   ```
3. Execute seeds (opcional):
   ```bash
   npm run seed
   ```

## Scripts
- `npm run dev`: inicia servidor em modo desenvolvimento com Nodemon.
- `npm run start`: inicia servidor em produção.
- `npm run test`: executa testes com Jest e Supertest.
- `npm run seed`: popula o banco com bairros, ruas, usuários e agendamentos de exemplo.

## Docker
```bash
docker-compose up --build
```
Serviço disponível em `http://localhost:8080`.

## Swagger
A documentação está disponível em `/docs` após iniciar o servidor.

## Perguntas Respondidas
- Persistência de arquivos: por padrão local (`UPLOADS_DIR`), com opção de usar S3 configurando storage customizado.
- Autenticação: tokens JWT armazenados em memória no frontend, com possibilidade futura de refresh + httpOnly cookies.
- Gestão de usuários: recomendado incluir futuramente, ainda não implementado.
- Rate limit: 10 requisições/min para criação de agendamentos (ajustável).
- Validação CPF/CNPJ: valida formato e dígitos; entradas inválidas são rejeitadas.
- LGPD: logs de auditoria mascaram dados sensíveis e recomendada retenção de 180 dias.
- Exportação: previsto endpoint futuro /api/schedules/export.
- Conclusão admin: mantém fluxo atual; foto obrigatória somente no painel do motorista.
- Internacionalização: estrutura preparada para i18n via arquivos de mensagens.
- Monitoramento: disponível rota `/healthz` e `/metrics` planejada para Prometheus.
