import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from './connection.js';
import { Neighborhood } from '../modules/addresses/neighborhood.model.js';
import { Address } from '../modules/addresses/address.model.js';
import { Schedule } from '../modules/schedules/schedule.model.js';
import { User } from '../modules/auth/user.model.js';
import { env } from '../config/env.js';

async function run() {
  await connectDatabase();
  await Promise.all([
    Neighborhood.deleteMany({}),
    Address.deleteMany({}),
    Schedule.deleteMany({}),
    User.deleteMany({})
  ]);

  const neighborhoodsData = [
    { name: 'Centro' },
    { name: 'Jardim América' },
    { name: 'Vila Nova' }
  ];
  const neighborhoods = await Neighborhood.insertMany(neighborhoodsData);

  const findNeighborhood = (name) => neighborhoods.find((n) => n.name === name);

  const addressesData = [
    { neighborhoodId: findNeighborhood('Centro')._id, street: 'Rua das Flores, 123' },
    { neighborhoodId: findNeighborhood('Centro')._id, street: 'Praça da Matriz, 789' },
    { neighborhoodId: findNeighborhood('Centro')._id, street: 'Rua do Comércio, 555' },
    { neighborhoodId: findNeighborhood('Jardim América')._id, street: 'Avenida Principal, 456' },
    { neighborhoodId: findNeighborhood('Jardim América')._id, street: 'Alameda dos Anjos, 202' },
    { neighborhoodId: findNeighborhood('Vila Nova')._id, street: 'Rua dos Pinheiros, 101' },
    { neighborhoodId: findNeighborhood('Vila Nova')._id, street: 'Travessa das Pedras, 303' }
  ];
  const addresses = await Address.insertMany(addressesData);

  const findAddress = (street) => addresses.find((a) => a.street === street);

  const schedulesData = [
    {
      protocol: '1',
      type: 'poda',
      date: new Date('2025-09-09T03:00:00.000Z'),
      addressId: findAddress('Rua das Flores, 123')._id,
      neighborhoodName: 'Centro',
      addressText: 'Rua das Flores, 123',
      requesterName: 'João da Silva',
      cpfCnpj: '11122233344',
      phone: '11987654321',
      description: 'Galhos de uma árvore pequena',
      status: 'Agendado',
      qrcodePayload: `${env.baseUrl}/verify/1`
    },
    {
      protocol: '3',
      type: 'poda',
      date: new Date('2025-09-09T03:00:00.000Z'),
      addressId: findAddress('Praça da Matriz, 789')._id,
      neighborhoodName: 'Centro',
      addressText: 'Praça da Matriz, 789',
      requesterName: 'Carlos Pereira',
      cpfCnpj: '33344455566',
      phone: '11987654323',
      description: 'Folhas de coqueiro',
      status: 'Agendado',
      qrcodePayload: `${env.baseUrl}/verify/3`
    },
    {
      protocol: '4',
      type: 'poda',
      date: new Date('2025-09-09T03:00:00.000Z'),
      addressId: findAddress('Rua dos Pinheiros, 101')._id,
      neighborhoodName: 'Vila Nova',
      addressText: 'Rua dos Pinheiros, 101',
      requesterName: 'Ana Souza',
      cpfCnpj: '44455566677',
      phone: '11987654324',
      description: 'Poda de cerca-viva',
      status: 'Agendado',
      qrcodePayload: `${env.baseUrl}/verify/4`
    },
    {
      protocol: '2',
      type: 'moveis',
      date: new Date('2025-09-10T03:00:00.000Z'),
      addressId: findAddress('Avenida Principal, 456')._id,
      neighborhoodName: 'Jardim América',
      addressText: 'Avenida Principal, 456',
      requesterName: 'Maria Oliveira',
      cpfCnpj: '22233344455',
      phone: '11987654322',
      description: 'Um sofá antigo',
      status: 'Agendado',
      qrcodePayload: `${env.baseUrl}/verify/2`
    },
    {
      protocol: '5',
      type: 'moveis',
      date: new Date('2025-09-10T03:00:00.000Z'),
      addressId: findAddress('Alameda dos Anjos, 202')._id,
      neighborhoodName: 'Jardim América',
      addressText: 'Alameda dos Anjos, 202',
      requesterName: 'Pedro Costa',
      cpfCnpj: '55566677788',
      phone: '11987654325',
      description: 'Cama de casal',
      status: 'Agendado',
      qrcodePayload: `${env.baseUrl}/verify/5`
    },
    {
      protocol: '6',
      type: 'moveis',
      date: new Date('2025-09-10T03:00:00.000Z'),
      addressId: findAddress('Travessa das Pedras, 303')._id,
      neighborhoodName: 'Vila Nova',
      addressText: 'Travessa das Pedras, 303',
      requesterName: 'Beatriz Lima',
      cpfCnpj: '66677788899',
      phone: '11987654326',
      description: 'Guarda-roupa desmontado',
      status: 'Agendado',
      qrcodePayload: `${env.baseUrl}/verify/6`
    },
    {
      protocol: '12',
      type: 'vidro-eletronicos',
      date: new Date('2025-09-11T03:00:00.000Z'),
      addressId: findAddress('Alameda dos Anjos, 202')._id,
      neighborhoodName: 'Jardim América',
      addressText: 'Alameda dos Anjos, 202',
      requesterName: 'Sandra Dias',
      cpfCnpj: '23456789012',
      phone: '11987654332',
      description: 'TV antiga e garrafas',
      status: 'Agendado',
      qrcodePayload: `${env.baseUrl}/verify/12`
    },
    {
      protocol: '13',
      type: 'vidro-eletronicos',
      date: new Date('2025-09-11T03:00:00.000Z'),
      addressId: findAddress('Travessa das Pedras, 303')._id,
      neighborhoodName: 'Vila Nova',
      addressText: 'Travessa das Pedras, 303',
      requesterName: 'Roberto Nunes',
      cpfCnpj: '34567890123',
      phone: '11987654333',
      description: 'Microondas quebrado',
      status: 'Agendado',
      qrcodePayload: `${env.baseUrl}/verify/13`
    },
    {
      protocol: '14',
      type: 'poda',
      date: new Date('2025-09-16T03:00:00.000Z'),
      addressId: findAddress('Rua do Comércio, 555')._id,
      neighborhoodName: 'Centro',
      addressText: 'Rua do Comércio, 555',
      requesterName: 'Felipe Andrade',
      cpfCnpj: '45678901234',
      phone: '11987654334',
      description: 'Pequenos arbustos',
      status: 'Agendado',
      qrcodePayload: `${env.baseUrl}/verify/14`
    },
    {
      protocol: '15',
      type: 'poda',
      date: new Date('2025-09-09T03:00:00.000Z'),
      addressId: findAddress('Rua do Comércio, 555')._id,
      neighborhoodName: 'Centro',
      addressText: 'Rua do Comércio, 555',
      requesterName: 'Mariana Costa',
      cpfCnpj: '55512345678',
      phone: '11912345678',
      description: 'Poda de roseiras',
      status: 'Concluído',
      qrcodePayload: `${env.baseUrl}/verify/15`
    }
  ];
  await Schedule.insertMany(schedulesData);

  const usersData = [
    {
      role: 'admin',
      email: 'admin@recolhafacil.com',
      passwordHash: await bcrypt.hash('admin123', 10),
      isActive: true
    },
    {
      role: 'driver',
      email: 'driver@recolhafacil.com',
      passwordHash: await bcrypt.hash('driver123', 10),
      isActive: true
    }
  ];
  await User.insertMany(usersData);

  console.log('Seed concluído');
  await disconnectDatabase();
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
