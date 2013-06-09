exports.compare = function(filter, data, results, ctr) {
  var len = filter.length

  for (var i=0;i<len;i++) {
    //make sure it's a string so that .replace works
    //if user entered a number as a filter
    if (typeof filter[i] !== 'string') { 
      filter[i] = filter[i].toString()
    }
    //make sure the element is not ""
    //if malicious user tries to bypass client js
    if (!filter[i]) continue

    //escape user input if they are regexp special
    var escapeBrackets = filter[i].replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")
      , currentFilter = escapeBrackets.split(' ')
      , re = '(?=.*'

    re += currentFilter.join(')(?=.*')
    re += ').+'
    var reobj = new RegExp(re, "i")
    if (data.key.match(reobj) != null) {
      ctr++
      results.push({ 
        link: data.value.link.replace('http://www.nyaa.eu/?page=download', 'http://www.nyaa.eu/?page=view')
      , title: data.key
      })
    }
  }
}