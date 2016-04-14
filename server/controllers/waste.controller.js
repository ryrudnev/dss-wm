import { qsToJson, onSendResp, joinExpanded } from '../util/utils';
import Waste from '../models/waste';
import Subject from '../models/subject';

export function allIndivids(req, resp) {
  const qs = qsToJson(req);

  const onMainResolve = res => {
    const exp = qs.expand || [];
    const wasteFids = res.data.map(waste => waste.fid);
    const promises = [
      exp.includes('types') ? Waste.selectTypes({ individs: wasteFids }) : 0,
      exp.includes('subject') ? Subject.selectIndivids({ byWaste: wasteFids }) : 0,
    ];

    const onResolve = results => {
      let [types, subjects] = results;
      types = !types || joinExpanded('methodFid', types.data);
      subjects = !subjects || joinExpanded('methodFid', subjects.data, true);

      const data = res.data.map(w => {
        const waste = w;
        if (typeof types !== 'boolean') {
          waste.types = types[waste.fid] || [];
        }
        if (typeof subjects !== 'boolean') {
          waste.subject = subjects[waste.fid] || {};
        }
        return waste;
      });

      return onSendResp(resp)({
        success: res.success,
        code: res.code,
        message: res.message,
        data,
      });
    };

    if (promises.some(p => !!p)) {
      return Promise.all(promises).then(onResolve, onSendResp(resp));
    }
    return onSendResp(resp)(res);
  };

  return Waste.selectIndivids(qs).then(onMainResolve, onSendResp(resp));
}

export function individ(req, resp) {
  const { fid } = req.params;
  const exp = qsToJson(req).expand || [];
  const promises = [
    Waste.selectIndividByFid(fid),
    exp.includes('types') ? Waste.selectTypes({ individs: fid }) : 0,
    exp.includes('subject') ? Subject.selectIndivids({ byWaste: fid }) : 0,
  ];

  const onMainResolve = results => {
    const [waste] = results;
    let [, types, subjects] = results;
    types = !types || joinExpanded('wasteFid', types.data);
    subjects = !subjects || joinExpanded('wasteFid', subjects.data, true);

    if (typeof types !== 'boolean') {
      waste.data.types = types[fid] || [];
    }
    if (typeof subjects !== 'boolean') {
      waste.data.subject = subjects[fid] || {};
    }
    return onSendResp(resp)(waste);
  };

  return Promise.all(promises).then(onMainResolve, onSendResp(resp));
}

export function allTypes(req, resp) {
  return Waste.selectTypes(qsToJson(req)).then(onSendResp(resp), onSendResp(resp));
}

export function origins(req, resp) {
  return Waste.selectOrigins(qsToJson(req)).then(onSendResp(resp), onSendResp(resp));
}

export function hazardClasses(req, resp) {
  return Waste.selectHazardClasses(qsToJson(req)).then(onSendResp(resp), onSendResp(resp));
}

export function aggregateStates(req, resp) {
  return Waste.selectAggregateStates(qsToJson(req)).then(onSendResp(resp), onSendResp(resp));
}
