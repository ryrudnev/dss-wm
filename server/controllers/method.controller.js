import { qsToJson, onSendResp, joinExpanded, onError } from '../util/utils';
import Method from '../models/method.model';
import Subject from '../models/subject.model';

export function allIndivids(req, resp) {
  const qs = qsToJson(req);
  const exp = qs.expand || [];

  return Method.selectIndivids(qs).then(method => {
    const methodFids = method.data.map(m => m.fid);
    return Promise.all([
      method,
      exp.includes('types') ? Method.selectTypes({ individs: methodFids }) : 0,
      exp.includes('subject') ? Subject.selectIndivids({ byMethods: methodFids }) : 0,
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

export function individ(req, resp) {
  const { fid } = req.params;
  const exp = qsToJson(req).expand || [];

  return Promise.all([
    Method.selectIndividByFid(fid),
    exp.includes('types') ? Method.selectTypes({ individs: fid }) : 0,
    exp.includes('subject') ? Subject.selectIndivids({ byMethods: fid }) : 0,
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

export function allTypes(req, resp) {
  return Method.selectTypes(qsToJson(req)).then(onSendResp(resp)).catch(onSendResp(resp));
}

export function createIndivid(req, resp) {
  const { type, forSubject } = req.body;
  return Promise.all([
    Method.typeExists(`${type}`),
    Subject.individExists(`${forSubject}`),
  ]).then(results => {
    if (!results.every(p => p.data.boolean)) {
      return onError({
        success: false,
        code: 404,
        message: 'Not specified or there is no such a subject and a type of method',
        data: null,
      });
    }
    return Method.createIndivid(forSubject, req.body);
  }).then(onSendResp(resp)).catch(onSendResp(resp));
}

export function updateIndivid(req, resp) {
  const { fid } = req.params;
  const { forSubject } = req.body;

  return Promise.all([
    Method.individExists(`${fid}`),
    forSubject ? Subject.individExists(`${forSubject}`) : 0,
  ]).then(([existsFid, existsSubject]) => {
    if (!existsFid.data.boolean) {
      return onError({
        success: false,
        code: 404,
        message: 'Not found',
        data: null,
      });
    }
    if (existsSubject && !existsSubject.data.boolean) {
      return onError({
        success: false,
        code: 404,
        message: 'Not specified the valid subject',
        data: null,
      });
    }
    return Method.updateIndivid(fid, req.body);
  }).then(onSendResp(resp)).catch(onSendResp(resp));
}

export function deleteIndivid(req, resp) {
  const { fid } = req.params;
  return Method.individExists(`${fid}`).then(res => {
    if (!res.data.boolean) {
      return onError({
        success: false,
        code: 404,
        message: 'Not found',
        data: null,
      });
    }
    return Method.deleteIndivid(fid);
  }).then(onSendResp(resp)).catch(onSendResp(resp));
}
