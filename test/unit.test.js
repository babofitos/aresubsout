var level = require('level-cache')()
  , mocha = require('mocha')
  , assert = require('assert')
  , http = require('http')
  , fs = require('fs')
  , compare = require('../lib/compare').compare


var io = {
  sockets: {
    emit: function(event, data) {
      io.emitted = data
    }
  },
  emitted: null
}


describe('unit', function() {
  before(function(done) {
    db = require('../lib/db')(level)
    parse = require('../lib/parse')(db, io)

    var server = http.createServer(function(req, res) {
      fs.readFile('./test/mockrss.xml', function(err, file) {
        if (err) throw err
        res.writeHead(200, {"Content-Type": 'application/rss+xml'})
        res.end(file, 'utf-8')
      })
    }).listen(3001)
    server.on('listening', function() {
      console.log('server started')
      done()
    })
  })
  describe('parse', function() {
    it('should parse and save into the database and emit new', function(done) {
      parse.save('http://localhost:3001', function() {
        assert.deepEqual(io.emitted, {
          link: 'http://www.nyaa.eu/?page=download&tid=441373'
        , title: '[AtoZ] To LOVE-Ru Darkness Vol.6 [BD 1080p-FLAC Hi10P]'
        })
        level.get('[AtoZ] To LOVE-Ru Darkness Vol.6 [BD 1080p-FLAC Hi10P]', function(err, value) {
          assert.equal(err, null)
          assert.equal(value.link, 'http://www.nyaa.eu/?page=download&tid=441373')
          assert.equal(value.date, 1370763916000)
          done()
        })
      })
    })
  })
  
  describe('compare', function() {
    var ctr = 0
      , res = []

    beforeEach(function() {
      ctr = 0
      res = []
    })

    it('should convert numbers to string', function() {
      var filter = [1]
        , data = {value: {link: 'foo'}, key: '1'}

      compare(filter, data, res, ctr)
      assert.deepEqual(res, [{link: data.value.link, title: data.key}])
    })

    it('should not match empty string', function() {
      var filter = [""]
        , data = {value: {link: 'foo'}, key: '1'}

      compare(filter, data, res, ctr)
      assert.equal(res.length, 0)
    })

    it('should escape regex special chars from filter', function() {
      var filter = ['[gg]']
        , data = {value: {link: 'foo'}, key: '[gg] shingeki'}

      compare(filter, data, res, ctr)
      assert.deepEqual(res, [{link: data.value.link, title: data.key}])
    })
  })
})



