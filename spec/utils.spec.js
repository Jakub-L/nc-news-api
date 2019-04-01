const { expect } = require('chai');
const { jsTimestampToPsql } = require('../utils/data-normalisation');

describe('jsTimestampToPsql()', () => {
  it('Converts single-object array to have ISO-8601 based timestamp', () => {
    const input = [{ title: 'Lorem Ipsum', created_at: 1546300800000 }];
    const expected = [{ title: 'Lorem Ipsum', created_at: '2019-01-01T00:00:00.000Z' }];
    expect(jsTimestampToPsql(input)).to.eql(expected);
  });
  it('Converts multiple-object array to have ISO-8601 based timestamp', () => {
    const input = [
      { title: 'Lorem Ipsum', created_at: 1546300800000 },
      { title: 'Dolor Sit', created_at: 1478100731000 },
      { title: 'Amet Consectetur', created_at: 1276642472000 },
    ];
    const expected = [
      { title: 'Lorem Ipsum', created_at: '2019-01-01T00:00:00.000Z' },
      { title: 'Dolor Sit', created_at: '2016-11-02T15:32:11.000Z' },
      { title: 'Amet Consectetur', created_at: '2010-06-15T22:54:32.000Z' },
    ];
    expect(jsTimestampToPsql(input)).to.eql(expected);
  });
  it('Does not mutate input array or objects inside of it', () => {
    const input = [
      { title: 'Lorem Ipsum', created_at: 1546300800000 },
      { title: 'Dolor Sit', created_at: 1478100731000 },
      { title: 'Amet Consectetur', created_at: 1276642472000 },
    ];
    const output = jsTimestampToPsql(input);
    expect(output).to.not.equal(input);
    output.forEach((element, index) => {
      expect(element).to.not.equal(input[index]);
    });
  });
});
