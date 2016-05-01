import { joinExpanded, flatten } from '../util/utils';
import { respondOk, respondError } from '../util/expressUtils';
import methodStorage from '../models/method.storage';
import subjectStorage from '../models/subject.storage';

export function getAllIndivids(req, res) {
  const { qs } = req;
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
    respondOk.call(res, method);
  }).catch(err => respondError.call(res, err));
}

export function getIndivid(req, res) {
  const { fid } = req.params;
  const exp = flatten([req.qs.expand]);
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
    respondOk.call(res, method);
  }).catch(err => respondError.call(res, err));
}

export function getAllTypes(req, res) {
  return methodStorage.selectTypes(req.qs)
      .then(data => respondOk.call(res, data))
      .catch(err => respondError.call(res, err));
}

export function createIndivid(req, res) {
  const { type, forSubject } = req.body;
  return Promise.all([
    methodStorage.typeExists(`${type}`, true),
    subjectStorage.individExists(`${forSubject}`, true),
  ]).then(() => methodStorage.createIndivid(type, req.body))
      .then(data => respondOk.call(res, data))
      .catch(err => respondError.call(res, err));
}

export function updateIndivid(req, res) {
  const { fid } = req.params;
  const { forSubject } = req.body;
  return Promise.all([
    methodStorage.individExists(`${fid}`, true),
    forSubject ? subjectStorage.individExists(`${forSubject}`, true) : 0,
  ]).then(() => methodStorage.updateIndivid(fid, req.body))
      .then(data => respondOk.call(res, data))
      .catch(err => respondError.call(res, err));
}

export function deleteIndivid(req, res) {
  const { fid } = req.params;
  return methodStorage.individExists(`${fid}`, true).then(() => methodStorage.deleteIndivid(fid))
      .then(data => respondOk.call(res, data))
      .catch(err => respondError.call(res, err));
}
