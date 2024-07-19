import request from '../utils/request'
import cheerio from 'cheerio'
import config from '../config'

const { RESOURCE_SERVER, baseUrl, localUrl } = config

/**
 * 获取列表
 * @nickname {*} nickname
 * @password {*} password
 * @returns
 */
export const getList = async (id, page = 1) => {
  const result = await request.get(baseUrl + '/api/index/getVideoList', {
    categoryId: id,
    page,
  })
  return result
}

/**
 * 获取detail
 * @param {*} url
 * @returns
 */
export const getDetail = async (id) => {
  // 刮削详情页，获取缩略图
  const detailHtml = await request.get(`/getHtmlFromUrl?url=${RESOURCE_SERVER}index.php/vod/detail/id/${id}.html`, {}, localUrl)
  const $ = cheerio.load(detailHtml) // 使用 detailHtml.data 以获取响应内容
  // 获取集数和对应的 ffm3u8 播放地址
  const episodes = []

  const listItems = $('.playlist.wbox.ffm3u8 li').toArray()

  // 遍历列表项，跳过最后一个元素
  listItems.slice(0, -1).forEach((element) => {
    const episode = $(element).find('a').attr('title')
    const url = $(element).find('a').attr('href')
    episodes.push({ episode, url })
  })
  // 获取片名
  const name = $('.right p:first-child').text().trim().replace('片名：', '')

  return { episodes, name }
}

/**
 * 搜索
 * @param {*} query
 * @param {*} page
 * @returns
 */
export const searchMoviesByQuery = async (query, page = 1) => {
  const result = await request.get(baseUrl + '/api/index/getVideoList', {
    keywords: query,
    page,
  })
  return result
}
