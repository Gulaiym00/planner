import type { Request, Response } from "express";
import * as sphereService from "../services/sphereService.js";

type IdParams = { id: string };

export async function getSpheres(_req: Request, res: Response) {
  res.json(await sphereService.list(res.locals.query));
}

export async function createSphere(req: Request, res: Response) {
  res.status(201).json(await sphereService.create(req.body));
}

export async function updateSphere(req: Request<IdParams>, res: Response) {
  res.json(await sphereService.update(req.params.id, req.body));
}

export async function deleteSphere(req: Request<IdParams>, res: Response) {
  await sphereService.remove(req.params.id, res.locals.query.moveTo);
  res.status(204).end();
}
