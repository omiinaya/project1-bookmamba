var userInput = "";
var filteredBooks = [];

var bookResponse = "";
var nyResponse = "";
var quoteResponse = "";

var lastrandom = 0;
var random = 0;

var ISBN;

//k
function loadPage() {
  topSellersAjax()
  quotesAjax()
  enterKey()
  buyNow()
  expandQuote()
  expandDescription()
  readMore()
}

function enterKey(){
  var enterText = document.getElementById("search-bar");
  enterText.addEventListener("keyup", function(event) {
    if (event.keyCode===13) {
      event.preventDefault();
      userInput = $("#search-bar").val();
      searchAjax();
    }
  });
}
//o
function ratingFilter() {
  for (var i = 0; i < bookResponse.items.length; i++)
  if (bookResponse.items[i].volumeInfo.averageRating >= 4) {
    filteredBooks.push(bookResponse.items[i]);
  }
  console.log(filteredBooks);
}
text_truncate = function(str, length, ending) {
  if (length == null) {
    length = 100;
  }
  if (ending == null) {
    ending = '..."';
  }
  if (str.length > length) {
    return str.substring(0, length - ending.length) + ending;
  } else {
    return str;
  }
};
//k
function bookData() { //used to be called nextBook. renamed for readability.
  random = 0;
  if (filteredBooks.length > 1) {
    noRepeats()
  }
  $("#bookTitle").html(filteredBooks[random].volumeInfo.title);
  $("#authorSpan").text(filteredBooks[random].volumeInfo.authors);
  $("#publishedDate").text(filteredBooks[random].volumeInfo.publishedDate);
  $("#rating").text(filteredBooks[random].volumeInfo.averageRating);
  shortenDescription()

  if (typeof filteredBooks[random].volumeInfo.imageLinks == "undefined") { //in case the JSON does not return a thumbnail to display.
    $("#bookCover").attr("src","assets/images/128x176_placeholder.png"); //shows placeholder if no thumbnail.
  } else {
    $("#bookCover").attr("src",filteredBooks[random].volumeInfo.imageLinks.thumbnail); 
  }
  ISBN = filteredBooks[random].volumeInfo.industryIdentifiers[0].identifier;
}
//o
function shortenQuote() {
  truncatedQuote = text_truncate('"'+quoteResponse.text+'"', 125); //creates a trimmed version of the quote. 125 character limit.
  fullQuote = '"'+quoteResponse.text+'"';
  if (quoteResponse.text.length-1 > 125) {
    $("#quote-text").text(truncatedQuote);
    $("#quote-more").show();
  } else {
    $("#quote-text").text(fullQuote);
  }
}

function shortenDescription() {
  truncatedDescription = text_truncate('"'+filteredBooks[random].volumeInfo.description+'"', 200);
  fullDescription = '"'+filteredBooks[random].volumeInfo.description+'"';
  var testDescription = filteredBooks[random].volumeInfo.description;
  if (typeof testDescription != "undefined") {
    if (testDescription.length > 200) {
    fullDescription = '"'+filteredBooks[random].volumeInfo.description+'"';
    $("#descriptionText").text(truncatedDescription)
    $("#read-more").show();
    } else {
      $("#descriptionText").text(fullDescription)
    }
  } else {
    $("#descriptionText").text('"A book description was not provided."')
  }
}

function expandQuote() {
  $("#quote-more, #quote-less").click(function() {
    if ($("#quote-text").text() == truncatedQuote) { //if it's already trimmed, 
      $("#quote-text").text(fullQuote) //show full quote.
      $("#quote-more").hide();
      $("#quote-less").show();
    } else {
      $("#quote-text").text(truncatedQuote) //otherwise, trim quote.
      $("#quote-more").show();
      $("#quote-less").hide();
    }
  });
}

function expandDescription() {
  $("#read-more, #read-less").click(function() {
    if ($("#descriptionText").text() == truncatedDescription) {
      $("#descriptionText").text(fullDescription)
      $("#read-more").hide();
      $("#read-less").show();
    } else {
      $("#descriptionText").text(truncatedDescription)
      $("#read-more").show();
      $("#read-less").hide();
    }
  });
}

