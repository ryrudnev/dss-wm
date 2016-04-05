import stardog, { axiomWithPrefix } from '../services/stardog';

// Get an individua of Waste by the uri
export function getWaste(req, res) {
  const axiom = axiomWithPrefix(req.params.uri);

  const query = `
  select distinct ?type ?typeLable ?title ?count where {
    ${axiom} a ?type .
    ?type rdfs:subClassOf :Concrete .
    filter (?type != :Concrete)
    optional {
      ?type rdfs:label ?label .
      filter langMatches(lang(?lable), "ru")
    }
    ${axiom} :title ?title ; :count ?count
  }`;

  stardog.queryToRes({ query, limit: 1, offset: 0 }, res);
}
