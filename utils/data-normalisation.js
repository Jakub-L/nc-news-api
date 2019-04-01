exports.jsTimestampToPsql = array => array.map((element) => {
  const ISOtimestamp = new Date(element.created_at).toISOString();
  return { ...element, created_at: ISOtimestamp };
});
