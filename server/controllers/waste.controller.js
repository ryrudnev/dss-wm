import { qsToJson, sendResp, joinExpanded, head } from '../util/utils';
import Waste from '../models/waste';
import Subject from '../models/subject';

export function allIndivids(req, resp) {
  const qs = qsToJson(req);

  const onSuccess = res => {
    const exp = qs.expand || [];
    const wasteFids = res.data.map(waste => waste.fid);
    const promises = [
      exp.includes('types') ? Waste.selectTypes({ individs: wasteFids }) : 0,
      exp.includes('subject') ? Subject.selectIndivids({ byWaste: wasteFids }) : 0,
    ];

    if (promises.some(p => !!p)) {
      return Promise.all(promises).then(results => {
        const types = !results[0] || joinExpanded('wasteFid', results[0].data);
        const subjects = !results[1] || joinExpanded('wasteFid', results[1].data);

        const data = res.data.map(w => {
          const waste = w;
          if (typeof types !== 'boolean') {
            waste.types = types[waste.fid] || [];
          }
          if (typeof subjects !== 'boolean') {
            waste.subject = head(subjects[waste.fid], {});
          }
          return waste;
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

  return Waste.selectIndivids(qs).then(onSuccess, sendResp(resp));
}

export function individ(req, resp) {
  const { fid } = req.params;
  const exp = qsToJson(req).expand || [];
  const promises = [
    Waste.selectIndividByFid(fid),
    exp.includes('types') ? Waste.selectTypes({ individs: fid }) : 0,
    exp.includes('subject') ? Subject.selectIndivids({ byWaste: fid }) : 0,
  ];

  return Promise.all(promises).then(results => {
    const waste = results[0];
    const types = !results[1] || joinExpanded('wasteFid', results[1].data);
    const subjects = !results[2] || joinExpanded('wasteFid', results[2].data);

    if (typeof types !== 'boolean') {
      waste.data.types = types[fid] || [];
    }

    if (typeof subjects !== 'boolean') {
      waste.data.subject = head(subjects[fid], {});
    }
    return sendResp(resp)(waste);
  }, sendResp(resp));
}

export function allTypes(req, resp) {
  return Waste.selectTypes(qsToJson(req)).then(sendResp(resp), sendResp(resp));
}

export function origins(req, resp) {
  return Waste.selectOrigins(qsToJson(req)).then(sendResp(resp), sendResp(resp));
}

export function hazardClasses(req, resp) {
  return Waste.selectHazardClasses(qsToJson(req)).then(sendResp(resp), sendResp(resp));
}

export function aggregateStates(req, resp) {
  return Waste.selectAggregateStates(qsToJson(req)).then(sendResp(resp), sendResp(resp));
}
