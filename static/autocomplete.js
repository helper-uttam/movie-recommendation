//constructor for autocomplete feature
new autoComplete({
    // specifying the src that is defined in recommend.js
    data: {                             
      src: movies,
    },
    selector: "#input_autocomplete",                        
    resultsList: {                      
        render: true,
        container: source => {
            source.setAttribute("id", "searchAutocompleteItems");
        },
        destination: document.querySelector("#input_autocomplete"),
        position: "afterend", //after search bar
        element: "ul" //append elements as unordered list
    },
    maxResults: 5, //upto 5 suggestions                         
    highlight: true,  //matching keywords highlighting                     
    
    onSelection: item => {             
        //setting the value property of #input_autocomplete 
        // to access it while fetching movies data with its selected title
        document.getElementById('input_autocomplete').value = item.selection.value;
    }
});