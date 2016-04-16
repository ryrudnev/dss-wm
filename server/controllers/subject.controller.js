import { qsToJson, onSendResp, joinExpanded, onError } from '../util/utils';
import Subject from '../models/subject.model';
import Method from '../models/method.model';
import Waste from '../models/waste.model';

export function allIndivids(req, resp) {
  const qs = qsToJson(req);
  const exp = qs.expand || [];

  return Subject.selectIndivids(qs).then(subject => {
    const subjectFids = subject.data.map(s => s.fid);
    return Promise.all([
      subject,
      exp.includes('waste') ? Waste.selectIndivids({ forSubjects: subjectFids }) : 0,
      exp.includes('methods') ? Method.selectIndivids({ forSubjects: subjectFids }) : 0,
      exp.includes('located') ? Subject.selectLocationsFor({ forSubjects: subjectFids }) : 0,
      exp.includes('types') ? Subject.selectTypes({ individs: subjectFids }) : 0,
    ]);
  }).then(results => {
    const [subject] = results;
    if (results.slice(1).some(p => !!p)) {
      let [, waste, methods, locations, types] = results;
      waste = !waste || joinExpanded('subjectFid', waste.data);
      methods = !methods || joinExpanded('subjectFid', methods.data);
      locations = !locations || joinExpanded('subjectFid', locations.data);
      types = !types || joinExpanded('subjectFid', types.data);

      subject.data = subject.data.map(s => {
        const curSubject = s;
        if (typeof waste !== 'boolean') {
          curSubject.waste = waste[curSubject.fid] || [];
        }
        if (typeof methods !== 'boolean') {
          curSubject.methods = methods[curSubject.fid] || [];
        }
        if (typeof locations !== 'boolean') {
          curSubject.located = locations[curSubject.fid] || [];
        }
        if (typeof types !== 'boolean') {
          curSubject.types = types[curSubject.fid] || [];
        }
        return curSubject;
      });
    }
    return onSendResp(resp)(subject);
  }).catch(onSendResp(resp));
}

export function individ(req, resp) {
  const { fid } = req.params;
  const exp = qsToJson(req).expand || [];

  return Promise.all([
    Subject.selectIndividByFid(fid),
    exp.includes('waste') ? Waste.selectIndivids({ forSubjects: fid }) : 0,
    exp.includes('methods') ? Method.selectIndivids({ forSubjects: fid }) : 0,
    exp.includes('located') ? Subject.selectLocationsFor({ forSubjects: fid }) : 0,
    exp.includes('types') ? Subject.selectTypes({ individs: fid }) : 0,
  ]).then(results => {
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
  }).catch(onSendResp(resp));
}

export function allTypes(req, resp) {
  return Subject.selectTypes(qsToJson(req)).then(onSendResp(resp)).catch(onSendResp(resp));
}

// Generate waste management strategy for the subject by FID
export function searchStrategy(req, resp) {
  const subjectFid = req.params.fid;

  return Promise.all([
    Subject.selectIndividByFid(subjectFid),
    Waste.selectIndivids({ forSubjects: subjectFid }),
    Method.selectIndivids(),
  ]).then(([subject, ownWaste, allMethods]) => {
    try {
      JSON.parse(subject.data.coordinates);
    } catch (err) {
      return onError({
        success: false,
        code: 500,
        message: 'This the subject has not coordinates',
        data: null,
      });
    }

    if (!ownWaste.data.length) {
      return onError({
        success: false,
        code: 404,
        message: 'The subject has not a waste',
        data: null,
      });
    }
    const wasteFids = ownWaste.data.map(w => w.fid);

    if (!allMethods.data.length) {
      return onError({
        success: false,
        code: 404,
        message: 'Available waste management methods not found',
        data: null,
      });
    }
    const methodFids = allMethods.data.map(m => m.fid);

    return Promise.all([
      subject,
      ownWaste,
      allMethods,
      Method.selectTypes({ individs: methodFids }),
      Method.selectTypes({ forWaste: wasteFids }),
      Subject.selectIndivids({ byMethods: methodFids }),
    ]);
  }).then(([subject, ownWaste, allMethods, allMethodTypes, wasteMethods, methodSubjects]) => {
    const ownMethods = {};

    // Reduce all available methods with subject and type
    const methods = allMethodTypes.data.reduce((prev, methodType) => {
      const cur = prev;
      const { fid, methodFid } = methodType;
      const curSubject = methodSubjects.data.find(s => s.methodFid === methodFid);
      if (!curSubject) {
        return cur;
      }
      const method = allMethods.data.find(m => m.fid === methodFid);
      if (curSubject.fid === subjectFid) {
        if (!ownMethods[fid]) {
          ownMethods[fid] = [];
        }
        ownMethods[fid].push(method);
      } else {
        if (!cur[fid]) {
          cur[fid] = [];
        }
        method.subject = curSubject;
        cur[fid].push(method);
      }
      return cur;
    }, {});

    const strategy = Subject.genStrategy({
      subject: subject.data,
      ownWaste: ownWaste.data,
      ownMethods,
      wasteMethods: joinExpanded('wasteFid', wasteMethods.data),
      methods,
    });

    return onSendResp(resp)({
      success: true,
      code: 200,
      message: 'OK',
      data: strategy,
    });
  }).catch(onSendResp(resp));
}
