
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
    var API_KEY = '97933c59065a2f21b4f313c8ef927b47';
    var entered_title = $('.input').val();
    if (entered_title=="") {
      $('.success').css('display','none');
      $('.failed').css('display','none');
      $('.prerecommend').css('display','none')
    }
    else{
      searchMovieWithTitle(API_KEY,entered_title, false);
    }
  });
  fetchIntrest()
});


let fetchIntrest = () => {
  let user = localStorage.getItem('username')
  if(user){  
    $.ajax({
      type: 'GET',
      url:'/user/'+user,
      success: function(res){
        const resp = JSON.parse(res) //genresID
        return getDataFromGenresID(resp.data, '97933c59065a2f21b4f313c8ef927b47')
      },
      error: function(){
        console.log('Something went wrong in findIntrest func');
      },
    });
  }
}


function getDataFromGenresID(genres, API_KEY) {
  //27 -> horror, 28 -> action, 878 -> scifi, 35 -> comedy, 10749 -> romance
  let titles = [], id;
  $.ajax({
    type: 'GET',
    url:'https://api.themoviedb.org/3/discover/movie?api_key=' + API_KEY + '&year=2017&with_genres='+genres,
    success: function(res){
      res.results.map((item, index) => {
        if(index == 10) return;
        titles.push(item.original_title);
      })
      title = res.results[0].original_title;
      id = res.results[0].id; //on the basis of this 
      $('.prerecommend').css('display','block')
      fetch_movie_details(id, titles, title, API_KEY, true);
    },
    error: function(){
      console.log('Something went wrong in findIntrest func');
    },
  });
}

function searchMovieWithTitle(API_KEY,title, hideSimilarMovies){
  $.ajax({
    type: 'GET',
    url:'https://api.themoviedb.org/3/search/movie?api_key='+API_KEY+'&query='+title,

    success: function(movie){
      //  if we didn't get any movie details to show
      if(movie.results.length<1){
        $('.failed').css('display','block');
        $('.success').css('display','none');
        $('.prerecommend').css('display','none')
        $("#loader").delay(400).fadeOut();
      }
      // if we got some movies to show
      else{
        $("#loader").fadeIn();
        $('.failed').css('display','none');
        $('.prerecommend').css('display','none')
        $('.success').delay(400).css('display','block');
        var id = movie.results[0].id; // fetching the first element of thr response array, to be more accurate
        var title = movie.results[0].original_title;
        getSimilarMovies(title,id,API_KEY, hideSimilarMovies);
      }
    },
    error: function(e){
      console.log('Something went wrong in searchMovieWithTitle func');
      $("#loader").delay(400).fadeOut();
    },
  });
}


function searchMovieWithCategory(API_KEY,id, showOnlySimilarMovies){
  $.ajax({
    type: 'GET',
    url:'https://api.themoviedb.org/3/movie/'+id+'?api_key='+API_KEY,

    success: function(movie){
      //  if we didn't get any movie details to show
      if(movie.length<1){
        $('.failed').css('display','block');
        $('.success').css('display','none');
        $("#loader").delay(400).fadeOut();
      }
      // if we got some movies to show
      else{
        $("#loader").fadeIn();
        $('.failed').css('display','none');
        $('.success').delay(1000).css('display','block');
        var id = movie.id; 
        var title = movie.original_title;
        getSimilarMovies(title,id,API_KEY, showOnlySimilarMovies);
      }
    },
    error: function(e){
      console.log('Something went wrong in searchMovieWithCateg func');
      $("#loader").delay(400).fadeOut();
    },
  });
}

// making a POST req by passing the title of the movie in the body to get similar movies
function getSimilarMovies(title,id,API_KEY, showOnlySimilarMovies){
  $.ajax({
    type:'POST',
    url:"/createsimilarity",
    data:{'title':title},
    success: function(data){
      // if there is no similar data
      if(data=="Not present in CSV file"){
        $('.failed').css('display','block');
        $('.success').css('display','block');
        $("#loader").delay(400).fadeOut();
      }
      else {
        $('.failed').css('display','none');
        $('.success').css('display','block');
        var movie_arr = data.split(' || ');
        var similarMoviesTitles = [];
        for(const movie in movie_arr){
          similarMoviesTitles.push(movie_arr[movie]);
        }
      }
      fetch_movie_details(id, similarMoviesTitles, title, API_KEY, showOnlySimilarMovies);
    },
    error: function(){
      console.log("Something went wrong in getSimilarMovies func");
      $("#loader").delay(400).fadeOut();
    },
  }); 
}


// fetch all the details of the movie using the movie id.
function fetch_movie_details(id, results, title, API_KEY, showOnlySimilarMovies) {
  $.ajax({
    type:'GET',
    url:'https://api.themoviedb.org/3/movie/'+id+'?api_key='+API_KEY,
    success: function(data){
      prcessedDetails(data,results,title,API_KEY,id, showOnlySimilarMovies);
    },
    error: function(){
      console.log("API Error!");
      $("#loader").delay(400).fadeOut();
    },
  });
}


