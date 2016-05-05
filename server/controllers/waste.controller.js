import { joinExpanded, flatten } from '../util/utils';
import { respondOk, respondError } from '../util/expressUtils';
import wasteStorage from '../models/waste.storage';
import subjectStorage from '../models/subject.storage';

export function getAllIndivids(req, res) {
  const { qs } = req;
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

      waste.data = waste.data.map(curWaste => {
        if (typeof types !== 'boolean') {
          curWaste.types = types[curWaste.fid] || [];
        }
        if (typeof subjects !== 'boolean') {
          curWaste.subject = subjects[curWaste.fid] || {};
        }
        return curWaste;
      });
    }
    respondOk.call(res, waste);
  }).catch(err => respondError.call(res, err));
}

export function getIndivid(req, res) {
  const { fid } = req.params;
  const exp = flatten([req.qs.expand]);
  return Promise.all([
    wasteStorage.selectIndividByFid(fid, req.qs),
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
    respondOk.call(res, waste);
  }).catch(err => respondError.call(res, err));
}

export function getAllTypes(req, res) {
  return wasteStorage.selectTypes(req.qs)
      .then(data => respondOk.call(res, data))
      .catch(err => respondError.call(res, err));
}

export function getOrigins(req, res) {
  return wasteStorage.selectOrigins(req.qs)
      .then(data => respondOk.call(res, data))
      .catch(err => respondError.call(res, err));
}

export function getHazardClasses(req, res) {
  return wasteStorage.selectHazardClasses(req.qs)
      .then(data => respondOk.call(res, data))
      .catch(err => respondError.call(res, err));
}

export function getAggregateStates(req, res) {
  return wasteStorage.selectAggregateStates(req.qs)
      .then(data => respondOk.call(res, data))
      .catch(err => respondError.call(res, err));
}

export function createIndivid(req, res) {
  const { type, forSubject } = req.body;
  return Promise.all([
    wasteStorage.typeExists(`${type}`, { falseAsReject: true }),
    subjectStorage.individExists(`${forSubject}`, { falseAsReject: true }),
  ]).then(() => wasteStorage.createIndivid(type, req.body))
      .then(data => respondOk.call(res, data))
      .catch(err => respondError.call(res, err));
}

export function updateIndivid(req, res) {
  const { fid } = req.params;
  const { forSubject } = req.body;
  return Promise.all([
    wasteStorage.individExists(`${fid}`, { falseAsReject: true }),
    forSubject ? subjectStorage.individExists(`${forSubject}`, { falseAsReject: true }) : 0,
  ]).then(() => wasteStorage.updateIndivid(fid, req.body))
      .then(data => respondOk.call(res, data))
      .catch(err => respondError.call(res, err));
}

export function deleteIndivid(req, res) {
  const { fid, forSubject } = req.params;
  return wasteStorage.individExists(`${fid}`, { falseAsReject: true })
      .then(() => wasteStorage.deleteIndivid(fid, { forSubject, falseAsReject: true }))
      .then(data => respondOk.call(res, data))
      .catch(err => respondError.call(res, err));
}

export function createType(req, res) {
  // TODO: Need check a type of methods
  return wasteStorage.createType('SpecificWaste', req.body)
      .then(data => respondOk.call(res, data))
      .catch(err => respondError.call(res, err));
}

export function updateType(req, res) {
  // TODO: Need check a type of methods
  const { fid } = req.params;
  return Promise.all([
    wasteStorage.typeExists(`${fid}`, { falseAsReject: true }),
  ]).then(() => wasteStorage.updateType(fid, req.body))
      .then(data => respondOk.call(res, data))
      .catch(err => respondError.call(res, err));
}

export function deleteType(req, res) {
  const { fid } = req.params;
  return wasteStorage.typeExists(`${fid}`, { falseAsReject: true })
      .then(() => wasteStorage.deleteType(fid))
      .then(data => respondOk.call(res, data))
      .catch(err => respondError.call(res, err));
}
