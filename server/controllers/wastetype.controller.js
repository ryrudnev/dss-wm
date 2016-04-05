import stardog, { axiomWithPrefix } from '../services/stardog';

// Get all Waste classes
export function all(req, res) {
  const query = `
    select distinct ?fid ?title where {
      ?fid rdfs:subClassOf :Concrete .
      filter (?fid != owl:Nothing && ?fid != :Concrete)
      optional {
        ?fid rdfs:label ?title .
        filter langMatches(lang(?title), "ru")
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
      ${axiom} rdfs:subClassOf ?type_fid .
      ?type_fid rdfs:subClassOf ${f} .
      filter (?type_fid != owl:Nothing && ?type_fid != ${f} && ?type_fid != ${axiom})
      optional {
        ?type_fid rdfs:label ?type_title .
        filter langMatches(lang(?type_title), "ru")
      }
    }`;
    return q;
  }, '');
  const query = `select distinct ?fid ?type_fid ?type_title
    where {${subquery} bind(${axiom} as ?fid)}`;

  stardog.queryToRes({ query }, res);
}
