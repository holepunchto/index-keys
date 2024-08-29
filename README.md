# index-keys

Generate keys for a kv store for indexing

```
npm install index-keys
```

## Usage

``` js
const IndexKeys = require('index-keys')

const keys = new IndexKeys([
  [{
    key: 'age',
    type: 'uint'
  }],
  [{
    key: 'name',
    type: 'string'
  }]
])

const [byAge, byName] = keys.indexes

// null cause no prev value
const [dels, puts] = keys.update(null, { name: 'maf', age: 37 })

// update the record ...
const [dels, puts] = keys.update({ name: 'maf', age: 37 }, { name: 'maf', age: 38 })
```

## License

Apache-2.0
