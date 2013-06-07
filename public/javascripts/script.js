$(document).ready(function() {

if (!isLocalStorageEmpty()) {
  buildFilters()
}

var socket = io.connect(window.location.href)

socket.on('connect', function() {
  if (!isLocalStorageEmpty()) {
    socket.emit('filter', {filters: localStorage.animes})
  }
})

socket.on('error', function(err) {
  $('#error').html(err.msg)
  $('#error').removeClass('hide')
})

socket.on('results', function(data) {
  //clear previous results
  clearList()
  if (data) {
    displayData(data.results)
    showFetchDate()
  }
})

//new articles. regexp compare with filters
socket.on('new', function(data) {
  console.log('getting new torrent', data)
  if (!isLocalStorageEmpty()) {
    var results = compare(data, JSON.parse(localStorage.animes))
    console.log('results', results)
    if (results.length > 0) {
      displayData(results)
    }
  }
})

function compare(data, filter) {
  console.log('compare data', data)
  console.log('compare filter', filter)
  var len = filter.length
    , results = []

  for (var i=0;i<len;i++) {
    var escapeBrackets = filter[i].replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")
      , currentFilter = escapeBrackets.split(' ')
      , re = '(?=.*'

    re += currentFilter.join(')(?=.*')
    re += ').+'
    var reobj = new RegExp(re, "i")
    console.log('reobj', reobj)
    if (data.title.match(reobj) != null) {
      console.log('matched')
      console.log('link', data.link)
      console.log('title', data.title)
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
  if (localStorage.animes) {
    try {
      if (JSON.parse(localStorage.animes).length !== 0) {
        $('#error').addClass('hide')
        return false
      }
      
    }
    catch(e) {
      $('#error').removeClass('hide')
      $('#error').html('Error with your filter. Try clearing your filters')
      return true
    }
  } else {
    clearFilters()
    clearList()
    clearDate()
    $('#error').removeClass('hide')
    $('#error').html('It looks like you have no filters added')
    return true
  }
}

$('#clear-filters').on('click', function(e) {
  e.preventDefault()
  localStorage.clear()
  isLocalStorageEmpty()
})

$('#add-show').on('click', function(e) {
  e.preventDefault()
  var data = localStorage.animes ? JSON.parse(localStorage.animes) : []
  var text = $('#add-show-text').val()
  if (!text) return
  data.push(text)
  localStorage.animes = JSON.stringify(data)
  $('#add-show-text').val('')
  isLocalStorageEmpty()
  updateFilters()
})

//if click on li element, remove it
$('#filters').on('click', 'li', function(e) {
  var target = $(e.target)
  if (!isLocalStorageEmpty()) {
    //name of filter and index of list in ul
    removeFromLS(target.html(), target.index())
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
  var list = JSON.parse(localStorage.animes)
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
    socket.emit('filter', {filters: localStorage.animes})
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
  var animes = JSON.parse(localStorage.animes)
  animes.splice(index, 1)
  if (animes.length == 0) {
    localStorage.clear()
  } else {
    localStorage.animes = JSON.stringify(animes)
  }
  updateFilters()
}
})