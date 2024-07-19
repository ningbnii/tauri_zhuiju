import request from '../utils/request'
import config from '../config'

const { baseUrl } = config

/**
 * 获取类别
 * @nickname {*} nickname
 * @password {*} password
 * @returns
 */
export const getCategory = async () => {
  const result = await request.get(baseUrl + '/api/index/getCategory')
  return result
}
