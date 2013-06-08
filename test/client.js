var Browser = require('zombie')
  , assert = require('assert')
  , mocha = require('mocha')
  , data = {key: "animes", value: ""}
  , host = "http://localhost:3000"

/* 
zombie localStorage host must be passed with no http://
websockets take a bit to load, must wait after each visit else will get Error
setItem arguments need double quotes around them. single quotes will not work unless variable
*/

describe('visit index page', function() {
  var browser = new Browser({debug: true})
  before(function(done) {
    browser.visit(host, function() {
      //need to wait for websocket connect else race condition
      browser.wait(500)
      done()
    })
    browser.on('error', function(err) {
      console.log(err)
    })
  })

  it('should load the index page', function() {
    assert.ok(browser.success)
  })

  it('should display no filters added error if empty localStorage', function() {
    assert.equal(browser.text('#error'), "It looks like you have no filters added")
  })

  it('should display no filters added error with empty localStorage value', function(done) {
    browser.localStorage("localhost:3000").setItem(data.key, data.value)
    browser.reload(function() {
      browser.wait(500)
      assert.equal(browser.text('#error'), "It looks like you have no filters added")
      done()
    })
  })

  it('should display each element in localStorage array as li .filters', function(done) {
    data.value = '["here", "are", "some", "tests"]'

    browser.localStorage("localhost:3000").setItem(data.key, data.value)
    browser.reload(function() {
      browser.wait(500)
      assert.equal(browser.queryAll('.filters').length, JSON.parse(data.value).length)
      done()
    })
    
  })

  it('should remove filter when clicked on', function() {
    browser.fire('.filters', 'click', function() {
      assert.equal(browser.queryAll('.filters').length, JSON.parse(data.value).length - 1)
    })
  })

  it('should not add a filter if there is nothing in the input field', function() {
    var filtersLen = browser.queryAll('.filters').length
    browser.pressButton('#add-show', function() {
      assert.equal(filtersLen, browser.queryAll('.filters').length)
    })
  })

  it('should clear all filters when clear all filters button is clicked', function() {
    browser.pressButton('#clear-filters', function() {
      assert.equal(browser.queryAll('.filters').length, 0)

      it('should display no filters added error', function() {
        assert.equal(browser.text('#error'), "It looks like you have no filters added")
      })
    })
  })

  it('should add a filter after typing name in text field and clicking add show', function() {
    var testText = 'foobar'
      , last

    browser.fill('#add-show-text', testText)
    browser.pressButton('#add-show')
    last = browser.querySelectorAll(".filters").length - 1
    assert.equal(browser.querySelectorAll(".filters")[last].innerHTML, testText)
  })
})