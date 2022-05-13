new autoComplete({
    data: {                             
      src: movies,
    },
    selector: "#autoComplete",           
    threshold: 2,                        
    debounce: 100,                       
    searchEngine: "strict",              
    resultsList: {                      
        render: true,
        container: source => {
            source.setAttribute("id", "searchAutocompleteItems");
        },
        destination: document.querySelector("#autoComplete"),
        position: "afterend",
        element: "ul"
    },
    maxResults: 5,                         
    highlight: true,                       
    
    onSelection: item => {             
        document.getElementById('autoComplete').value = item.selection.value;
    }
});