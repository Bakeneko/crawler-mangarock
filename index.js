'use strict'
const requestp = require('request-promise')
const utils = require('./utils')

const baseUrl = 'https://api.mangarockhd.com'
const filterUrl = baseUrl + '/query/web401/mrs_filter'
const mangaUrl = baseUrl + '/query/web401/manga_detail'
const metaUrl = baseUrl + '/meta'
const releasesUrl = baseUrl + '/query/web401/mrs_latest'

const mangaPageUrl = 'https://mangarock.com/manga'

class MangaRockCrawler {
  constructor (options) {
    options = options || {}
    this.userAgent = options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36'
  }

  async getMangasForFilters (filters) {
    filters = filters || {}

    // set request body
    const params = {
      genres: filters.genres || {},
      order: filters.order || 'rank',
      rank: filters.rank || 'all',
      status: filters.status || 'all'
    }

    const headers = {
      'User-Agent': this.userAgent
    }

    // send request
    const json = await requestp({
      method: 'POST',
      uri: filterUrl,
      headers: headers,
      json: true,
      body: params
    })

    // check for error
    if (json.code !== 0 || json.data === undefined) {
      throw new Error('Error getting manga list for filters: code ' + json.code)
    }

    return json.data
  }

  async getMangasData (ids) {
    if (!Array.isArray(ids)) {
      throw new Error('ids should be an array')
    }

    const headers = {
      'User-Agent': this.userAgent
    }

    // send request
    const json = await requestp({
      method: 'POST',
      uri: metaUrl,
      headers: headers,
      json: true,
      body: ids
    })

    // check for error
    if (json.code !== 0 || json.data === undefined) {
      throw new Error(`Error getting mangas data: code ${json.code}`)
    }

    // parse results
    const mangas = Object.values(json.data).map(data => {
      return {
        sourceId: data.oid,
        name: utils.trimSpaces(data.name),
        thumbnail: data.thumbnail,
        chaptersCount: data.total_chapters || 0,
        completed: data.completed,
        authors: data.author_ids
      }
    })

    return mangas
  }

  async getAuthorsData (ids) {
    if (!Array.isArray(ids)) {
      throw new Error('ids should be an array')
    }

    const headers = {
      'User-Agent': this.userAgent
    }

    // send request
    const json = await requestp({
      method: 'POST',
      uri: metaUrl,
      headers: headers,
      json: true,
      body: ids
    })

    // check for error
    if (json.code !== 0 || json.data === undefined) {
      throw new Error(`Error getting authors data: code ${json.code}`)
    }

    // parse results
    const authors = Object.values(json.data).map(data => {
      return {
        sourceId: data.oid,
        name: data.name,
        thumbnail: data.thumbnail
      }
    })

    return authors
  }

  async getCategoriesData (ids) {
    if (!Array.isArray(ids)) {
      throw new Error('ids should be an array')
    }

    const headers = {
      'User-Agent': this.userAgent
    }

    // send request
    const json = await requestp({
      method: 'POST',
      uri: metaUrl,
      headers: headers,
      json: true,
      body: ids
    })

    // check for error
    if (json.code !== 0 || json.data === undefined) {
      throw new Error(`Error getting categories data: code ${json.code}`)
    }

    // parse results
    const categories = Object.values(json.data).map(data => {
      return {
        sourceId: data.oid,
        name: utils.trimSpaces(data.name)
      }
    })

    return categories
  }

  async getReleases (from) {
    if (from && !(from instanceof Date)) {
      throw new Error('from should be a date')
    }

    const headers = {
      'User-Agent': this.userAgent
    }

    // send request
    const json = await requestp({
      method: 'GET',
      uri: releasesUrl,
      headers: headers,
      json: true
    })

    // check for error
    if (json.code !== 0 || json.data === undefined) {
      throw new Error(`Error getting manga releases: code ${json.code}`)
    }

    // parse results
    let mangas = []
    for (let data of json.data) {
      let updatedChapters = []
      if (data.new_chapters) {
        updatedChapters = data.new_chapters.map(chap => {
          return {
            sourceId: chap.oid,
            name: utils.trimSpaces(chap.name),
            url: `${mangaPageUrl}/${data.oid}/chapter/${chap.oid}`,
            updatedAt: new Date(chap.updatedAt)
          }
        })
      }

      let updatedAt = new Date(data.updated_at)

      // check for fresh releases
      if (from) {
        if (updatedAt < from) {
          break
        }
        updatedChapters = updatedChapters.filter(chap => {
          return chap.updatedAt >= from
        })
      }

      let mangaName = utils.trimSpaces(data.name)

      mangas.push({
        sourceId: data.oid,
        name: mangaName,
        url: `${mangaPageUrl}/${data.oid}`,
        thumbnail: data.thumbnail,
        rank: data.rank,
        updatedChapters,
        updatedChaptersCount: updatedChapters.length,
        updatedAt: updatedAt,
        completed: data.completed
      })
    }

    return mangas
  }

