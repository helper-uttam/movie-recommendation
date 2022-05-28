//constructor for autocomplete feature
new autoComplete({
    // specifying the src that is defined in recommend.js
    data: {                             
      src: movies,
    },
    selector: "#autoComplete",                        
    resultsList: {                      
        render: true,
        container: source => {
            source.setAttribute("id", "searchAutocompleteItems");
        },
        destination: document.querySelector("#autoComplete"),
        position: "afterend", //after search bar
        element: "ul" //append elements as unordered list
    },
    maxResults: 5, //upto 5 suggestions                         
    highlight: true,  //matching keywords highlighting                     
    
    onSelection: item => {             
        //setting the value property of #autoComplete 
        // to access it while fetching movies data with its selected title
        document.getElementById('autoComplete').value = item.selection.value;
    }
});