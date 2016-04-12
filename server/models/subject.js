import {
    qSort,
    qType,
    qFidAs,
    qInFilter,
    qLimitOffset,
} from '../util/owlUtils';
import stardog from '../services/stardog';

export default {
  selectIndivids({ types, byMethods, byWaste, sort, offset, limit } = {}) {
    const query = `
      SELECT DISTINCT ${qFidAs('subject', 'fid')} ?title ?coordinates ?budget
      ${byMethods ? qFidAs('method', 'methodFid') : ''}
      ${byWaste ? qFidAs('waste', 'wasteFid') : ''}
      WHERE {
        ?subject :title ?title ${qType('a', [':Subject', types])}
        OPTIONAL { ?subject :coordinates ?coordinates }
        OPTIONAL { ?subject :budget ?budget }
        ${qInFilter(['subject', ':hasMethod', 'method', true], byMethods)}
        ${qInFilter(['subject', ':hasWaste', 'waste', true], byWaste)}
      } ${qSort(sort)} ${qLimitOffset(limit, offset)}
    `;

    return stardog.query({ query });
  },
};