  async getManga (id) {
    if (!id) {
      throw new Error('manga id required')
    }

    // set request body
    let oids = {}
    oids[id] = 0
    const params = {
      oids,
      sections: [
        'basic_info',
        'summary',
        'artworks',
        'sub_genres',
        'social_stats',
        'author',
        'character',
        'publisher',
        'scanlator',
        'other_fact',
        'chapters',
        'related_series',
        'same_author',
        'feature_collections'
      ]
    }

    const headers = {
      'User-Agent': this.userAgent
    }

    // send request
    const json = await requestp({
      method: 'POST',
      uri: mangaUrl,
      headers: headers,
      json: true,
      body: params
    })

    // check for error
    if (json.code !== 0 || json.data === undefined || json.data[id] === undefined) {
      throw new Error(`Error getting manga data: code ${json.code}`)
    }

    const now = new Date().getTime() / 1000

    // parse results
    const data = json.data[id]
    const defaultInfo = data.default || {}
    const basicInfo = data.basic_info || {}
    let manga = {
      sourceId: defaultInfo.oid,
      name: utils.trimSpaces(basicInfo.name),
      url: `${mangaPageUrl}/${defaultInfo.oid}`,
      rank: basicInfo.rank,
      description: basicInfo.description,
      completed: basicInfo.completed,
      deleted: basicInfo.removed,
      direction: basicInfo.direction,
      thumbnail: basicInfo.thumbnail,
      cover: basicInfo.cover,
      artworks: data.artworks.artworks,
      aliases: basicInfo.alias,
      updatedAt: defaultInfo.last_updated < now ? new Date(defaultInfo.last_updated * 1000) : new Date(defaultInfo.last_updated)
    }

    let summary = data.summary
    if (summary) {
      let points
      if (summary.plot_points) {
        const punctuationReg = /[.?!]$/
        points = summary.plot_points.map(point => utils.trimSpaces(point) + (point.match(punctuationReg) ? '' : '.'))
      }
      let tags
      if (summary.key_genres) {
        // fetch categories
        tags = await this.getCategoriesData(summary.key_genres)
      }
      manga.summary = {
        points,
        tags
      }
    }

    if (basicInfo.release_frequency) {
      manga.frequency = {
        unit: basicInfo.release_frequency.unit,
        amount: basicInfo.release_frequency.amount
      }
    }

    if (data.social_stats) {
      manga.rank = data.social_stats.rank
      manga.views = data.social_stats.read
    }

    // fetch categories
    if (data.sub_genres && data.sub_genres.sub_genres) {
      manga.tags = await this.getCategoriesData(data.sub_genres.sub_genres)
    }

    manga.chapters = []
    if (data.chapters && data.chapters.chapters) {
      data.chapters.chapters.sort((a, b) => { return a.order - b.order })
      let index = 0
      manga.chapters = data.chapters.chapters.map(chap => {
        let chapterDate = chap.last_updated < now ? new Date(chap.last_updated * 1000) : new Date(chap.last_updated)
        return {
          sourceId: chap.oid,
          index: index++,
          name: utils.trimSpaces(chap.name),
          url: `${mangaPageUrl}/${defaultInfo.oid}/chapter/${chap.oid}`,
          updatedAt: chapterDate
        }
      })
    }

    let chapNumbers = []
    let hasIssues = false
    for (let chap of manga.chapters) {
      chap.number = utils.parseChapterNumber(chap.name, manga.name)
      if (chap.number >= 0 && chapNumbers[chap.number]) {
        hasIssues = true
        break
      }
      chapNumbers[chap.number] = true
    }
    if (hasIssues) {
      for (let chap of manga.chapters) {
        chap.number = -1
      }
    }
    manga.chaptersCount = manga.chapters.length

    let authors = []
    if (data.author && data.author.authors) {
      let auths = {}
      for (let auth of data.author.authors) {
        auths[auth.oid] = utils.trimSpaces(auth.role)
      }
      // fetch authors
      authors = await this.getAuthorsData(Object.keys(auths))
      for (let auth of authors) {
        auth.role = auths[auth.sourceId]
      }
    }
    manga.authors = authors

    return manga
  }
}

module.exports = MangaRockCrawler
