const IndexEncoder = require('index-encoder')
const b4a = require('b4a')

class IndexUpdater {
  constructor (prefix, props) {
    this.prefix = prefix
    this.keys = []
    this.encoder = null

    const types = [IndexEncoder.UINT]
    for (let i = 0; i < props.length; i++) {
      types.push(IndexEncoder.lookup(props[i].type))
      this.keys.push(props[i].key)
    }

    this.encoder = new IndexEncoder(types)
  }

  encode (keys) {
    return this.encoder.encode(this._addPrefix(keys))
  }

  decode (buf) {
    return this.encoder.decode(buf).slice(1)
  }

  encodeRange (opts = {}) {
    if (opts.gt) opts.gt = this._addPrefix(opts.gt)
    else if (opts.gte) opts.gte = this._addPrefix(opts.gte)

    if (opts.lt) opts.lt = this._addPrefix(opts.lt)
    else if (opts.lte) opts.lte = this._addPrefix(opts.lte)

    const range = this.encoder.encodeRange(opts)

    if (!range.lt) range.lt = this.encoder._encode([this.prefix], true)
    if (!range.gt) range.gt = this.encoder._encode([this.prefix], false)

    return range
  }

  update (prev, curr, batch = [[], []]) {
    const del = prev ? this.encoder.encode(this._getProps(prev)) : null
    const put = curr ? this.encoder.encode(this._getProps(curr)) : null

    if (del !== null && put !== null && b4a.equals(del, put)) return batch
    if (del === null && put === null) return batch

    if (del !== null) batch[0].push(del)
    if (put !== null) batch[1].push(put)

    return batch
  }

  _addPrefix (keys) {
    return [this.prefix].concat(keys)
  }

  _getProps (o) {
    const props = [this.prefix]
    for (let i = 0; i < this.keys.length; i++) props.push(o[this.keys[i]])
    return props
  }
}

module.exports = class IndexKeys {
  constructor (indexes) {
    this.indexes = indexes.map((idx, i) => idx && new IndexUpdater(i, [].concat(idx)))
  }

  update (prev, curr) {
    const batch = [[], []]
    for (let i = 0; i < this.indexes.length; i++) {
      const index = this.indexes[i]
      if (index) index.update(prev, curr, batch)
    }
    return batch
  }
}
