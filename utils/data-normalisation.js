exports.jsTimestampToPsql = (array, key = 'created_at') => array.map((element) => {
  const ISOtimestamp = new Date(element[key]).toISOString();
  return { ...element, [key]: ISOtimestamp };
});

exports.renameKeysOfObjects = (array, oldKey, newKey) => {
  if (oldKey !== newKey) {
    return array.map((element) => {
      const newElement = { ...element, [newKey]: element[oldKey] };
      delete newElement[oldKey];
      return newElement;
    });
  }
};
