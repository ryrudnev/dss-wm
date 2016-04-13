import { qsToJson, sendResp, joinExpanded, head } from '../util/utils';
import Method from '../models/method';
import Subject from '../models/subject';

export function allIndivids(req, resp) {
  const qs = qsToJson(req);

  const onSuccess = res => {
    const exp = qs.expand || [];
    const methodFids = res.data.map(method => method.fid);
    const promises = [
      exp.includes('types') ? Method.selectTypes({ individs: methodFids }) : 0,
      exp.includes('subject') ? Subject.selectIndivids({ byMethods: methodFids }) : 0,
    ];

    if (promises.some(p => !!p)) {
      return Promise.all(promises).then(results => {
        const types = !results[0] || joinExpanded('methodFid', results[0].data);
        const subjects = !results[1] || joinExpanded('methodFid', results[1].data);

        const data = res.data.map(m => {
          const method = m;
          if (typeof types !== 'boolean') {
            method.types = types[method.fid] || [];
          }
          if (typeof subjects !== 'boolean') {
            method.subject = head(subjects[method.fid], {});
          }
          return method;
        });

        return sendResp(resp, {
          success: res.success,
          code: res.code,
          message: res.message,
          data,
        })(res);
      }, sendResp(resp));
    }

    return sendResp(resp)(res);
  };

  return Method.selectIndivids(qs).then(onSuccess, sendResp(resp));
}

export function individ(req, resp) {
  const { fid } = req.params;
  const exp = qsToJson(req).expand || [];
  const promises = [
    Method.selectIndividByFid(fid),
    exp.includes('types') ? Method.selectTypes({ individs: fid }) : 0,
    exp.includes('subject') ? Subject.selectIndivids({ byMethods: fid }) : 0,
  ];

  return Promise.all(promises).then(results => {
    const method = results[0];
    const types = !results[1] || joinExpanded('methodFid', results[1].data);
    const subjects = !results[2] || joinExpanded('methodFid', results[2].data);

    if (typeof types !== 'boolean') {
      method.data.types = types[fid] || [];
    }

    if (typeof subjects !== 'boolean') {
      method.data.subject = head(subjects[fid], {});
    }
    return sendResp(resp)(method);
  }, sendResp(resp));
}

export function allTypes(req, resp) {
  return Method.selectTypes(qsToJson(req)).then(sendResp(resp), sendResp(resp));
}
