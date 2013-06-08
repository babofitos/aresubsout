var mocha = require('mocha')
  , io = require('socket.io-client')
  , assert = require('assert')
  , options = {
    transports: ['websocket']
    , 'force new connection': true
  }
  , host = 'http://localhost:3000'

describe('sockets', function() {
  var client

  beforeEach(function(done) {
    client = io.connect(host, options)
    client.on('connect', function(data) {
      done()
    })
  })

  it('should respond with data matching filters', function(done) {
    client.emit('filter', {filters: '["mkv"]'})

    client.on('results', function(data) {
      assert.notEqual(data.results[0].title.indexOf('mkv'), -1)
      done()
    })
  })

  it('should emit an error when given a non string array', function(done) {
    var cases = ['[', '{}', 'a', '1', 1, '{foo:bar}', {}, [], {foo:'bar'}]
      , end = cases.length - 1

    cases.forEach(function(test, i) {
      client.emit('filter', {filters: test})
      if (i === end) {
        done()
      }
    })

    client.on('error', function(data) {
      assert.equal(data.msg, 'Error parsing filters. Try clearing your filters.')
    })
  })

  it('should respond correctly if given an empty array', function(done) {
    client.emit('filter', {filters: '[]'})

    client.on('results', function(data) {
      assert.equal(data.results, null)
      done()
    })
  })

  it('should cap number of filters', function(done) {
    var big = []

    for (var i=0;i<30;i++) {
      big.push('wat')
    }
    client.emit('filter', {filters: JSON.stringify(big)})

    client.on('error', function(data) {
      assert.equal(data.msg, 'You have too many filters. Try to lower the amount')
      done()
    })
  })

  it('should emit an error when given a non {filters: data} format', function(done) {
    var cases = ['[', '{}', 'a', '1', 1, '{foo:bar}', '{not: correct}', {not: 'correct'}]
      , end = cases.length - 1

    cases.forEach(function(test, i) {
      client.emit('filter', test)
      if (i === end) {
        done()
      }
    })

    client.on('error', function(data) {
      assert.equal(data.msg, 'Error parsing filters. Try clearing your filters.')
    })
  })
})