$(document).ready(function() {
var originalTitle = $('title').html()
  , newArticleCtr = 0

if (!isLocalStorageEmpty()) {
  buildFilters()
}

var socket = io.connect(window.location.href)

socket.on('connect', function() {
  if (!isLocalStorageEmpty()) {
    socket.emit('filter', {filters: localStorage.getItem('animes')})
  }
})

socket.on('error', function(err) {
  $('#error').html(err.msg)
  $('#error').removeClass('hide')
})

socket.on('results', function(data) {
  //clear previous results
  clearList()
  if (data.results) {
    displayData(data.results)
    showFetchDate()
  }
})

socket.on('disconnect', function() {
  $('#error').html('Connection interrupted. Refresh the page')
  $('#error').removeClass('hide')
})

//new articles. regexp compare with filters
socket.on('new', function(data) {
  if (!isLocalStorageEmpty()) {
    var results = compare(data, JSON.parse(localStorage.getItem('animes')))
    if (results.length > 0) {
      displayData(results)
      newArticleCtr++

      $('title').html('(' + newArticleCtr.toString() + ') ' + originalTitle)

    }
  }
})

function compare(data, filter) {
  var len = filter.length
    , results = []

  for (var i=0;i<len;i++) {
    var escapeBrackets = filter[i].replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")
      , currentFilter = escapeBrackets.split(' ')
      , re = '(?=.*'

    re += currentFilter.join(')(?=.*')
    re += ').+'
    var reobj = new RegExp(re, "i")
    if (data.title.match(reobj) != null) {
      results.push({ 
        link: data.link.replace('http://www.nyaa.eu/?page=download', 'http://www.nyaa.eu/?page=view')
      , title: data.title
      })
    }
  }
  return results
}

function clearFilters() {
  $('#filters').html('')
}

function clearList() {
  $('#list').html('')
}

function clearDate() {
  $('#date').html('')
}

function isLocalStorageEmpty() {
  var $error = $('#error')
    , animu = localStorage.getItem('animes')

  if (animu === '[]' || !animu) {
    clearFilters()
    clearList()
    clearDate()
    $error.removeClass('hide')
    $error.html('It looks like you have no filters added')
    return true
  }
  else {
    try {
      if (JSON.parse(animu).length !== 0) {
        $error.addClass('hide')
        return false
      }
      
    }
    catch(e) {
      $error.removeClass('hide')
      $error.html('Error with your filter. Try clearing your filters')
      return true
    }
  }
}

$('#clear-filters').on('click', function(e) {
  e.preventDefault()
  localStorage.clear()
  isLocalStorageEmpty()
})

$('#add-show').on('click', function(e) {
  e.preventDefault()
  var data = localStorage.getItem('animes') ? JSON.parse(localStorage.getItem('animes')) : []
  var text = $('#add-show-text').val()
  if (!text) return
  data.push(text)
  localStorage.setItem('animes', JSON.stringify(data))
  $('#add-show-text').val('')
  isLocalStorageEmpty()
  updateFilters()
})

//if click on li element, remove it
$('#filters').on('click', 'li', function(e) {
  var $this = $(this)
  if (!isLocalStorageEmpty()) {
    //name of filter and index of list in ul
    removeFromLS($this.html(), $this.index())
  }
})

function displayData(data) {
  var len = data.length

  for (var i=0;i<len;i++) {
    $('#list').append(
      $('<li/>', {
        class: 'item'
      , html: makeLink(data[i])
      })
    )
  }
}

function buildFilters() {
  var list = JSON.parse(localStorage.getItem('animes'))
    , len = list.length

  for (var i=0;i<len;i++) {
    $('#filters').append(
      $('<li/>', {
        class: 'filters'
      , text: list[i]
      })
    )
  }
}

function updateFilters() {
  //rebuild filters
  clearFilters()
  if (!isLocalStorageEmpty()) {
    buildFilters()
    //refetch with updated filters
    socket.emit('filter', {filters: localStorage.getItem('animes')})
  }
}

function makeLink(data) {
  return $('<a/>', {
    class: 'list-link'
  , href: data.link
  , text: data.title
  , target: "_blank"
  })
}

function showFetchDate() {
  var date = new Date(Date.now()).toString()
  $('#date').html(date)
}

function removeFromLS(filter, index) {
  var animes = JSON.parse(localStorage.getItem('animes'))
  animes.splice(index, 1)
  if (animes.length == 0) {
    localStorage.clear()
  } else {
    localStorage.setItem('animes', JSON.stringify(animes))
  }
  updateFilters()
}
})