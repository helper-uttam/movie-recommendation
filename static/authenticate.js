// for login 
let selectedChoices = "", username = ""

$(document).ready(function() {

    const input = document.getElementById('usernameInp');
    const inputHandler = function(e) {
        username = e.target.value
        if(e.target.value == ""){
          $('.submitForm').attr('disabled', true);
        }
        else if(e.target.value != "" && selectedChoices != ""){
          $('.submitForm').attr('disabled', false);
        }       
      }
      
    input.addEventListener('input', inputHandler);

    
    //on selecting options
    $("input[type=checkbox]").on('click', function (e) {
        for (var i = 1;i <= 4; i++){
            document.getElementById("check" + i).checked = false;
        }
        document.getElementById(e.target.id).checked = true;

        if(selectedChoices.length == 0){
            selectedChoices = e.target.value
        }else{
            selectedChoices = ""
            selectedChoices = e.target.value
        }

        if(username != "" && selectedChoices != ""){
            $('.submitForm').attr('disabled', false);
        } 
    });
      
  $('.submitForm').on('click',function(e){  
        e.preventDefault();
        var username = $(input).val();
        handleSubmit(username);
  });

})

async function handleSubmit () {
    
    $.ajax({
    type:'POST',
    url:"/signup",
    data:{
      'username':username,
      'LikedMovie':selectedChoices
    },
    success: function(mes){
      console.log(mes);
        // searchMovieWithCategory("97933c59065a2f21b4f313c8ef927b47", '102382')
    },
    error: function(e){
        console.log("Sometthing went wrong");
    }
    }); 
}

function searchMovieWithCategory(API_KEY,id){
    $.ajax({
      type: 'GET',
      url:'https://api.themoviedb.org/3/movie/'+id+'?api_key='+API_KEY,
  
      success: function(movie){
        //  if we didn't get any movie details to show
        if(movie.length<1){
          $('.failed').css('display','block');
          $('.success').css('display','none');
        }
        // if we got some movies to show
        else{
          $('.failed').css('display','none');
          $('.success').delay(1000).css('display','block');
          var id = movie.id; 
          var title = movie.original_title;
          getSimilarMovies(title,id,API_KEY);
        }
      },
      error: function(){
        console.log('Something went wrong in searchMovieWithTitle func');
        $("#loader").delay(400).fadeOut();
      },
    });
  }
  
  // making a POST req by passing the title of the movie in the body to get similar movies
  function getSimilarMovies(title,id,API_KEY){
    $.ajax({
      type:'POST',
      url:"/createsimilarity",
      data:{'title':title},
      success: function(data){
        // if there is no similar data
        if(data=="Sorry! Your request can not be completed at the movement. Please check if you spelt everything correctly or try with some other movies"){
          $('.failed').css('display','block');
          $('.success').css('display','none');
        }
        else {
          $('.failed').css('display','none');
          $('.success').css('display','block');
          var movie_arr = data.split(' || ');
          var results = [];
          for(const movie in movie_arr){
            results.push(movie_arr[movie]);
          }
          fetch_movie_details(id, results, title, API_KEY);
        }
      },
      error: function(){
        console.log("Something went wrong in getSimilarMovies func");
      },
    }); 
  }
  
  
  // fetch all the details of the movie using the movie id.
  function fetch_movie_details(id, results, title, API_KEY) {
    $.ajax({
      type:'GET',
      url:'https://api.themoviedb.org/3/movie/'+id+'?api_key='+API_KEY,
      success: function(data){
        show_details(data,results,title,API_KEY,id);
      },
      error: function(){
        console.log("API Error!");
      },
    });
  }
  
  
  // passing all the details to python's flask for displaying and scraping the movie reviews using imdb id
  function show_details(movie_details,results,movie_title,API_KEY,movie_id){
    var imdb_id = movie_details.imdb_id;
    var poster_path = 'https://image.tmdb.org/t/p/original'+movie_details.poster_path;
    var overview = movie_details.overview;
    var genres = movie_details.genres;
    var rating = movie_details.vote_average;
    var vote_count = movie_details.vote_count;
    var release_date = new Date(movie_details.release_date);
    var runtime = parseInt(movie_details.runtime);
    var status = movie_details.status;
    var genre_list = []
    for (var genre in genres){
      genre_list.push(genres[genre].name);
    }
    var my_genre = genre_list.join(", ");
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
  
    details = {
        'title':movie_title,
        'cast_ids':JSON.stringify(movie_cast.cast_ids),
        'cast_names':JSON.stringify(movie_cast.cast_names),
        'cast_characters':JSON.stringify(movie_cast.cast_characters),
        'cast_profiles':JSON.stringify(movie_cast.cast_profiles),
        'cast_bdays':JSON.stringify(indiviudal_cast.cast_bdays),
        'cast_bios':JSON.stringify(indiviudal_cast.cast_bios),
        'cast_places':JSON.stringify(indiviudal_cast.cast_places),
        'imdb_id':imdb_id,
        'poster':poster_path,
        'genres':my_genre,
        'overview':overview,
        'rating':rating,
        'vote_count':vote_count.toLocaleString(),
        'release_date':release_date.toDateString().split(' ').slice(1).join(' '),
        'runtime':runtime,
        'status':status,
        'rec_movies':JSON.stringify(results),
        'rec_posters':JSON.stringify(results_poster),
    }
    $.ajax({
      type:'POST',
      data:details,
      url:"/recommendmovies",
      dataType: 'html',
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
  
    top_10 = [0,1,2,3,4,5,6,7,8,9];
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
  
  