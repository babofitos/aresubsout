$(document).ready(function() {

if (localStorage.animes) {
  $.ajax({
    type: 'POST'
  , url: window.location.href
  , data: {data: localStorage.animes}
  , error: function() {
    $('#notification').html('Error retrieving data')
  }
  , success: function(data) {
      displayData(data)
    }
  })
} else {
  $('#notification').html('It looks like you have no anime added')
}

$('#add-show').on('click', function(e) {
  e.preventDefault()
  var data = localStorage.animes ? JSON.parse(localStorage.animes) : []
  data.push($('#add-show-text').val().toLowerCase())
  localStorage.animes = JSON.stringify(data)
  $('#add-show-text').val('')
})

function displayData(data) {
  var len = data.results.length
  for (var i=0;i<len;i++) {
    $('#list').append(
      $('<li/>', {
        class: 'item'
      , html: makeLink(data.results[i])
      })
    )
  }
}
function makeLink(data) {
  return $('<a/>', {
    class: 'list-link'
  , href: data.link
  , text: data.title
  })
}
})