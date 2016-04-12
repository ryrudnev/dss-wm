import { qsToJson, sendResp, joinExpanded, head } from '../util/utils';
import Subject from '../models/subject';
import Method from '../models/method';
import Waste from '../models/waste';

export function allIndivids(req, resp) {
  const qs = qsToJson(req);

  const onSuccess = res => {
    const expand = qs.expand || [];
    const subjectFids = res.data.map(subject => subject.fid);
    const promises = [
      // expand.includes('types') ? Method.selectSubTypes({ individs: methodFids }) : void 0,
      expand.includes('waste') ? Waste.selectIndivids({ forSubjects: subjectFids }) : void 0,
      expand.includes('methods') ? Method.selectIndivids({ forSubjects: subjectFids }) : void 0,
      // expand.includes('located') ?
    ];

    if (promises.some(p => !!p)) {
      return Promise.all(promises).then(results => {
        const waste = !results[0] || joinExpanded('subjectFid', results[0].data);
        const methods = !results[1] || joinExpanded('subjectFid', results[1].data);

        const data = res.data.map(s => {
          const subject = s;
          if (typeof waste !== 'boolean') {
            subject.waste = waste[subject.fid] || [];
          }
          if (typeof methods !== 'boolean') {
            subject.methods = methods[subject.fid] || [];
          }
          return subject;
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

  return Subject.selectIndivids({ ...qs, ...qs.filter }).then(onSuccess, sendResp(resp));
}

export function individ(req, resp) {

}

export function allTypes(req, resp) {

}

export function subtypes(req, resp) {

}

export function searchStrategy(req, resp) {

}
