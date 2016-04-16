import { qsToJson, onSendResp, joinExpanded } from '../util/utils';
import Waste from '../models/waste.model';
import Subject from '../models/subject.model';

export function allIndivids(req, resp) {
  const qs = qsToJson(req);
  const exp = qs.expand || [];

  return Waste.selectIndivids(qs).then(waste => {
    const wasteFids = waste.data.map(w => w.fid);
    return Promise.all([
      waste,
      exp.includes('types') ? Waste.selectTypes({ individs: wasteFids }) : 0,
      exp.includes('subject') ? Subject.selectIndivids({ byWaste: wasteFids }) : 0,
    ]);
  }).then(results => {
    const [waste] = results;
    if (results.slice(1).some(p => !!p)) {
      let [types, subjects] = results;
      types = !types || joinExpanded('methodFid', types.data);
      subjects = !subjects || joinExpanded('methodFid', subjects.data, true);

      waste.data = waste.data.map(w => {
        const curWaste = w;
        if (typeof types !== 'boolean') {
          curWaste.types = types[curWaste.fid] || [];
        }
        if (typeof subjects !== 'boolean') {
          curWaste.subject = subjects[curWaste.fid] || {};
        }
        return curWaste;
      });
    }
    return onSendResp(resp)(waste);
  }).catch(onSendResp(resp));
}

export function individ(req, resp) {
  const { fid } = req.params;
  const exp = qsToJson(req).expand || [];

  return Promise.all([
    Waste.selectIndividByFid(fid),
    exp.includes('types') ? Waste.selectTypes({ individs: fid }) : 0,
    exp.includes('subject') ? Subject.selectIndivids({ byWaste: fid }) : 0,
  ]).then(results => {
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
  }).catch(onSendResp(resp));
}

export function allTypes(req, resp) {
  return Waste.selectTypes(qsToJson(req)).then(onSendResp(resp)).catch(onSendResp(resp));
}

export function origins(req, resp) {
  return Waste.selectOrigins(qsToJson(req)).then(onSendResp(resp)).catch(onSendResp(resp));
}

export function hazardClasses(req, resp) {
  return Waste.selectHazardClasses(qsToJson(req)).then(onSendResp(resp)).catch(onSendResp(resp));
}

export function aggregateStates(req, resp) {
  return Waste.selectAggregateStates(qsToJson(req)).then(onSendResp(resp)).catch(onSendResp(resp));
}
