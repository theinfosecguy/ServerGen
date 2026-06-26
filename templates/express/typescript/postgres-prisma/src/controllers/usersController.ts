import type { NextFunction, Request, Response } from 'express';
import { getPrisma } from '../lib/prisma.js';

const getErrorCode = (err: unknown) => (
  typeof err === 'object' && err !== null && 'code' in err
    ? String((err as { code: unknown }).code)
    : undefined
);

const parseUserId = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return undefined;
  }
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : undefined;
};

const getUserPayload = (body: unknown) => {
  if (typeof body !== 'object' || body === null) {
    return { error: 'Request body must be a JSON object.' };
  }

  const payload = body as { email?: unknown; name?: unknown };
  const email = typeof payload.email === 'string' ? payload.email.trim() : '';
  const name = typeof payload.name === 'string' ? payload.name.trim() : undefined;

  if (!email || !email.includes('@')) {
    return { error: 'A valid email is required.' };
  }

  return {
    data: {
      email,
      name: name || undefined,
    },
  };
};

export const listUsers = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const users = await getPrisma().user.findMany({
      orderBy: { id: 'asc' },
    });
    res.status(200).json({ users });
  } catch (err) {
    next(err);
  }
};

export const getUser = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const id = parseUserId(req.params.id);
  if (!id) {
    res.status(400).json({ error: 'A positive numeric user ID is required.' });
    return;
  }

  try {
    const user = await getPrisma().user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

export const createUser = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const payload = getUserPayload(req.body);
  if ('error' in payload) {
    res.status(400).json({ error: payload.error });
    return;
  }

  try {
    const user = await getPrisma().user.create({ data: payload.data });
    res.status(201).json({ user });
  } catch (err) {
    if (getErrorCode(err) === 'P2002') {
      res.status(409).json({ error: 'A user with this email already exists.' });
      return;
    }
    next(err);
  }
};

export const deleteUser = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const id = parseUserId(req.params.id);
  if (!id) {
    res.status(400).json({ error: 'A positive numeric user ID is required.' });
    return;
  }

  try {
    await getPrisma().user.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    if (getErrorCode(err) === 'P2025') {
      res.status(404).json({ error: 'User not found.' });
      return;
    }
    next(err);
  }
};
