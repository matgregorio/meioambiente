import { z } from 'zod';
import { Address } from './address.model.js';
import { Neighborhood } from './neighborhood.model.js';
import { AppError } from '../../utils/errors.js';
import { createAuditLog } from '../common/auditLog.js';

const neighborhoodSchema = z.object({
  name: z.string().min(2)
});

const addressSchema = z.object({
  neighborhoodId: z.string().length(24),
  street: z.string().min(3)
});

export async function listNeighborhoods(req, res, next) {
  try {
    const neighborhoods = await Neighborhood.find({ deletedAt: null }).sort({ name: 1 });
    res.json(neighborhoods);
  } catch (err) {
    next(err);
  }
}

export async function createNeighborhood(req, res, next) {
  try {
    const data = neighborhoodSchema.parse(req.body);
    const neighborhood = await Neighborhood.create(data);
    await createAuditLog({
      action: 'NEIGHBORHOOD_CREATE',
      actorUserId: req.user?.id,
      entity: 'Neighborhood',
      entityId: neighborhood._id,
      after: neighborhood.toObject()
    });
    res.status(201).json(neighborhood);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(new AppError(422, 'Dados inválidos', err.errors));
    }
    next(err);
  }
}

export async function deleteNeighborhood(req, res, next) {
  try {
    const neighborhood = await Neighborhood.findOne({ _id: req.params.id, deletedAt: null });
    if (!neighborhood) throw new AppError(404, 'Bairro não encontrado');
    neighborhood.deletedAt = new Date();
    await neighborhood.save();
    await Address.updateMany({ neighborhoodId: neighborhood._id }, { deletedAt: new Date() });
    await createAuditLog({
      action: 'NEIGHBORHOOD_DELETE',
      actorUserId: req.user?.id,
      entity: 'Neighborhood',
      entityId: neighborhood._id,
      before: neighborhood.toObject()
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function listAddresses(req, res, next) {
  try {
    const { neighborhoodId, search } = req.query;
    const query = { deletedAt: null };
    if (neighborhoodId) query.neighborhoodId = neighborhoodId;
    if (search) query.street = { $regex: search, $options: 'i' };
    const addresses = await Address.find(query).sort({ street: 1 });
    res.json(addresses);
  } catch (err) {
    next(err);
  }
}

export async function listPublicAddresses(req, res, next) {
  try {
    const { search } = req.query;
    const query = { deletedAt: null };
    if (search) query.street = { $regex: search, $options: 'i' };
    const addresses = await Address.find(query)
      .populate('neighborhoodId')
      .sort({ street: 1 });
    const payload = addresses.map((addr) => ({
      id: addr._id,
      street: addr.street,
      neighborhood: addr.neighborhoodId?.name || ''
    }));
    res.json(payload);
  } catch (err) {
    next(err);
  }
}

export async function createAddress(req, res, next) {
  try {
    const data = addressSchema.parse(req.body);
    const neighborhood = await Neighborhood.findOne({ _id: data.neighborhoodId, deletedAt: null });
    if (!neighborhood) throw new AppError(404, 'Bairro não encontrado');
    const address = await Address.create(data);
    await createAuditLog({
      action: 'ADDRESS_CREATE',
      actorUserId: req.user?.id,
      entity: 'Address',
      entityId: address._id,
      after: address.toObject()
    });
    res.status(201).json(address);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(new AppError(422, 'Dados inválidos', err.errors));
    }
    next(err);
  }
}

export async function deleteAddress(req, res, next) {
  try {
    const address = await Address.findOne({ _id: req.params.id, deletedAt: null });
    if (!address) throw new AppError(404, 'Endereço não encontrado');
    address.deletedAt = new Date();
    await address.save();
    await createAuditLog({
      action: 'ADDRESS_DELETE',
      actorUserId: req.user?.id,
      entity: 'Address',
      entityId: address._id,
      before: address.toObject()
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
