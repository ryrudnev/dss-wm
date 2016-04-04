import stardog from '../services/stardog';

export function getWastes(req, res) {
  const options = {
    query: 'select distinct ?s where { ?s ?p ?o }',
    limit: 10,
    offset: 0,
  };

  stardog.query(options, data => {
    res.json(data);
  });
}
