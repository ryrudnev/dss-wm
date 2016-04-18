import { qsToJson, onSendResp, joinExpanded, flatten } from '../util/utils';
import wasteStorage from '../models/waste.storage';
import subjectStorage from '../models/subject.storage';

export function allIndivids(req, resp) {
  const qs = qsToJson(req);
  const exp = flatten([qs.expand]);
  return wasteStorage.selectIndivids(qs).then(waste => {
    const wasteFids = waste.data.map(w => w.fid);
    return Promise.all([
      waste,
      exp.includes('types') ? wasteStorage.selectTypes({ individs: wasteFids }) : 0,
      exp.includes('subject') ? subjectStorage.selectIndivids({ byWaste: wasteFids }) : 0,
    ]);
  }).then(results => {
    const [waste] = results;
    if (results.slice(1).some(p => !!p)) {
      let [, types, subjects] = results;
      types = !types || joinExpanded('wasteFid', types.data);
      subjects = !subjects || joinExpanded('wasteFid', subjects.data, true);

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
  const exp = flatten([qsToJson(req).expand]);
  return Promise.all([
    wasteStorage.selectIndividByFid(fid),
    exp.includes('types') ? wasteStorage.selectTypes({ individs: fid }) : 0,
    exp.includes('subject') ? subjectStorage.selectIndivids({ byWaste: fid }) : 0,
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
  return wasteStorage.selectTypes(qsToJson(req))
      .then(onSendResp(resp)).catch(onSendResp(resp));
}

export function origins(req, resp) {
  return wasteStorage.selectOrigins(qsToJson(req))
      .then(onSendResp(resp)).catch(onSendResp(resp));
}

export function hazardClasses(req, resp) {
  return wasteStorage.selectHazardClasses(qsToJson(req))
      .then(onSendResp(resp)).catch(onSendResp(resp));
}

export function aggregateStates(req, resp) {
  return wasteStorage.selectAggregateStates(qsToJson(req))
      .then(onSendResp(resp)).catch(onSendResp(resp));
}
