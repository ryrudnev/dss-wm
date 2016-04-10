import { qsToJson } from '../util/utils';
import Waste from '../models/waste';

export function allIndivids(req, res) {
  const qs = qsToJson(req);
  Waste.selectIndividis({ ...qs, ...qs.filter })
    .then(result => res.status(result.code).json(result));
}

export function individ(req, res) {
  Waste.selectIndividByFid(req.params.fid)
    .then(result => {
      const { success, data } = result;
      const r = success && !data.length ? {
        success: false,
        code: 404,
        message: 'Not found',
        data: null,
      } : result;

      res.status(r.code).json(r);
    });
}

export function allTypes(req, res) {
  const qs = qsToJson(req);
  Waste.selectTypes({ ...qs, ...qs.filter })
    .then(result => res.status(result.code).json(result));
}

export function type() {

}

export function origins() {

}

export function hazardClasses() {

}

export function aggregateStates() {

}
