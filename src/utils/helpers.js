/**
 * 防抖函数 - 在一段时间内多次调用只执行最后一次
 * @param {Function} fn - 需要防抖的函数
 * @param {number} delay - 延迟时间(毫秒)
 * @returns {Function} - 防抖处理后的函数
 */
export const debounce = (fn, delay) => {
  let timer = null
  
  return function(...args) {
    if (timer) clearTimeout(timer)
    
    timer = setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}

/**
 * 节流函数 - 在一段时间内至多执行一次
 * @param {Function} fn - 需要节流的函数
 * @param {number} interval - 间隔时间(毫秒)
 * @returns {Function} - 节流处理后的函数
 */
export const throttle = (fn, interval) => {
  let lastTime = 0
  
  return function(...args) {
    const now = Date.now()
    
    if (now - lastTime >= interval) {
      fn.apply(this, args)
      lastTime = now
    }
  }
}

/**
 * 格式化日期时间
 * @param {Date|string} date - 日期对象或日期字符串
 * @param {string} format - 格式化模板
 * @returns {string} - 格式化后的日期字符串
 */
export const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  const d = date instanceof Date ? date : new Date(date)
  
  const formatMap = {
    'YYYY': d.getFullYear(),
    'MM': (d.getMonth() + 1).toString().padStart(2, '0'),
    'DD': d.getDate().toString().padStart(2, '0'),
    'HH': d.getHours().toString().padStart(2, '0'),
    'mm': d.getMinutes().toString().padStart(2, '0'),
    'ss': d.getSeconds().toString().padStart(2, '0')
  }
  
  return Object.entries(formatMap).reduce((result, [key, value]) => {
    return result.replace(key, value)
  }, format)
} 