exports.jsTimestampToPsql = (array, key = 'created_at') => array.map((element) => {
  const ISOtimestamp = new Date(element[key]).toISOString();
  return { ...element, [key]: ISOtimestamp };
});
