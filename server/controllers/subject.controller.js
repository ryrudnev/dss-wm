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
      exp.includes('types') ? Subject.selectTypes({ individs: subjectFids }) : 0,
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

  return Subject.selectIndivids(qs).then(onSuccess, sendResp(resp));
}

export function individ(req, resp) {
  const { fid } = req.params;
  const exp = qsToJson(req).expand || [];
  const promises = [
    Subject.selectIndividByFid(fid),
    exp.includes('waste') ? Waste.selectIndivids({ forSubjects: fid }) : 0,
    exp.includes('methods') ? Method.selectIndivids({ forSubjects: fid }) : 0,
    exp.includes('located') ? Subject.selectLocationsFor({ forSubjects: fid }) : 0,
    exp.includes('types') ? Subject.selectTypes({ individs: fid }) : 0,
  ];

  return Promise.all(promises).then(results => {
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
  return Subject.selectTypes(qsToJson(req)).then(sendResp(resp), sendResp(resp));
}

// Generate waste management strategy for the subject by FID
export function searchStrategy(req, resp) {
  const { fid } = req.params;
  return Promise.all([
    // Select the information of a subject and own waste
    Subject.selectIndividByFid(fid),
    Waste.selectIndivids({ forSubjects: fid }),
    // Select all available waste management methods
    Method.selectIndivids(),
  ]).then(fres => {
    const subject = fres[0].data; // Current the subject and own waste

    const waste = joinExpanded('subjectFid', fres[1].data, false)[fid] || [];
    if (!waste.length) {
      return sendResp(resp, {
        success: false, code: 404, message: 'Waste not found', data: null,
      }, 404)();
    }
    const wasteFids = waste.map(w => w.fid);

    const methods = fres[2].data || []; // All available individuals of Method
    if (!methods.length) {
      return sendResp(resp, {
        success: false, code: 404, message: 'Methods not found', data: null,
      }, 404)();
    }
    const methodFids = methods.map(m => m.fid);

    return Promise.all([
      // Select types for the current individuals of Method
      Method.selectTypes({ individs: methodFids }),
      // Select all available method types for the current waste
      Method.selectTypes({ forWaste: wasteFids }),
      // Select subjects for the current individuals of Method
      Subject.selectIndivids({ byMethods: methodFids }),
    ]).then(sres => {
      const methodTypes = joinExpanded('methodFid', sres[0].data, false);
      const wasteMethods = joinExpanded('wasteFid', sres[1].data, false);
      const subjectMethods = joinExpanded('methodFid', sres[2].data, false);

      const strategy = genStrategy({
        subject,
        waste,
        methods,
        methodTypes,
        wasteMethods,
        subjectMethods,
      });

      return sendResp(resp, strategy, 200)();
    }, sendResp(resp));

  }, sendResp(resp));
}

function genStrategy({
    subject,
    waste,
    methods,
    methodTypes,
    wasteMethods,
    subjectMethods,
    }) {

}
