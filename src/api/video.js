import request from '../utils/request'
import cheerio from 'cheerio'

/**
 * 获取列表
 * @nickname {*} nickname
 * @password {*} password
 * @returns
 */
export const getList = async (id, page = 1) => {
  const html = await request.get(`/getHtmlFromUrl?url=https://api.ffzyapi.com/index.php/vod/type/id/${id}/page/${page}.html`)
  const $ = cheerio.load(html)
  // 获取电影列表
  const movies = []

  const movieElements = $('.videoContent li').toArray() // 将 jQuery 对象转换为数组

  // 使用 Promise.all 并行处理每个电影详情页的请求
  await Promise.all(
    movieElements.map(async (element) => {
      const name = $(element).find('.videoName').text().trim()
      const url = $(element).find('.videoName').attr('href')
      const id = url.split('/').pop().split('.').shift()
      // 获取影片分类
      const category = $(element).find('.category').text().trim()
      // 过滤掉伦理片
      if (category.includes('伦理')) {
        return
      }

      movies.push({ id, name, url })
    })
  )

  // 获取页码总数
  const pageInfoText = $('.pages span.disabled').text()
  const totalPagesMatch = pageInfoText.match(/当前\d+\/(\d+)页/)
  const totalPages = totalPagesMatch ? parseInt(totalPagesMatch[1], 10) : 0
  return { movies, totalPages }
}

/**
 * 刮削封面
 * @param {*} url
 * @returns
 */
export const getCover = async (url) => {
  // 刮削详情页，获取缩略图
  const detailHtml = await request.get(`/getHtmlFromUrl?url=https://api.ffzyapi.com${url}`)
  const $detail = cheerio.load(detailHtml) // 使用 detailHtml.data 以获取响应内容
  const cover = $detail('.people img').attr('src')
  return cover
}

/**
 * 获取detail
 * @param {*} url
 * @returns
 */
export const getDetail = async (id) => {
  // 刮削详情页，获取缩略图
  const detailHtml = await request.get(`/getHtmlFromUrl?url=https://api.ffzyapi.com/index.php/vod/detail/id/${id}.html`)
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
  const html = await request.get(`/getHtmlFromUrl?url=https://api.ffzyapi.com/index.php/vod/search/page/${page}/wd/${query}.html`)
  const $ = cheerio.load(html)
  // 获取电影列表
  const movies = []

  const movieElements = $('.videoContent li').toArray() // 将 jQuery 对象转换为数组

  // 使用 Promise.all 并行处理每个电影详情页的请求
  await Promise.all(
    movieElements.map(async (element) => {
      const name = $(element).find('.videoName').text().trim()
      const url = $(element).find('.videoName').attr('href')
      const id = url.split('/').pop().split('.').shift()
      // 获取影片分类
      const category = $(element).find('.category').text().trim()
      // 过滤掉伦理片
      if (category.includes('伦理')) {
        return
      }

      movies.push({ id, name, url })
    })
  )

  // 获取页码总数
  const pageInfoText = $('.pages span.disabled').text()
  const totalPagesMatch = pageInfoText.match(/当前\d+\/(\d+)页/)
  const totalPages = totalPagesMatch ? parseInt(totalPagesMatch[1], 10) : 0
  return { movies, totalPages }
}
