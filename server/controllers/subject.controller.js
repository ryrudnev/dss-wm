import { qsToJson, onSendResp, joinExpanded } from '../util/utils';
import Subject from '../models/subject';
import Method from '../models/method';
import Waste from '../models/waste';

export function allIndivids(req, resp) {
  const qs = qsToJson(req);

  const onMainResolve = res => {
    const exp = qs.expand || [];
    const subjectFids = res.data.map(subject => subject.fid);
    const promises = [
      exp.includes('waste') ? Waste.selectIndivids({ forSubjects: subjectFids }) : 0,
      exp.includes('methods') ? Method.selectIndivids({ forSubjects: subjectFids }) : 0,
      exp.includes('located') ? Subject.selectLocationsFor({ forSubjects: subjectFids }) : 0,
      exp.includes('types') ? Subject.selectTypes({ individs: subjectFids }) : 0,
    ];

    const onResolve = results => {
      let [waste, methods, locations, types] = results;
      waste = !waste || joinExpanded('subjectFid', waste.data);
      methods = !methods || joinExpanded('subjectFid', methods.data);
      locations = !locations || joinExpanded('subjectFid', locations.data);
      types = !types || joinExpanded('subjectFid', types.data);

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

  return Subject.selectIndivids(qs).then(onMainResolve, onSendResp(resp));
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

  const onMainResolve = results => {
    const [subject] = results;
    let [, waste, methods, locations, types] = results;
    waste = !waste || joinExpanded('subjectFid', waste.data);
    methods = !methods || joinExpanded('subjectFid', methods.data);
    locations = !locations || joinExpanded('subjectFid', locations.data);
    types = !types || joinExpanded('subjectFid', types.data);

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
    return onSendResp(resp)(subject);
  };

  return Promise.all(promises).then(onMainResolve, onSendResp(resp));
}

export function allTypes(req, resp) {
  return Subject.selectTypes(qsToJson(req)).then(onSendResp(resp), onSendResp(resp));
}

// Generate waste management strategy for a subject
// {
//  subject, - the waste management subject to which the generated strategy
//  waste, - the subject's waste:
//           [{fid, title, amount}, ...]
//  wasteMethods, - acceptable waste management methods for the types of waste:
//                  {wasteFid: [{title, fid}, ...], ...}
//  methods, - all available waste management methods:
//             [{fid, title, costOnWeight, costByService}, ...]
//  methodsTypes, - all types of waste management methods:
//                  {methodFid: {title, fid}, ...}
// methodSubjects - all subjects of waste management methods:
//                  {methodFid: {fid, title, coordinates, budget}, ...}
// }
// Returned value:
// [
//   {
//     waste: {fid, title, amount},
//     bestTransportation: {
//        subject, method, cost
//     },
//     ownTransportation: {} || null,
//     bestMethod: {
//       subject, method, cost
//     },
//     ownMethod: {} || null,
//     bestCost: integer
//   }, ...
// ]
function genStrategy(data) {
  const strategy = []; // waste management strategy
  const { subject, waste, wasteMethods, methods, methodTypes, methodSubjects } = data;

  for (let w of waste) {
    const wStrategy = { waste: w };

  }

  return data;
}

// Generate waste management strategy for the subject by FID
export function searchStrategy(req, resp) {
  const { fid } = req.params;

  const onMainResolve = mainResults => {
    let [subject, waste, methods] = mainResults;
    subject = subject.data;

    methods = methods.data || [];
    if (!methods.length) {
      return onSendResp(resp)({
        success: false,
        code: 404,
        message: 'Waste management methods not found',
        data: null,
      });
    }
    const methodFids = methods.map(m => m.fid);

    waste = joinExpanded('subjectFid', waste.data)[fid] || [];
    if (!waste.length) {
      return onSendResp(resp)({
        success: false,
        code: 404,
        message: 'The subject has not a waste',
        data: null,
      });
    }
    const wasteFids = waste.map(w => w.fid);

    const onResolve = results => {
      const [methodTypes, wasteMethods, methodSubjects] = results;
      const data = { subject, waste, methods,
        wasteMethods: joinExpanded('wasteFid', wasteMethods.data),
        methodTypes: joinExpanded('methodFid', methodTypes.data, true),
        methodSubjects: joinExpanded('methodFid', methodSubjects.data, true),
      };

      const strategy = genStrategy(data);
      const bestTotalCost = strategy.reduce((prev, val) => prev + val.bestCost, 0);

      return onSendResp(resp)({
        success: true,
        code: 200,
        message: 'OK',
        data: { subject, waste, strategy, bestTotalCost },
      });
    };

    return Promise.all([
      // Select types for the current individuals of Method
      Method.selectTypes({ individs: methodFids }),
      // Select all available method types for the current waste
      Method.selectTypes({ forWaste: wasteFids }),
      // Select subjects for the current individuals of Method
      Subject.selectIndivids({ byMethods: methodFids }),
    ]).then(onResolve, onSendResp(resp));
  };

  return Promise.all([
    // Select the information of a subject and own waste
    Subject.selectIndividByFid(fid),
    Waste.selectIndivids({ forSubjects: fid }),
    // Select all available waste management methods
    Method.selectIndivids(),
  ]).then(onMainResolve, onSendResp(resp));
}
