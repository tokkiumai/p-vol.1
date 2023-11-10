/**
 Напишите функцию, которая найдет все наборы анаграмм в строке.
 Анаграммы - слова, составленные из одного и того же набора букв (рост-сорт-трос)
 */

const str = 'адрес карп кума куст мир мука парк рим среда стук рост сорт трос';

function getAnagrams(str) {
  // код функции здесь
  let result = new Map()
  let arr = str.split(' ')

  while (arr.length) {
    let current = arr.pop()
    let key = current.split('').sort().join('')

    if (result.has(key)) {
      result.set(key, [...result.get(key), current])
      continue
    }

    result.set(key, [current])
  }

  console.log(result)
  return Array.from(result.values())
}

console.log(getAnagrams('адрес карп кума куст мир мука парк рим среда стук рост сорт трос'))