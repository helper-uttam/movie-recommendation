// for login 
let selectedChoices = [], username = ""

$(document).ready(function() {

    const input = document.getElementById('usernameInp');
    const inputHandler = function(e) {
        username = e.target.value
        if(username == ""){
          $('.submitForm').attr('disabled', true);
        }
        else if(username != "" && selectedChoices.length > 0){
          $('.submitForm').attr('disabled', false);
        }       
      }
      
    input.addEventListener('input', inputHandler);

    
    //on selecting options
    $("input[type=checkbox]").on('click', function (e) {
        selectedChoices = $('input:checkbox:checked').map((i, el) => el.value).get();
        if(e.target.value != "" && selectedChoices.length > 0){
          $('.submitForm').attr('disabled', false);
        }
    });
      
  $('.submitForm').on('click',function(e){  
        e.preventDefault();
        var username = $(input).val();
        handleSubmit(username);
  });

})

async function handleSubmit (username) {
  let genresString = ""
  selectedChoices.map((item)=>{
    genresString = genresString + '|' + item
  })
    $.ajax({
    type:'POST',
    url:"/signup",
    data:{
      'username':username,
      'LikedMovie':genresString
    },
    success: function(mes){
      const resp = JSON.parse(mes)
      if(resp.message == "Data Inserted"){
          console.log(resp)
          localStorage.setItem("username",username)
          location.reload();
      }else{
        console.log(resp)
        console.log("Cannot insert data");
      }
    },
    error: function(e){
        console.log("Sometthing went wrong");
    }
    }); 
}