import stardog, { axiomWithPrefix } from '../services/stardog';

// Get all individuals of Waste
export function all(req, res) {
  const query = `
    select distinct ?fid ?title ?count ?subject_fid ?subject_title where {
      ?fid a :Concrete ; :title ?title ; :count ?count .
      ?subject_fid :hasWaste ?fid
      optional { ?subject_fid :title ?subject_title }
  }`;

  stardog.queryToRes({ query }, res);
}

// Get an individual of Waste by the uri
export function get(req, res) {
  const axiom = axiomWithPrefix(req.params.uri);

  const query = `
  select distinct ?fid ?type_fid ?subject_fid ?subject_title ?type_title ?title ?count where {
    ${axiom} a ?type_fid ; :title ?title ; :count ?count .
    bind(${axiom} as ?fid)
    ?subject_fid :hasWaste :bw2
    optional {?subject_fid :title ?subject_title}
    ?type_fid rdfs:subClassOf :Concrete
    filter (?type_fid != :Concrete)
    optional {
      ?type_fid rdfs:label ?type_title .
      filter langMatches(lang(?type_title), "ru")
    }
  }`;

  stardog.queryToRes({ query, limit: 1, offset: 0 }, res);
}
