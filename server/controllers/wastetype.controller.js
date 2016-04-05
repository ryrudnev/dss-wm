import stardog, { axiomWithPrefix } from '../services/stardog';

// Get all Waste classes
export function getWasteTypes(req, res) {
  const query = `
    select distinct ?type ?typeLabel where {
      ?type rdfs:subClassOf :Concrete .
      filter (?type != owl:Nothing && ?type != :Concrete)
      optional {
        ?type rdfs:label ?typeLabel .
        filter langMatches(lang(?typeLabel), "ru")
      }
  }`;

  stardog.queryToRes({ query }, res);
}

// Get a class of Waste by the uri
export function getWasteType(req, res) {
  const axiom = axiomWithPrefix(req.params.uri);

  const flags = [':Composition', ':Hazardous', ':Processable', ':Substance'];
  const subquery = flags.reduce((qs, f, i) => {
    let q = i > 0 ? `${qs}union` : qs;
    q += `{
      ${axiom} rdfs:subClassOf ?type .
      ?type rdfs:subClassOf ${f} .
      filter (?type != owl:Nothing && ?type != ${f} && ?type != ${axiom})
      optional {
        ?type rdfs:label ?typeLabel .
        filter langMatches(lang(?typeLabel), "ru")
      }
    }`;
    return q;
  }, '');
  const query = `select distinct ?type ?typeLabel where {${subquery}}`;

  stardog.queryToRes({ query }, res);
}
