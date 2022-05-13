$(document).ready(function() {

  const inputField = document.getElementById('autoComplete');
  const inputHandler = function(e) {
    if(e.target.value == ""){
      $('.search-button').attr('disabled', true);
    }
    else{
      $('.search-button').attr('disabled', false);
    }
  }
  inputField.addEventListener('input', inputHandler);

  $('.search-button').on('click',function(){
    var my_api_key = '97933c59065a2f21b4f313c8ef927b47';
    var entered_title = $('.input').val();
    if (entered_title=="") {
      $('.success').css('display','none');
      $('.failed').css('display','block');
    }
    else{
      load_details(my_api_key,entered_title);
    }
  });
});


function load_details(my_api_key,title){
  console.log(title);
  $.ajax({
    type: 'GET',
    url:'https://api.themoviedb.org/3/search/movie?api_key='+my_api_key+'&query='+title,

    success: function(movie){
      if(movie.results.length<1){
        $('.failed').css('display','block');
        $('.success').css('display','none');
        $("#loader").delay(500).fadeOut();
      }
      else{
        $("#loader").fadeIn();
        $('.failed').css('display','none');
        $('.success').delay(1000).css('display','block');
        var movie_id = movie.results[0].id;
        var movie_title = movie.results[0].original_title;
        movie_recs(movie_title,movie_id,my_api_key);
      }
    },
    error: function(e){
      console.log('Unalbe to load Details');
      $("#loader").delay(500).fadeOut();
    },
  });
}