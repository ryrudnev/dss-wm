import { qsToJson, onSendResp, joinExpanded } from '../util/utils';
import Method from '../models/method';
import Subject from '../models/subject';

export function allIndivids(req, resp) {
  const qs = qsToJson(req);

  const onMainResolve = res => {
    const exp = qs.expand || [];
    const methodFids = res.data.map(method => method.fid);
    const promises = [
      exp.includes('types') ? Method.selectTypes({ individs: methodFids }) : 0,
      exp.includes('subject') ? Subject.selectIndivids({ byMethods: methodFids }) : 0,
    ];

    const onResolve = results => {
      let [types, subjects] = results;
      types = !types || joinExpanded('methodFid', types.data);
      subjects = !subjects || joinExpanded('methodFid', subjects.data, true);

      const data = res.data.map(m => {
        const method = m;
        if (typeof types !== 'boolean') {
          method.types = types[method.fid] || [];
        }
        if (typeof subjects !== 'boolean') {
          method.subject = subjects[method.fid] || {};
        }
        return method;
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

  return Method.selectIndivids(qs).then(onMainResolve, onSendResp(resp));
}

export function individ(req, resp) {
  const { fid } = req.params;
  const exp = qsToJson(req).expand || [];
  const promises = [
    Method.selectIndividByFid(fid),
    exp.includes('types') ? Method.selectTypes({ individs: fid }) : 0,
    exp.includes('subject') ? Subject.selectIndivids({ byMethods: fid }) : 0,
  ];

  const onMainResolve = results => {
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
  };

  return Promise.all(promises).then(onMainResolve, onSendResp(resp));
}

export function allTypes(req, resp) {
  return Method.selectTypes(qsToJson(req)).then(onSendResp(resp), onSendResp(resp));
}
