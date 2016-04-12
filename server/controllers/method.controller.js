import { qsToJson, sendResp, joinExpanded, head } from '../util/utils';
import Method from '../models/method';
import Subject from '../models/subject';

export function allIndivids(req, resp) {
  const qs = qsToJson(req);

  const onSuccess = res => {
    const expand = qs.expand || [];
    const methodFids = res.data.map(method => method.fid);
    const promises = [
      expand.includes('types') ? Method.selectSubTypes({ individs: methodFids }) : void 0,
      expand.includes('subject') ? Subject.selectIndivids({ byMethods: methodFids }) : void 0,
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

  return Method.selectIndivids({ ...qs, ...qs.filter }).then(onSuccess, sendResp(resp));
}

export function individ(req, resp) {
  const { fid } = req.params;
  const expand = qsToJson(req).expand || [];
  const promises = [
    Method.selectIndividByFid(fid),
    expand.includes('types') ? Method.selectSubTypes({ individs: fid }) : void 0,
    expand.includes('subject') ? Subject.selectIndivids({ byMethods: fid }) : void 0,
  ];

  Promise.all(promises).then(results => {
    const method = results[0];
    const types = !results[1] || joinExpanded('methodFid', results[1].data);
    const subjects = !results[2] || joinExpanded('methodFid', results[2].data);

    if (typeof types !== 'boolean') {
      method.data.types = types[fid];
    }

    if (typeof subjects !== 'boolean') {
      method.data.subject = head(subjects[fid], {});
    }
    return sendResp(resp)(method);
  }, sendResp(resp));
}

export function allTypes(req, resp) {
  const qs = qsToJson(req);
  Method.selectTypes({ ...qs, ...qs.filter }).then(sendResp(resp), sendResp(resp));
}

export function subtypes(req, resp) {
  Method.selectSubTypes({
    ...qsToJson(req),
    types: req.params.fid,
  }).then(sendResp(resp), sendResp(resp));
}
