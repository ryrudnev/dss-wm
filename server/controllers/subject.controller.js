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
//  ownWaste, - the subject's waste:
//           [{fid, title, amount}, ...]
//  wasteMethods, - acceptable waste management methods for the types of waste:
//                  {wasteFid: [{title, fid}, ...], ...}
//  methods, - all available waste management methods:
//             {methodTypeFid: [{fid, title, costOnWeight, costByService}, ...], ...},
//  methodSubjects, - all waste management method's subjects:
//                    [{fid, title, coordinates, budget}, ...]
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
  // const strategies = []; // waste management strategy
  // const { subject, ownWaste, wasteMethods, methods, methodSubjects } = data;
/*
  for (let waste of ownWaste) {
    const strategy = { waste };
    const wasteMethod = wasteMethods[waste.fid] || [];
    if (!wasteMethod.length) {

    }
  }
*/
  return data;
}

// Generate waste management strategy for the subject by FID
export function searchStrategy(req, resp) {
  const sfid = req.params.fid;

  const onMainResolve = mainResults => {
    const subject = mainResults[0].data;
    const ownWaste = mainResults[1].data || [];
    const allMethods = mainResults[2].data || [];
    const ownMethods = {};

    if (!allMethods.length) {
      return onSendResp(resp)({
        success: false,
        code: 404,
        message: 'Waste management methods not found',
        data: null,
      });
    }
    const methodFids = allMethods.map(m => m.fid);

    if (!ownWaste.length) {
      return onSendResp(resp)({
        success: false,
        code: 404,
        message: 'The subject has not a waste',
        data: null,
      });
    }
    const wasteFids = ownWaste.map(w => w.fid);

    const onResolve = results => {
      const allMethodTypes = results[0].data;
      const wasteMethods = joinExpanded('wasteFid', results[1].data);
      const methodSubjects = results[2].data;

      // Reduce all available methods with subject and type
      const methods = allMethodTypes.reduce((prev, methodType) => {
        const cur = prev;
        const { fid, methodFid } = methodType;
        const sub = methodSubjects.find(s => s.methodFid === methodFid);
        if (!sub) {
          return cur;
        }
        const method = allMethods.find(m => m.fid === methodFid);

        if (sub.fid === sfid) {
          if (!ownMethods[fid]) {
            ownMethods[fid] = [];
          }
          ownMethods[fid].push(method);
        } else {
          method.subject = sub;
          if (!cur[fid]) {
            cur[fid] = [];
          }
          cur[fid].push(method);
        }

        return cur;
      }, {});

      const strategy = genStrategy({ subject, ownWaste, ownMethods, wasteMethods, methods });
      // const bestTotalCost = strategy.reduce((prev, val) => prev + val.bestCost, 0);

      return onSendResp(resp)({
        success: true,
        code: 200,
        message: 'OK',
        data: strategy,
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
    Subject.selectIndividByFid(sfid),
    Waste.selectIndivids({ forSubjects: sfid }),
    // Select all available waste management methods
    Method.selectIndivids(),
  ]).then(onMainResolve, onSendResp(resp));
}
