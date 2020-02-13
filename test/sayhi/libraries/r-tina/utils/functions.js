export function mapObject (obj, iteratee = o => o) {
  let result = {}
  for (let key in obj) {
    result[key] = iteratee(obj[key], key, obj)
  }
  return result
}

export function filterObject (obj, predicate = o => o) {
  let result = {}
  for (let key in obj) {
    if (predicate(obj[key], key, obj)) {
      result[key] = obj[key]
    }
  }
  return result
}

export function isEmpty (obj) {
  if (obj == null) {
    return true
  }
  if (obj.length > 0) {
    return false
  }
  if (obj.length === 0) {
    return true
  }
  for (let key in obj) {
    if (hasOwnProperty.call(obj, key)) {
      return false
    }
  }
  return true
}

export function pick (object, keys = []) {
  let picked = {}
  keys.forEach((key) => {
    if (key in object) {
      picked[key] = object[key]
    }
  })
  return picked
}

export function without (input, exclude = []) {
	return input.filter((x) => exclude.indexOf(x) === -1)
}

export function values (object) {
  return Object.keys(object).map((key) => object[key])
}

export function fromPairs (pairs = []) {
  let object = {}
  pairs.forEach(([key, value]) => object[key] = value)
  return object
}