// passing all the details to python's flask for displaying and scraping the movie reviews using imdb id
function prcessedDetails(movie_details,results,movie_title,API_KEY,movie_id, showOnlySimilarMovies){
  var genres = movie_details.genres;
  var date = new Date(movie_details.release_date);
  var runtime = parseInt(movie_details.runtime);
  var genreList = []
  for (var genre in genres){
    genreList.push(genres[genre].name);
  }
  var my_genre = genreList.join(", ");

  if(runtime%60==0){
    runtime = Math.floor(runtime/60)+" hrs"
  }
  else {
    runtime = Math.floor(runtime/60)+" hrs"+ (runtime%60)+" min"
  }

  // list of posters of all the similar movies
  results_poster = get_posters(results,API_KEY);
  
  movie_cast = get_cast(movie_id,API_KEY);
  
  indiviudal_cast = get_individual_cast(movie_cast,API_KEY);

  if(showOnlySimilarMovies == true){
    movie_title = ''
  }
  details = {
      'title':movie_title,
      'id':movie_details.imdb_id,
      'ids':JSON.stringify(movie_cast.cast_ids),
      'names':JSON.stringify(movie_cast.cast_names),
      'places':JSON.stringify(indiviudal_cast.cast_places),
      'bdays':JSON.stringify(indiviudal_cast.cast_bdays),
      'bios':JSON.stringify(indiviudal_cast.cast_bios),
      'poster':'https://image.tmdb.org/t/p/original'+movie_details.poster_path,
      'profiles':JSON.stringify(movie_cast.cast_profiles),
      'characters':JSON.stringify(movie_cast.cast_characters),
      'genres':my_genre,
      'overview':movie_details.overview,
      'rating':movie_details.vote_average,
      'vote_count':movie_details.vote_count.toLocaleString(),
      'release_date': date.toDateString().split(' ').slice(1).join(' '),
      'runtime': movie_details.runtime,
      'status': movie_details.status,
      'movies':JSON.stringify(results),
      'posters':JSON.stringify(results_poster),
  }
  print(details)
  $.ajax({
    type:'POST',
    data:details,
    url:"/recommendmovies",
    dataType: 'html',
    complete: function(){
      $("#loader").delay(300).fadeOut();
    },
    success: function(response) {
      $('.success').html(response);
      $('#autoComplete').val('');
      $(window).scrollTop(0);
    }
  });
}


// getting posters for all the recommended movies
function get_posters(movies, API_KEY){
  var listOfPosters = []
  for(var movie in movies) {
    $.ajax({
      type:'GET',
      url:'https://api.themoviedb.org/3/search/movie?api_key='+API_KEY+'&query='+movies[movie],
      async: false,
      success: function(response){
        listOfPosters.push('https://image.tmdb.org/t/p/original'+response.results[0].poster_path);
      },
      error: function(){
        console.log("Unable to get movie posters!");
        $("#loader").delay(500).fadeOut();
      },
    })
  }
  return listOfPosters;
  }
  


// getting the details of the cast for the requested movie
function get_cast(movie_id,API_KEY){
  cast_ids= [];
  cast_names = [];
  cast_characters = [];
  cast_profiles = [];

  top_10 = [];
  $.ajax({
    type:'GET',
    url:"https://api.themoviedb.org/3/movie/"+movie_id+"/credits?api_key="+API_KEY,
    async:false,
    success: function(response){
      if(response.cast.length>=10){
        top_cast = [0,1,2,3,4,5,6,7,8,9];
      }
      else {
        top_cast = [0,1,2,3,4];
      }
      for(var castIndex in top_cast){
        cast_ids.push(response.cast[castIndex].id)
        cast_names.push(response.cast[castIndex].name);
        cast_characters.push(response.cast[castIndex].character);
        cast_profiles.push("https://image.tmdb.org/t/p/original"+response.cast[castIndex].profile_path);
      }
    },
    error: function(){
      console.log("Unable to fetch cast!");
      $("#loader").delay(500).fadeOut();
    }
  });
  return {cast_ids:cast_ids,cast_names:cast_names,cast_characters:cast_characters,cast_profiles:cast_profiles};
}



// get the details of individual cast
function get_individual_cast(movie_cast,my_api_key) {
  cast_bdays = [];
  cast_bios = [];
  cast_places = [];
  for(var cast_id in movie_cast.cast_ids){
    $.ajax({
      type:'GET',
      url:'https://api.themoviedb.org/3/person/'+movie_cast.cast_ids[cast_id]+'?api_key='+my_api_key,
      async:false,
      success: function(cast_details){
        cast_bdays.push((new Date(cast_details.birthday)).toDateString().split(' ').slice(1).join(' '));
        cast_bios.push(cast_details.biography);
        cast_places.push(cast_details.place_of_birth);
      }
    });
  }
  return {cast_bdays:cast_bdays,cast_bios:cast_bios,cast_places:cast_places};
}


// when clicked on any of the recommended movies
function recommendSimilarMovies(e){
  var API_KEY = '97933c59065a2f21b4f313c8ef927b47';
  var title_of_movie = e.getAttribute('title'); 
  searchMovieWithTitle(API_KEY,title_of_movie);
}


// when clicked on any items on navbar 
$('.nav-item').on('click',function(e){
  let selectedItem = e.target.getAttribute('value');
  searchMovieWithCategory('97933c59065a2f21b4f313c8ef927b47', selectedItem, true)
  $('.failed').css('display','none');
});


