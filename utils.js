'use strict'

/**
 * All cases with Ch.xx or Chapter xx
 * Example: Mokushiroku Alice Vol.1 Ch.4: Misrepresentation -R> 4
 */
const basic = /(ch\.|chapter\s)([0-9]+)(\.[0-9]+)?(\.?[a-z]+)?/

/**
 * Only one number occurrence
 * Example: Bleach 567: Down With Snowwhite -R> 567
 */
const occurrence = /([0-9]+)(\.[0-9]+)?(\.?[a-z]+)?/g

/**
 * After Manga name removal
 * Example: Solanin 028 Vol. 2 -> 028 Vol.2 -> 028Vol.2 -R> 028
 */
const withoutManga = /^([0-9]+)(\.[0-9]+)?(\.?[a-z]+)?/

/**
 * Remove unwanted tags
 * Example: Prison School 12 v.1 vol004 version1243 volume64 -R> Prison School 12
 */
const unwanted = /(?:(v|ver|vol|version|volume|season).?[0-9]+)/g

/**
 * Remove unwanted whitespace
 * Example: One Piece 12 special -R> One Piece 12special
 */
const unwantedWhiteSpace = /(\s)(extra|special|omake)/g

const parseChapterNumber = (chapterName, mangaName) => {
  let name = chapterName.toLowerCase()
  let matches

  // remove comma
  name = name.replace(',', '.')
  // remove unwanted white spaces
  name = name.replace(unwantedWhiteSpace, '$2')
  // remove unwanted tags
  name = name.replace(unwanted, '')

  // check base case ch.xx
  matches = basic.exec(name)
  if (matches) {
    return processChapterNumber(matches.slice(1))
  }

  // check one number occurrence
  matches = []
  let m
  do {
    m = occurrence.exec(name)
    if (m) {
      matches.push(m)
    }
  } while (m)

  if (matches.length === 1) {
    return processChapterNumber(matches[0])
  }

  if (mangaName) {
    // remove manga name from chapter name
    name = name.replace(mangaName.toLowerCase(), '').trim()

    // check if first value is number after name remove
    matches = withoutManga.exec(name)
    if (matches) {
      return processChapterNumber(matches)
    }
  }

  // take the first number encountered
  matches = occurrence.exec(name)
  if (matches) {
    return processChapterNumber(matches)
  }

  return -1
}

/**
 * Check if volume is found and update chapter
 * @param matches result of regex
 * @param chapter chapter object
 * @return true if volume is found
 */
const processChapterNumber = matches => {
  let initial = parseFloat(matches[1])
  let subChapterDecimal = matches[2]
  let subChapterAlpha = matches[3]
  let addition = checkForDecimal(subChapterDecimal, subChapterAlpha)
  return initial + addition
}

/**
 * Check for decimal in received strings
 * @param decimal decimal value of regex
 * @param alpha alpha value of regex
 * @return decimal/alpha float value
 */
const checkForDecimal = (decimal, alpha) => {
  if (decimal != null) {
    return parseFloat(decimal)
  }

  if (alpha != null) {
    if (alpha.includes('extra')) {
      return 0.99
    }

    if (alpha.includes('omake')) {
      return 0.98
    }

    if (alpha.includes('special')) {
      return 0.97
    }

    if (alpha[0] === '.') {
      return parseAlphaPostFix(alpha[1])
    } else {
      return parseAlphaPostFix(alpha[0])
    }
  }

  return 0.0
}

/**
 * Parse alpha version to float version
 * Example: x.a -> x.1, x.b -> x.2, etc
 */
const parseAlphaPostFix = alpha => {
  return parseFloat('0.' + (alpha.charCodeAt(0) - 96))
}

/**
 * Parse string 'X days ago' to Date object
 * @param {String} date in the format of 'X days ago'
 * @returns {Date} corresponding Date object
 */
const parseDateAgo = dateString => {
  let words = dateString.toLowerCase().split(' ')
  if (words.length === 3) {
    let count = parseInt(words[0])
    let unit = words[1]

    if (unit.substr(unit.length - 1) !== 's') {
      unit = unit + 's'
    }

    let date = new Date()
    if (unit === 'seconds') {
      date.setUTCSeconds(date.getUTCSeconds() - count)
    } else if (unit === 'minutes') {
      date.setUTCMinutes(date.getUTCMinutes() - count)
      date.setUTCSeconds(0)
    } else if (unit === 'hours') {
      date.setUTCHours(date.getUTCHours() - count)
      date.setUTCMinutes(0)
      date.setUTCSeconds(0)
    } else if (unit === 'days') {
      date.setUTCDate(date.getUTCDate() - count)
      date.setUTCHours(0)
      date.setUTCMinutes(0)
      date.setUTCSeconds(0)
    } else if (unit === 'months') {
      date.setUTCMonth(date.getUTCMonth() - count)
      date.setUTCDate(1)
      date.setUTCHours(0)
      date.setUTCMinutes(0)
      date.setUTCSeconds(0)
    } else if (unit === 'years') {
      date.setUTCFullYear(date.getUTCFullYear() - count)
      date.setUTCMonth(0)
      date.setUTCDate(1)
      date.setUTCHours(0)
      date.setUTCMinutes(0)
      date.setUTCSeconds(0)
    }
    date.setUTCMilliseconds(0)

    return date
  }

  return new Date(1970, 0, 1)
}

/**
 * @param {String} str string to trim
 * @returns {String}
 */
const trimSpaces = str => {
  if (typeof str === 'string') {
    return str.trim().replace(/ +(?= )/g, '')
  }
  return str
}

module.exports = Object.create({ parseChapterNumber, parseDateAgo, trimSpaces })
