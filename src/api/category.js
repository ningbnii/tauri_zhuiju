import request from '../utils/request'
import cheerio from 'cheerio'

/**
 * 获取类别
 * @nickname {*} nickname
 * @password {*} password
 * @returns
 */
export const getCategory = async () => {
  const html = await request.get('/getHtmlFromUrl?url=https://api.ffzyapi.com/')
  const $ = cheerio.load(html)

  const navItems = $('.nav > .width1200 > ul > li').slice(1)

  const result = []

  navItems.each((index, element) => {
    const firstLevelLink = $(element).find('> .dropdown > a')
    const firstLevelData = firstLevelLink.text().trim()
    const firstLevelHref = firstLevelLink.attr('href')
    const firstLevelId = firstLevelHref ? firstLevelHref.split('/').pop().split('.').shift() : null

    const secondLevelData = []

    $(element)
      .find('.dropdown-content > ul > li')
      .each((subIndex, subElement) => {
        const secondLevelLink = $(subElement).find('> a')
        const secondLevelItem = secondLevelLink.text().trim()
        const secondLevelHref = secondLevelLink.attr('href')
        const secondLevelId = secondLevelHref ? secondLevelHref.split('/').pop().split('.').shift() : null
        // 过滤掉伦理片
        if (secondLevelItem.includes('伦理')) {
          return
        }
        secondLevelData.push({
          name: secondLevelItem,
          id: secondLevelId,
        })
      })

    result.push({
      id: firstLevelId,
      name: firstLevelData,
      children: secondLevelData,
    })
  })

  return result
}