function noRepeats() { //makes sure there are no repeated random numbers. (the same title wont show up again when pressing next.)
while (random === lastrandom) {
  random = Math.floor(Math.random() * filteredBooks.length);
  }
  lastrandom = random;
}

function searchButton() {
  userInput = $("#search-bar").val();
  searchAjax()
}

function searchAjax() { //used to be called runAjax. renamed for readability.
  filteredBooks = [];
  var queryURL = "https://www.googleapis.com/books/v1/volumes?q="+userInput;
  $.ajax({
    url: queryURL,
    method: "GET"
  }).then(function(response) {
    //assigning global variable bookResponse the value of repsonse so we can use response outside of this function.
    bookResponse = response;
    console.log(bookResponse);
    ratingFilter()
    bookData()
    shareButtons()
    $("#book-section").show();
  });
}

function quotesAjax(){
  var queryURL = "https://type.fit/api/quotes"
  $.ajax({
    url: queryURL,
    method: "GET"
  }).then(function(response) { 
    var data = JSON.parse(response)
    var random = Math.floor(Math.random() * Math.max(data.length, 1));
    console.log(random)
    quoteResponse = data[random % data.length];
    console.log(quoteResponse);
    shortenQuote(random)
    $("#quote-spinner").hide();
    $("#quote-author").text("-"+data[random].author);
    $("#nyTimes").show();
  });
}

//k
function topSellersAjax() {
  var queryURL = "https://api.nytimes.com/svc/books/v3/lists/current/Combined%20Print%20and%20E-Book%20Fiction.json?api-key=6ad84e249d054efeaefe1abb8f89df5b"
  $.ajax({
    url: queryURL,
    method: "GET"
  }).then(function(response) {
    nyResponse = response;
    console.log(nyResponse);
    $("#rank-one-title").html(response.results.books[0].title);
    $("#rank-one-author").text(response.results.books[0].author);
    $("#bestSellerCover").attr("src",response.results.books[0].book_image);
    $("#rank-two-title").html(response.results.books[1].title);
    $("#rank-two-author").text(response.results.books[1].author);
    $("#rank-three-title").html(response.results.books[2].title);
    $("#rank-three-author").text(response.results.books[2].author);
  });
}
//giving buy now button functionality
function buyNow() {
  $("#buyNowBtn").click(function() {
  ISBN = filteredBooks[random].volumeInfo.industryIdentifiers[0].identifier;
  window.open("https://www.amazon.com/s?k="+ISBN+"&i=stripbooks&ref=sdp_tx_srch");
  });
}

//o
//experimental
//
//parse the URL parameter
function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}
// Give the parameter a variable name
var dynamicContent = getParameterByName('q');

$(document).ready(function() {

if (dynamicContent) {
  userInput = dynamicContent;
  searchAjax()
  }
});

function shareButtons() {
  var craftedURL = "https://www.amazon.com/s?k="+ISBN+"&i=stripbooks&ref=sdp_tx_srch";

  var twitterURL = "https://twitter.com/intent/tweet?text=Check out this book! "+craftedURL;
  $("#twitter-button").attr("href", twitterURL)
  var facebookURL = "https://www.facebook.com/sharer/sharer.php?u="+craftedURL+"&quote=Check out this book!";
  $("#facebook-button").attr("href", facebookURL)
  var linkedinURL = "http://www.linkedin.com/shareArticle?mini=true&url="+craftedURL+"&title=Check out this book!!&summary=&source="+craftedURL;
  $("#linkedin-button").attr("href", linkedinURL)
}

//k
function readMore() {
  $("#nytBook1").click(function() {
    if (nyResponse.results.books[0].book_review_link == "") {
      window.open(nyResponse.results.books[0].amazon_product_url);
    } else {
      window.open(nyResponse.results.books[0].book_review_link);

    }
  });
  $("#nytBook2").click(function() {
    if (nyResponse.results.books[1].book_review_link == "") {
      window.open(nyResponse.results.books[1].amazon_product_url);
  } else {
    window.open(nyResponse.results.books[1].book_review_link);
    }
  });
  $("#nytBook3").click(function() {
    if (nyResponse.results.books[2].book_review_link == "") {
      window.open(nyResponse.results.books[2].amazon_product_url);
  } else {
    window.open(nyResponse.results.books[2].book_review_link);
    }
  });
}