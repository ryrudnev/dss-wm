import { qsToJson } from '../util/utils';
import Method from '../models/method';

export function allIndivids(req, resp) {
  const qs = qsToJson(req);

  const cb = res => resp.status(res.code).json(res);
  const onSuccess = res => {
    const expand = qs.expand || [];
    const promises = [];

    if (expand.includes('types')) {
      promises.push(Method.selectSubTypes({
        individs: res.data.map(method => method.fid),
      }));
    }

    if (promises.length) {
      Promise.all(promises).then(results => {
        const types = results[0].data.reduce((previous, val) => {
          const cur = previous;
          const { methodFid, title, fid } = val;
          if (!cur[methodFid]) {
            cur[methodFid] = [];
          }
          cur[methodFid].push({ title, fid });
          return cur;
        }, {});
        const data = res.data.map(method => ({
          ...method,
          types: types[method.fid],
        }));
        resp.status(res.code).json({ ...res, data });
      }, cb);
    } else {
      cb(res);
    }
  };

  Method.selectIndivids({ ...qs, ...qs.filter }).then(onSuccess, cb);
}

export function individ(req, resp) {
  const cb = res => resp.status(res.code).json(res);

  const expand = qsToJson(req).expand || [];
  const promises = [Method.selectIndividByFid(req.params.fid)];

  if (expand.includes('types')) {
    promises.push(Method.selectSubTypes({ individs: req.params.fid }));
  }

  Promise.all(promises).then(results => {
    const [method, types] = results;
    const data = { ...method.data };
    if (types) {
      data.types = types.data.map(m => ({ title: m.title, fid: m.fid }));
    }
    resp.status(method.code).json({ ...method, data });
  }, cb);
}

export function allTypes(req, resp) {
  const qs = qsToJson(req);
  const cb = res => resp.status(res.code).json(res);
  Method.selectTypes({ ...qs, ...qs.filter }).then(cb, cb);
}

export function subtypes(req, resp) {
  const cb = res => resp.status(res.code).json(res);
  Method.selectSubTypes({ ...qsToJson(req), types: req.params.fid }).then(cb, cb);
}
