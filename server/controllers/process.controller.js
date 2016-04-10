import stardog from '../services/stardog';

// Get all individuals of Process
export function all(req, res) {
  const query = `
    select distinct ?fid ?title ?subject_fid ?subject_title
    ?price ?priceByWeight ?priceByWidth
    where {
      ?fid a ?process ; :title ?title .
      ?process rdfs:subClassOf* :Process .
      ?subject_fid :hasProcess ?fid
      optional { ?subject_fid :title ?subject_title }
      optional { ?fid :priceByWidth ?priceByWidth }
      optional { ?fid :priceByWeight ?priceByWeight }
      optional { ?fid :price ?price }
    }`;

  stardog.queryToRes({ query }, res);
}

// Get an individual of Process by the uri
export function get(req, res) {
  // const axiom = axiomWithPrefix(req.params.uri);

  const query = `
    select distinct ?fid ?title ?subject_fid ?subject_title
    ?price ?priceByWeight ?priceByWidth
    where {
      ?fid a ?process ; :title ?title .
      ?process rdfs:subClassOf* :Process .
      ?subject_fid :hasProcess ?fid
      optional { ?fid :priceByWidth ?priceByWidth }
      optional { ?fid :priceByWeight ?priceByWeight }
      optional { ?fid :price ?price }
      optional { ?subject_fid :title ?subject_title }
    }`;

  stardog.queryToRes({ query }, res);
}
