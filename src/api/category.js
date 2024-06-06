import request from '../utils/request'
import cheerio from 'cheerio'

/**
 * 获取类别
 * @nickname {*} nickname
 * @password {*} password
 * @returns
 */
export const getCategory = async () => {
  const html = await request.get('/getHtmlFromUrl?url=http://ffzy5.tv/')
  const $ = cheerio.load(html)
  const navItems = []

  $('.nav .dropdown a').each((index, element) => {
    const id = $(element).attr('href')
    const title = $(element).attr('title')
    if (id && title) {
      navItems.push({ id, title })
    }
  })
  return navItems
}
