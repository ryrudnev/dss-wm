import { qsToJson, onSendResp, joinExpanded, onError, flatten } from '../util/utils';
import subjectStorage from '../models/subject.storage';
import methodStorage from '../models/method.storage';
import wasteStorage from '../models/waste.storage';
import Strategy from '../models/strategy.model';

export function getAllIndivids(req, resp) {
  const qs = qsToJson(req);
  const exp = flatten([qs.expand]);
  return subjectStorage.selectIndivids(qs).then(subject => {
    const subjectFids = subject.data.map(s => s.fid);
    return Promise.all([
      subject,
      exp.includes('waste') ? wasteStorage.selectIndivids({ forSubjects: subjectFids }) : 0,
      exp.includes('methods') ? methodStorage.selectIndivids({ forSubjects: subjectFids }) : 0,
      exp.includes('located') ? subjectStorage.selectLocationsFor({ forSubjects: subjectFids }) : 0,
      exp.includes('types') ? subjectStorage.selectTypes({ individs: subjectFids }) : 0,
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

export function getIndivid(req, resp) {
  const { fid } = req.params;
  const exp = flatten([qsToJson(req).expand]);
  return Promise.all([
    subjectStorage.selectIndividByFid(fid),
    exp.includes('waste') ? wasteStorage.selectIndivids({ forSubjects: fid }) : 0,
    exp.includes('methods') ? methodStorage.selectIndivids({ forSubjects: fid }) : 0,
    exp.includes('located') ? subjectStorage.selectLocationsFor({ forSubjects: fid }) : 0,
    exp.includes('types') ? subjectStorage.selectTypes({ individs: fid }) : 0,
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

export function getAllTypes(req, resp) {
  return subjectStorage.selectTypes(qsToJson(req)).then(onSendResp(resp)).catch(onSendResp(resp));
}

// Generate waste management strategy for the subject by FID
export function searchStrategy(req, resp) {
  const subjectFid = req.params.fid;

  return Promise.all([
    subjectStorage.selectIndividByFid(subjectFid),
    wasteStorage.selectIndivids({ forSubjects: subjectFid }),
    methodStorage.selectIndivids(),
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
      methodStorage.selectTypes({ individs: methodFids }),
      methodStorage.selectTypes({ forWaste: wasteFids }),
      subjectStorage.selectIndivids({ byMethods: methodFids }),
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

    const result = subjectStorage.genStrategy({
      subject: subject.data,
      ownWaste: ownWaste.data,
      ownMethods,
      wasteMethods: joinExpanded('wasteFid', wasteMethods.data),
      methods,
    });

    if (result) {
      const strategy = new Strategy(result);
      strategy.save();
    }

    return onSendResp(resp)({
      success: true,
      code: 200,
      message: 'OK',
      data: result,
    });
  }).catch(onSendResp(resp));
}

export function createIndivid(req, resp) {
  const { type } = req.body;
  return Promise.all([
    subjectStorage.typeExists(`${type}`, true),
  ]).then(() => subjectStorage.createIndivid(type, req.body))
      .then(onSendResp(resp)).catch(onSendResp(resp));
}

export function updateIndivid(req, resp) {
  const { fid } = req.params;
  return Promise.all([
    subjectStorage.individExists(`${fid}`, true),
  ]).then(() => subjectStorage.updateIndivid(fid, req.body))
      .then(onSendResp(resp)).catch(onSendResp(resp));
}

export function deleteIndivid(req, resp) {
  const { fid } = req.params;
  return subjectStorage.individExists(`${fid}`, true).then(() => subjectStorage.deleteIndivid(fid))
      .then(onSendResp(resp)).catch(onSendResp(resp));
}

export function getStrategies(req, resp) {
  Strategy.find({ 'subject.fid': `${req.params.fid}` })
      .sort({ created: -1 })
      .exec((err, res) => onSendResp(resp)({
        success: true,
        code: 200,
        message: 'OK',
        data: res,
      }));
}
