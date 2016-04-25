import { qsToJson, onSendResp, joinExpanded, flatten } from '../util/utils';
import methodStorage from '../models/method.storage';
import subjectStorage from '../models/subject.storage';

export function getAllIndivids(req, resp) {
  const qs = qsToJson(req);
  const exp = flatten([qs.expand]);
  return methodStorage.selectIndivids(qs).then(method => {
    const methodFids = method.data.map(m => m.fid);
    return Promise.all([
      method,
      exp.includes('types') ? methodStorage.selectTypes({ individs: methodFids }) : 0,
      exp.includes('subject') ? subjectStorage.selectIndivids({ byMethods: methodFids }) : 0,
    ]);
  }).then(results => {
    const [method] = results;
    if (results.slice(1).some(p => !!p)) {
      let [, types, subjects] = results;
      types = !types || joinExpanded('methodFid', types.data);
      subjects = !subjects || joinExpanded('methodFid', subjects.data, true);

      method.data = method.data.map(m => {
        const curMethod = m;
        if (typeof types !== 'boolean') {
          curMethod.types = types[curMethod.fid] || [];
        }
        if (typeof subjects !== 'boolean') {
          curMethod.subject = subjects[curMethod.fid] || {};
        }
        return curMethod;
      });
    }
    return onSendResp(resp)(method);
  }).catch(onSendResp(resp));
}

export function getIndivid(req, resp) {
  const { fid } = req.params;
  const exp = flatten([qsToJson(req).expand]);
  return Promise.all([
    methodStorage.selectIndividByFid(fid),
    exp.includes('types') ? methodStorage.selectTypes({ individs: fid }) : 0,
    exp.includes('subject') ? subjectStorage.selectIndivids({ byMethods: fid }) : 0,
  ]).then(results => {
    const [method] = results;
    let [, types, subjects] = results;
    types = !types || joinExpanded('methodFid', types.data);
    subjects = !subjects || joinExpanded('methodFid', subjects.data, true);

    if (typeof types !== 'boolean') {
      method.data.types = types[fid] || [];
    }
    if (typeof subjects !== 'boolean') {
      method.data.subject = subjects[fid] || {};
    }
    return onSendResp(resp)(method);
  }).catch(onSendResp(resp));
}

export function getAllTypes(req, resp) {
  return methodStorage.selectTypes(qsToJson(req)).then(onSendResp(resp)).catch(onSendResp(resp));
}

export function createIndivid(req, resp) {
  const { type, forSubject } = req.body;
  return Promise.all([
    methodStorage.typeExists(`${type}`, true),
    subjectStorage.individExists(`${forSubject}`, true),
  ]).then(() => methodStorage.createIndivid(type, req.body))
      .then(onSendResp(resp)).catch(onSendResp(resp));
}

export function updateIndivid(req, resp) {
  const { fid } = req.params;
  const { forSubject } = req.body;
  return Promise.all([
    methodStorage.individExists(`${fid}`, true),
    forSubject ? subjectStorage.individExists(`${forSubject}`, true) : 0,
  ]).then(() => methodStorage.updateIndivid(fid, req.body))
      .then(onSendResp(resp)).catch(onSendResp(resp));
}

export function deleteIndivid(req, resp) {
  const { fid } = req.params;
  return methodStorage.individExists(`${fid}`, true).then(() => methodStorage.deleteIndivid(fid))
      .then(onSendResp(resp)).catch(onSendResp(resp));
}
