app = require('../app')

var Browser = require('zombie')
  , assert = require('assert')
  , mocha = require('mocha')
  , data = {key: "animes", value: ""}
  , host = "http://localhost:3000"

/* 
 * zombie localStorage host must be passed with no http://

 * websockets take a bit to load, must wait after each visit else will get Error

 * setItem arguments need double quotes around them. single quotes will not work unless a variable

 * the criteria for erroring should be a lack of a hide class on #error
   because the error text is not changed on a non-error
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

  it('should display "no filters added" error if empty localStorage', function() {
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
    data.value = '["here", "are", "some", "tests", 1]'
    browser.localStorage("localhost:3000").setItem(data.key, data.value)

    browser.reload(function() {
      browser.wait(500)
      assert.equal(browser.queryAll('.filters').length, JSON.parse(data.value).length)
      done()
    })
  })

  it('should display no error message for valid values', function(done) {
    data.value = '["here", "are", "some", "tests", 1, "1", "[]"]'
    browser.localStorage("localhost:3000").setItem(data.key, data.value)

    browser.reload(function() {
      browser.wait(500)
      assert.equal(browser.querySelector('#error').className, 'hide')
      done()
    })
  })

  it('should regard a localStorage value of [] as an empty filter', function(done) {
    data.value = '[]'
    browser.localStorage("localhost:3000").setItem(data.key, data.value)

    browser.reload(function() {
      browser.wait(500)
      assert.equal(browser.queryAll('.filters').length, 0)
      assert.notEqual(browser.querySelector('#error').className, 'hide')
      assert.equal(browser.text('#error'), "It looks like you have no filters added")
      done()
    })
  })

  it('should appropriately handle invalid values', function(done) {
    data.value = "{"
    browser.localStorage("localhost:3000").setItem(data.key, data.value)
    
    browser.reload(function() {
      browser.wait(500)
      assert.notEqual(browser.querySelector('#error').className, 'hide')
      assert.equal(browser.text('#error'), "Error with your filter. Try clearing your filters")
      done()
    })
  })

  it('should remove filter when clicked on', function(done) {
    data.value = '["here", "are", "some", "tests"]'
    browser.localStorage("localhost:3000").setItem(data.key, data.value)

    browser.reload(function() {
      browser.wait(500)
      browser.fire('.filters', 'click', function() {
        assert.equal(browser.queryAll('.filters').length, JSON.parse(data.value).length - 1)
        done()
      })
    })
  })

  it('should not add a filter if there is nothing in the input field', function() {
    var filtersLen = browser.queryAll('.filters').length
    browser.pressButton('#add-show', function() {
      assert.equal(filtersLen, browser.queryAll('.filters').length)
    })
  })

  it('should have no li .filters when clear all filters button is clicked', function() {
    browser.pressButton('#clear-filters', function() {
      assert.equal(browser.queryAll('.filters').length, 0)

      it('should display no filters added error', function() {
        assert.notEqual(browser.querySelector('#error').className, 'hide')
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