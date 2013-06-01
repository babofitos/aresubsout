$(document).ready(function() {

if (localStorage.animes) {
  buildFilters()
  fetch()
} else {
  $('#notification').html('It looks like you have no filters added')
}

$('#add-show').on('click', function(e) {
  e.preventDefault()
  var data = localStorage.animes ? JSON.parse(localStorage.animes) : []
  data.push($('#add-show-text').val().toLowerCase())
  localStorage.animes = JSON.stringify(data)
  $('#add-show-text').val('')
  updateFilters()
  fetch()
})

$('#filters').on('click', function(e) {
  //if click on li element, remove it
  if ($(e.target).is('li')) {
    var target = $(e.target)
    //name of filter and index of list in ul
    removeFromLS(target.html(), target.index())
  }
})

function displayData(data) {
  var len = data.length

  //clear prev results
  $('#list').html('')

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
  $('#filters').html('')
  buildFilters()

  //refetch with updated filters
  fetch()
}

//fetch rss filtered by ls
function fetch() {
  $.ajax({
    type: 'POST'
  , url: window.location.href
  , data: {data: localStorage.animes}
  , error: function() {
    $('#notification').html('Error retrieving data')
  }
  , success: function(data) {
      displayData(data.results)
      showPubDate(data.date)
    }
  })
}

function makeLink(data) {
  return $('<a/>', {
    class: 'list-link'
  , href: data.link
  , text: data.title
  , target: "_blank"
  })
}

function showPubDate(date) {
  $('#date').html(date)
}

function removeFromLS(filter, index) {
  var animes = localStorage.animes ? JSON.parse(localStorage.animes) : []
  animes.splice(index, 1)
  localStorage.animes = JSON.stringify(animes)
  updateFilters()
}
})