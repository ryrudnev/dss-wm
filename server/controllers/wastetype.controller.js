import stardog, { axiomWithPrefix } from '../services/stardog';

// Get all Waste classes
export function all(req, res) {
  const query = `
    select distinct (replace(str(?ufid), '^.*(#|/)', '') as ?fid)
      (if(bound(?ttitle), ?ttitle, '') as ?title) where {
        ?ufid rdfs:subClassOf* :SpecificWaste
        filter (?ufid != owl:Nothing && ?ufid != :SpecificWaste)
        optional {
          ?ufid rdfs:label ?ttitle
          filter langMatches(lang(?ttitle), 'ru')
        }
  }`;

  stardog.queryToRes({ query }, res);
}

// Get a class of Waste by the uri
export function get(req, res) {
  const axiom = axiomWithPrefix(req.params.uri);

  const flags = [':Composition', ':Hazardous', ':Processable', ':Substance'];
  const subquery = flags.reduce((qs, f, i) => {
    let q = i > 0 ? `${qs}union` : qs;
    q += `{
      ${axiom} rdfs:subClassOf* ?type_fid .
      filter (?type_fid != owl:Nothing && ?type_fid != ${f} && ?type_fid != ${axiom})
      ?type_fid rdfs:subClassOf ${f}
      optional {
        ?type_fid rdfs:label ?type_title
        filter langMatches(lang(?type_title), 'ru')
      }
    }`;
    return q;
  }, '');

  const query = `
    select distinct ?fid
    (if(bound(?fid), concat('[',
             group_concat(distinct concat(
               '{"fid":"', replace(str(?type_fid), '^.*(#|/)', ''),
               '", "title": "', if(bound(?type_title), ?type_title, ''), '"}',
               ''); separator=','
             ),
      ']'), ?fid) as ?types)
    where {${subquery} bind(replace(str(${axiom}), '^.*(#|/)', '') as ?fid)} group by ?fid`;

  stardog.queryToRes({ query }, res);
}
