exports.jsToPsqlTimestamp = (array, key = 'created_at') => array.map((element) => {
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

exports.getKeyToKeyPairing = (array, keyAsKey, keyAsValue) => array.reduce((acc, element) => {
  acc[element[keyAsKey]] = element[keyAsValue];
  return acc;
}, {});

exports.replaceKeysOfObject = (array, oldKey, newKey, keyPairings) => array.map((element) => {
  const newElement = { ...element, [newKey]: keyPairings[element[oldKey]] };
  delete newElement[oldKey];
  return newElement;
});
