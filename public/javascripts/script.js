$(document).ready(function() {
function isLocalStorageEmpty() {
  if (localStorage.animes && JSON.parse(localStorage.animes).length !== 0) {
    hideNotification(true)
    return false
  } else {
    hideNotification(false)
    return true
  }
}

function hideNotification(hide) {
  hide ? $('#notification').addClass('invis') : $('#notification').removeClass('invis')
}

if (!isLocalStorageEmpty()) {
  buildFilters()
  fetch()
}

$('#add-show').on('click', function(e) {
  e.preventDefault()
  var data = localStorage.animes ? JSON.parse(localStorage.animes) : []
  data.push($('#add-show-text').val().toLowerCase())
  localStorage.animes = JSON.stringify(data)
  $('#add-show-text').val('')
  isLocalStorageEmpty()
  updateFilters()
})

//if click on li element, remove it
$('#filters').on('click', 'li', function(e) {
  var target = $(e.target)
  //name of filter and index of list in ul
  removeFromLS(target.html(), target.index())
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
    $('#error').removeClass('hide')
  }
  , success: function(data, status) {
      //clear prev results
      $('#list').html('')

      $('#error').addClass('hide')
      
      if (status == 'success') {
        displayData(data.results)
        showFetchDate()
      }
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

function showFetchDate() {
  var date = new Date(Date.now()).toString()
  $('#date').html(date)
}

function removeFromLS(filter, index) {
  var animes = localStorage.animes ? JSON.parse(localStorage.animes) : []
  animes.splice(index, 1)
  localStorage.animes = JSON.stringify(animes)
  updateFilters()
  isLocalStorageEmpty()
}
})