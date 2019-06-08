/* eslint-env mocha */
const should = require('should')
const utils = require('../utils')

const specs = [
  {
    it: 'should recognize Ch.{number}',
    chapterTitle: 'Mokushiroku Alice Vol.1 Ch.4: Misrepresentation',
    result: 4
  },
  {
    it: 'should recognize Ch.{number.decimal}',
    chapterTitle: 'Mokushiroku Alice Vol.1 Ch.4.1: Misrepresentation',
    result: 4.1
  },
  {
    it: 'should recognize Ch.{number.decimal}',
    chapterTitle: 'Mokushiroku Alice Vol.1 Ch.4.4: Misrepresentation',
    result: 4.4
  },
  {
    it: 'should recognize Ch.{number.letter}',
    chapterTitle: 'Mokushiroku Alice Vol.1 Ch.4.a: Misrepresentation',
    result: 4.1
  },
  {
    it: 'should recognize Ch.{number.letter}',
    chapterTitle: 'Mokushiroku Alice Vol.1 Ch.4.b: Misrepresentation',
    result: 4.2
  },
  {
    it: 'should recognize Ch.{number.extra}',
    chapterTitle: 'Mokushiroku Alice Vol.1 Ch.4.extra: Misrepresentation',
    result: 4.99
  },
  {
    it: 'should recognize Ch.{number.omake}',
    chapterTitle: 'Mokushiroku Alice Vol.1 Ch.4.omake: Misrepresentation',
    result: 4.98
  },
  {
    it: 'should recognize Ch.{number.special}',
    chapterTitle: 'Mokushiroku Alice Vol.1 Ch.4.special: Misrepresentation',
    result: 4.97
  },
  {
    it: 'should recognize Chapter {number}',
    chapterTitle: 'Mokushiroku Alice Vol.1 Chapter 4: Misrepresentation',
    result: 4
  },
  {
    it: 'should recognize Chapter {number.decimal}',
    chapterTitle: 'Mokushiroku Alice Vol.1 Chapter 4.1: Misrepresentation',
    result: 4.1
  },
  {
    it: 'should recognize Chapter {number.decimal}',
    chapterTitle: 'Mokushiroku Alice Vol.1 Chapter 4.4: Misrepresentation',
    result: 4.4
  },
  {
    it: 'should recognize Chapter {number.letter}',
    chapterTitle: 'Mokushiroku Alice Vol.1 Chapter 4.a: Misrepresentation',
    result: 4.1
  },
  {
    it: 'should recognize Chapter {number.letter}',
    chapterTitle: 'Mokushiroku Alice Vol.1 Chapter 4.b: Misrepresentation',
    result: 4.2
  },
  {
    it: 'should recognize Chapter {number.extra}',
    chapterTitle: 'Mokushiroku Alice Vol.1 Chapter 4.extra: Misrepresentation',
    result: 4.99
  },
  {
    it: 'should recognize Chapter {number.omake}',
    chapterTitle: 'Mokushiroku Alice Vol.1 Chapter 4.omake: Misrepresentation',
    result: 4.98
  },
  {
    it: 'should recognize Chapter {number.special}',
    chapterTitle: 'Mokushiroku Alice Vol.1 Chapter 4.special: Misrepresentation',
    result: 4.97
  },
  {
    it: 'should recognize {number}',
    chapterTitle: 'Bleach 567: Down With Snowwhite',
    result: 567
  },
  {
    it: 'should recognize {number.decimal}',
    chapterTitle: 'Bleach 567.1: Down With Snowwhite',
    result: 567.1
  },
  {
    it: 'should recognize {number.decimal}',
    chapterTitle: 'Bleach 567.4: Down With Snowwhite',
    result: 567.4
  },
  {
    it: 'should recognize {number.letter}',
    chapterTitle: 'Bleach 567.a: Down With Snowwhite',
    result: 567.1
  },
  {
    it: 'should recognize {number.letter}',
    chapterTitle: 'Bleach 567.b: Down With Snowwhite',
    result: 567.2
  },
  {
    it: 'should recognize {number.extra}',
    chapterTitle: 'Bleach 567.extra: Down With Snowwhite',
    result: 567.99
  },
  {
    it: 'should recognize multiple {number}',
    chapterTitle: '120: The Impassable Threshold (1)',
    result: 120
  },
  {
    it: 'should recognize multiple {number}',
    chapterTitle: 'Solanin 028 Vol. 2',
    mangaTitle: 'Solanin',
    result: 28
  },
  {
    it: 'should recognize multiple {number.decimal}',
    chapterTitle: 'Solanin 028.1 Vol. 2',
    mangaTitle: 'Solanin',
    result: 28.1
  },
  {
    it: 'should recognize multiple {number.letter}',
    chapterTitle: 'Solanin 028.b Vol. 2',
    mangaTitle: 'Solanin',
    result: 28.2
  },
  {
    it: 'should recognize multiple {number} in wrong order',
    chapterTitle: 'Onepunch-Man Punch Ver002 028',
    mangaTitle: 'Onepunch-Man',
    result: 28
  }
]

describe('parseChapterNumber', () => {
  for (let spec of specs) {
    it(spec.it, () => {
      let result = utils.parseChapterNumber(spec.chapterTitle, spec.mangaTitle)
      should.exist(result)
      result.should.equal(spec.result)
    })
  }
})

describe('parseDateAgo', () => {
  let fail = new Date(1970, 0, 1)
  let types = ['minute', 'hour', 'day', 'week', 'month', 'year']
  for (let type of types) {
    [type, type + 's'].forEach(t => {
      it(`should parse ${t}`, () => {
        let result = utils.parseDateAgo(`8 ${t} ago`)
        should.exist(result)
        result.getTime().should.not.equal(fail.getTime())
      })
    })
  }

  it('should return Date when parsing fail', () => {
    let result = utils.parseDateAgo('wtf')
    should.exist(result)
    result.getTime().should.equal(fail.getTime())
  })
})
