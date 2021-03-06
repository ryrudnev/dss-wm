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

      method.data = method.data.map(curMethod => {
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
    methodStorage.selectIndividByFid(fid, req.qs),
    exp.includes('subtype') ? methodStorage.selectTypes({ individs: fid, subtypes: true }) : 0,
    exp.includes('types') ? methodStorage.selectTypes({ individs: fid }) : 0,
    exp.includes('subject') ? subjectStorage.selectIndivids({ byMethods: fid }) : 0,
  ]).then(results => {
    const [method] = results;
    let [, subtype, types, subjects] = results;
    subtype = !subtype || joinExpanded('methodFid', subtype.data, true);
    types = !types || joinExpanded('methodFid', types.data);
    subjects = !subjects || joinExpanded('methodFid', subjects.data, true);

    if (typeof subtype !== 'boolean') {
      method.data.subtype = subtype[fid] || {};
    }
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
    methodStorage.typeExists(`${type}`, { falseAsReject: true }),
    subjectStorage.individExists(`${forSubject}`, { falseAsReject: true }),
  ]).then(() => methodStorage.createIndivid(type, req.body))
      .then(data => respondOk.call(res, data))
      .catch(err => respondError.call(res, err));
}

export function updateIndivid(req, res) {
  const { fid } = req.params;
  const { forSubject } = req.body;
  return Promise.all([
    methodStorage.individExists(`${fid}`, { falseAsReject: true }),
    forSubject ? subjectStorage.individExists(`${forSubject}`, { falseAsReject: true }) : 0,
  ]).then(() => methodStorage.updateIndivid(fid, req.body))
      .then(data => respondOk.call(res, data))
      .catch(err => respondError.call(res, err));
}

export function deleteIndivid(req, res) {
  const { fid, forSubject } = req.params;
  return methodStorage.individExists(`${fid}`, { falseAsReject: true })
      .then(() => methodStorage.deleteIndivid(fid, { forSubject, falseAsReject: true }))
      .then(data => respondOk.call(res, data))
      .catch(err => respondError.call(res, err));
}

export function getType(req, res) {
  const { fid } = req.params;
  return methodStorage.selectTypeByFid(`${fid}`)
    .then(data => respondOk.call(res, data))
    .catch(err => respondError.call(res, err));
}

export function deleteType(req, res) {
  const { fid } = req.params;
  return methodStorage.typeExists(`${fid}`, { falseAsReject: true })
    .then(() => methodStorage.deleteType(fid))
    .then(data => respondOk.call(res, data))
    .catch(err => respondError.call(res, err));
}

export function createType(req, res) {
  return methodStorage.createType('Method', req.body)
    .then(data => respondOk.call(res, data))
    .catch(err => respondError.call(res, err));
}

export function updateType(req, res) {
  const { fid } = req.params;
  return Promise.all([
    methodStorage.typeExists(`${fid}`, { falseAsReject: true }),
  ]).then(() => methodStorage.updateType(fid, req.body))
    .then(data => respondOk.call(res, data))
    .catch(err => respondError.call(res, err));
}
