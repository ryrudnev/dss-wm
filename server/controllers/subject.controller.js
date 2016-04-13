import { qsToJson, sendResp, joinExpanded } from '../util/utils';
import Subject from '../models/subject';
import Method from '../models/method';
import Waste from '../models/waste';

export function allIndivids(req, resp) {
  const qs = qsToJson(req);

  const onSuccess = res => {
    const exp = qs.expand || [];
    const subjectFids = res.data.map(subject => subject.fid);
    const promises = [
      exp.includes('waste') ? Waste.selectIndivids({ forSubjects: subjectFids }) : 0,
      exp.includes('methods') ? Method.selectIndivids({ forSubjects: subjectFids }) : 0,
      exp.includes('located') ? Subject.selectLocationsFor({ forSubjects: subjectFids }) : 0,
      exp.includes('types') ? Subject.selectSubTypes({ individs: subjectFids }) : 0,
    ];

    if (promises.some(p => !!p)) {
      return Promise.all(promises).then(results => {
        const waste = !results[0] || joinExpanded('subjectFid', results[0].data);
        const methods = !results[1] || joinExpanded('subjectFid', results[1].data);
        const locations = !results[2] || joinExpanded('subjectFid', results[2].data);
        const types = !results[3] || joinExpanded('subjectFid', results[3].data);

        const data = res.data.map(s => {
          const subject = s;
          if (typeof waste !== 'boolean') {
            subject.waste = waste[subject.fid] || [];
          }
          if (typeof methods !== 'boolean') {
            subject.methods = methods[subject.fid] || [];
          }
          if (typeof locations !== 'boolean') {
            subject.located = locations[subject.fid] || [];
          }
          if (typeof types !== 'boolean') {
            subject.types = types[subject.fid] || [];
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
  const { fid } = req.params;
  const exp = qsToJson(req).expand || [];
  const promises = [
    Subject.selectIndividByFid(fid),
    exp.includes('waste') ? Waste.selectIndivids({ forSubjects: fid }) : 0,
    exp.includes('methods') ? Method.selectIndivids({ forSubjects: fid }) : 0,
    exp.includes('located') ? Subject.selectLocationsFor({ forSubjects: fid }) : 0,
    exp.includes('types') ? Subject.selectSubTypes({ individs: fid }) : 0,
  ];

  Promise.all(promises).then(results => {
    const subject = results[0];
    const waste = !results[1] || joinExpanded('subjectFid', results[1].data);
    const methods = !results[2] || joinExpanded('subjectFid', results[2].data);
    const locations = !results[3] || joinExpanded('subjectFid', results[3].data);
    const types = !results[4] || joinExpanded('subjectFid', results[4].data);

    if (typeof types !== 'boolean') {
      subject.data.types = types[fid] || [];
    }

    if (typeof methods !== 'boolean') {
      subject.data.methods = methods[fid] || [];
    }

    if (typeof locations !== 'boolean') {
      subject.data.locations = locations[fid] || [];
    }

    if (typeof waste !== 'boolean') {
      subject.data.waste = waste[fid];
    }

    return sendResp(resp)(subject);
  }, sendResp(resp));
}

export function allTypes(req, resp) {
  const qs = qsToJson(req);
  Subject.selectTypes({ ...qs, ...qs.filter }).then(sendResp(resp), sendResp(resp));
}

export function subtypes(req, resp) {
  Subject.selectSubTypes({
    ...qsToJson(req),
    types: req.params.fid,
  }).then(sendResp(resp), sendResp(resp));
}

export function searchStrategy(req, resp) {

}
