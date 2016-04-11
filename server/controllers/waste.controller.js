import { qsToJson } from '../util/utils';
import Waste from '../models/waste';

export function allIndivids(req, resp) {
  const qs = qsToJson(req);

  const cb = res => resp.status(res.code).json(res);
  const onSuccess = res => {
    const expand = qs.expand || [];
    const promises = [];

    if (expand.includes('types')) {
      promises.push(Waste.selectSubTypes({
        individs: res.data.map(waste => waste.fid),
      }));
    }

    if (promises.length) {
      Promise.all(promises).then(results => {
        const types = results[0].data.reduce((previous, val) => {
          const cur = previous;
          const { wasteFid, title, subtypeFid } = val;
          if (!cur[wasteFid]) {
            cur[wasteFid] = [];
          }
          cur[wasteFid].push({ title, subtypeFid });
          return cur;
        }, {});

        const data = res.data.map(waste => ({
          ...waste,
          types: types[waste.fid],
        }));
        /*
        const [types] = results;
        const data = res.data.map(waste => ({
          ...waste,
          types: types.data.filter(type => type.wasteFid === waste.fid),
        }));
        */
        resp.status(res.code).json({ ...res, data });
      }, cb);
    } else {
      cb(res);
    }
  };

  Waste.selectIndividis({ ...qs, ...qs.filter }).then(onSuccess, cb);
}

export function individ(req, resp) {
  const cb = res => resp.status(res.code).json(res);

  const expand = qsToJson(req).expand || [];
  const promises = [Waste.selectIndividByFid(req.params.fid)];

  if (expand.includes('types')) {
    promises.push(Waste.selectSubTypes({ individs: req.params.fid }));
  }

  Promise.all(promises).then(results => {
    const [waste, types] = results;
    const data = { ...waste.data };
    if (types) {
      data.types = types.data.map(w => ({ title: w.title, subtypeFid: w.subtypeFid }));
    }
    resp.status(waste.code).json({ ...waste, data });
  }, cb);
}

export function allTypes(req, resp) {
  const qs = qsToJson(req);
  const cb = res => resp.status(res.code).json(res);
  Waste.selectTypes({ ...qs, ...qs.filter }).then(cb, cb);
}

export function subtypes(req, resp) {
  const cb = res => resp.status(res.code).json(res);
  Waste.selectSubTypes({ ...qsToJson(req), types: req.params.fid }).then(cb, cb);
}

export function origins(req, resp) {
  const cb = res => resp.status(res.code).json(res);
  Waste.selectOrigins({ ...qsToJson(req) }).then(cb, cb);
}

export function hazardClasses(req, resp) {
  const cb = res => resp.status(res.code).json(res);
  Waste.selectHazardClasses({ ...qsToJson(req) }).then(cb, cb);
}

export function aggregateStates(req, resp) {
  const cb = res => resp.status(res.code).json(res);
  Waste.selectAggregateStates({ ...qsToJson(req) }).then(cb, cb);
}
