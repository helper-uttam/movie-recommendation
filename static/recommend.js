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
    var API_KEY = 'API_KEY';
    var entered_title = $('.input').val();
    if (entered_title=="") {
      $('.success').css('display','none');
      $('.failed').css('display','block');
    }
    else{
      searchMovie(API_KEY,entered_title);
    }
  });
});


function searchMovie(API_KEY,title){
  $.ajax({
    type: 'GET',
    url:'https://api.themoviedb.org/3/search/movie?api_key='+API_KEY+'&query='+title,

    success: function(movie){
      //  if we didn't get any movie details to show
      if(movie.results.length<1){
        $('.failed').css('display','block');
        $('.success').css('display','none');
        $("#loader").delay(500).fadeOut();
      }
      // if we got some movies to show
      else{
        $("#loader").fadeIn();
        $('.failed').css('display','none');
        $('.success').delay(1000).css('display','block');
        var id = movie.results[0].id; // fetching the first element of thr response array, to be more accurate
        var title = movie.results[0].original_title;
        getSimilarMovies(title,id,API_KEY);
      }
    },
    error: function(){
      console.log('Something went wrong in searchMovie func');
      $("#loader").delay(500).fadeOut();
    },
  });
}

// making a POST req by passing the title of the movie in the body to get similar movies
function getSimilarMovies(title,id,API_KEY){
  $.ajax({
    type:'POST',
    url:"/createsimilarity",
    data:{'title':title},
    success: function(recs){
      // if there is no similar data
      if(recs=="Sorry! Your request can not be completed at the movement. Please check if you spelt everything correctly or try with some other movies"){
        $('.failed').css('display','block');
        $('.success').css('display','none');
        $("#loader").delay(500).fadeOut();
      }
      else {
        $('.failed').css('display','none');
        $('.success').css('display','block');
        var movie_arr = recs.split(' || ');
        var results = [];
        for(const movie in movie_arr){
          results.push(movie_arr[movie]);
        }
      }
    },
    error: function(){
      console.log("Something went wrong in getSimilarMovies func");
      $("#loader").delay(500).fadeOut();
    },
  }); 
}