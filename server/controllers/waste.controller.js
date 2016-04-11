import { qsToJson } from '../util/utils';
import Waste from '../models/waste';

export function allIndivids(req, resp) {
  const qs = qsToJson(req);
  Waste.selectIndividis({ ...qs, ...qs.filter })
      .then(result => resp.status(result.code).json(result));
}

export function individ(req, resp) {
  Waste.selectIndividByFid(req.params.fid)
      .then(result => resp.status(result.code).json(result));
}

export function allTypes(req, res) {
  const qs = qsToJson(req);
  Waste.selectTypes({ ...qs, ...qs.filter })
      .then(result => res.status(result.code).json(result));
}

export function subtypes(req, res) {
  Waste.selectSubTypes({ types: req.params.fid })
      .then(result => res.status(result.code).json(result));
}

export function origins(req, res) {
  Waste.selectOrigins()
      .then(result => res.status(result.code).json(result));
}

export function hazardClasses(req, res) {
  Waste.selectHazardClasses()
      .then(result => res.status(result.code).json(result));
}

export function aggregateStates(req, res) {
  Waste.selectAggregateStates()
      .then(result => res.status(result.code).json(result));
}
