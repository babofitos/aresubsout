var mocha = require('mocha')
  , options = { valueEncoding: 'json' }
  , levelup = require('levelup')('./test/testdb', options)
  , assert = require('assert')

describe('database', function() {
  before(function() {
    db = require('../lib/db')(levelup)
  })
  beforeEach(function(done) {
    levelup.del('foo', function(err) {
      assert.equal(err, null)
      done()
    })
  })

  it('should find article if in db', function(done) {
    levelup.put('foo', {link: "example.com", date: Date.now()}, function(err) {
      assert.equal(err, null)
      db.findArticles(['foo'], function(err, results) {
        assert.equal(err, null)
        assert.deepEqual(results, [{link: 'example.com', title: 'foo'}])
        done()
      })
    })
  })

  it('should purge week+ old keys', function(done) {
    var now = Date.now()
      , time = 604800000

    levelup.put('foo', {link: "bar", date: now-time}, function(err) {
      assert.equal(err, null)
      db.purge(function(err) {
        assert.equal(err, null)
        levelup.get('foo', function(err, value) {
          //should err because not found
          assert.notEqual(err, null)
          done()
        })
      })
    })
  })

  it('should not purge less than week old keys', function(done) {
    var now = Date.now()
      , time = 604700000

    levelup.put('foo', {link: "bar", date: now-time}, function(err) {
      assert.equal(err, null)
      db.purge(function(err) {
        assert.equal(err, null)
        levelup.get('foo', function(err, value) {
          assert.equal(err, null)
          assert.deepEqual(value, {link: "bar", date: now-time})
          done()
        })
      })
    })
  })
})
