export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'RecolhaFácil API',
    version: '1.0.0',
    description: 'Documentação oficial da API do sistema de agendamento de recolhas.'
  },
  servers: [{ url: '/api' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      Schedule: {
        type: 'object',
        properties: {
          protocol: { type: 'string' },
          type: { type: 'string', enum: ['poda', 'moveis', 'vidro-eletronicos'] },
          date: { type: 'string', format: 'date' },
          neighborhoodName: { type: 'string' },
          addressText: { type: 'string' },
          requesterName: { type: 'string' },
          cpfCnpj: { type: 'string' },
          phone: { type: 'string' },
          description: { type: 'string' },
          status: { type: 'string', enum: ['Agendado', 'Concluído'] },
          driverPhotoUrl: { type: 'string' }
        }
      }
    }
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Realiza login e retorna um token JWT',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', format: 'password' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Login realizado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    token: { type: 'string' },
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        role: { type: 'string' },
                        email: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          },
          '401': { description: 'Credenciais inválidas' },
          '422': { description: 'Dados inválidos' }
        }
      }
    },
    '/schedules': {
      post: {
        tags: ['Schedules'],
        summary: 'Cria um novo agendamento (público)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['type', 'date', 'addressId', 'requesterName', 'cpfCnpj', 'phone'],
                properties: {
                  type: { type: 'string' },
                  date: { type: 'string', format: 'date' },
                  addressId: { type: 'string' },
                  requesterName: { type: 'string' },
                  cpfCnpj: { type: 'string' },
                  phone: { type: 'string' },
                  description: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Agendamento criado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    protocol: { type: 'string' },
                    qrcodeUrl: { type: 'string' }
                  }
                }
              }
            }
          },
          '409': { description: 'Regra de negócio violada' },
          '422': { description: 'Validação' }
        }
      },
      get: {
        tags: ['Schedules'],
        summary: 'Lista agendamentos (admin)',
        parameters: [
          { in: 'query', name: 'q', schema: { type: 'string' } },
          { in: 'query', name: 'date', schema: { type: 'string', format: 'date' } },
          { in: 'query', name: 'status', schema: { type: 'string' } },
          { in: 'query', name: 'type', schema: { type: 'string' } },
          { in: 'query', name: 'page', schema: { type: 'integer' } },
          { in: 'query', name: 'limit', schema: { type: 'integer' } }
        ],
        responses: {
          '200': {
            description: 'Lista de agendamentos',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Schedule' }
                    },
                    total: { type: 'integer' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/schedules/{protocol}': {
      get: {
        tags: ['Schedules'],
        summary: 'Obtém um agendamento',
        parameters: [{ in: 'path', name: 'protocol', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Agendamento encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Schedule' }
              }
            }
          },
          '404': { description: 'Não encontrado' }
        }
      },
      delete: {
        tags: ['Schedules'],
        summary: 'Remove (soft-delete) um agendamento',
        parameters: [{ in: 'path', name: 'protocol', required: true, schema: { type: 'string' } }],
        responses: {
          '204': { description: 'Removido' },
          '404': { description: 'Não encontrado' }
        }
      }
    },
    '/schedules/{protocol}/complete': {
      patch: {
        tags: ['Schedules'],
        summary: 'Conclui um agendamento com upload de foto',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  photo: { type: 'string', format: 'binary' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Agendamento concluído' },
          '404': { description: 'Não encontrado' },
          '422': { description: 'Foto obrigatória' }
        }
      }
    },
    '/schedules/availability/{type}': {
      get: {
        tags: ['Schedules'],
        summary: 'Consulta datas indisponíveis para um tipo',
        parameters: [{ in: 'path', name: 'type', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Lista de datas indisponíveis',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    unavailableDates: {
                      type: 'array',
                      items: { type: 'string', format: 'date' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/schedules/today': {
      get: {
        tags: ['Schedules'],
        summary: 'Lista agendamentos do dia para motoristas',
        responses: {
          '200': {
            description: 'Agendamentos do dia',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Schedule' }
                }
              }
            }
          }
        }
      }
    },
    '/verify/{protocol}': {
      get: {
        tags: ['Public'],
        summary: 'Consulta pública de agendamento por protocolo',
        parameters: [{ in: 'path', name: 'protocol', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Dados públicos do agendamento',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Schedule' }
              }
            }
          },
          '404': { description: 'Não encontrado' }
        }
      }
    },
    '/addresses/neighborhoods': {
      get: {
        tags: ['Addresses'],
        summary: 'Lista bairros',
        responses: { '200': { description: 'Lista retornada' } }
      },
      post: {
        tags: ['Addresses'],
        summary: 'Cria bairro',
        responses: { '201': { description: 'Criado' } }
      }
    },
    '/addresses/neighborhoods/{id}': {
      delete: {
        tags: ['Addresses'],
        summary: 'Remove bairro',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { '204': { description: 'Removido' } }
      }
    },
    '/addresses': {
      get: {
        tags: ['Addresses'],
        summary: 'Lista endereços',
        parameters: [
          { in: 'query', name: 'neighborhoodId', schema: { type: 'string' } },
          { in: 'query', name: 'search', schema: { type: 'string' } }
        ],
        responses: { '200': { description: 'Lista retornada' } }
      },
      post: {
        tags: ['Addresses'],
        summary: 'Cria endereço',
        responses: { '201': { description: 'Criado' } }
      }
    },
    '/addresses/{id}': {
      delete: {
        tags: ['Addresses'],
        summary: 'Remove endereço',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { '204': { description: 'Removido' } }
      }
    },
    '/public/addresses': {
      get: {
        tags: ['Public'],
        summary: 'Lista endereços públicos para agendamento',
        parameters: [{ in: 'query', name: 'search', schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Lista de endereços',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      street: { type: 'string' },
                      neighborhood: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/stats/today': {
      get: {
        tags: ['Stats'],
        summary: 'Estatísticas do dia',
        responses: { '200': { description: 'Retorna estatísticas' } }
      }
    },
    '/stats/totals': {
      get: {
        tags: ['Stats'],
        summary: 'Totais gerais',
        responses: { '200': { description: 'Retorna totais' } }
      }
    }
  }
};
