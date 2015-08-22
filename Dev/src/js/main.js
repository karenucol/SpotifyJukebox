  var BASE_URL = 'https://api.spotify.com/v1/';
  var SEARCH_LIMIT = 5;
  var RELATED_LIMIT = 6;
  var selectedID = '';
  var selectedArtistData = '';
  var albumPopularity = ''; 
  var $ajaxlog = $('#ajaxlog');  
  var $bioPlaceholder = $('#selectedArtistBio');
  var $bio = $('#bio');
  var $viewMoreBio = $('#viewMoreBio');
  var $artistImage = $("#artistImage");
  var $artistName = $("#artistName");
  var $topTracks = $('#topTracks');
//  var $twitterTimeline = $('.twitter-timeline');
  var $albums = $('#albums');
  var $relatedArtists = $('#relatedArtists');
  var $spotifyResults = $('#spotifyresults');  
  var searchResultData = {};

  $(document).ajaxComplete(function(event, request, settings) {
    $ajaxlog.append('<li>Request Complete.</li>');
  });
  $(document).ajaxError(function(event, request, settings, thrownError) {
    $ajaxlog.append('<li>Error requesting page <b>' + settings.url + '</b></li>');
    $ajaxlog.append('<li>Error Thrown: <b>' + thrownError + '</b></li>');
  });
  $(document).ajaxSend(function(event, request, settings) {
    $ajaxlog.append('<li>Starting request at ' + settings.url + '</li>');
  });
  $(document).ajaxStart(function() {
    $ajaxlog.append('<li>ajax call started</li>');
  });
  $(document).ajaxStop(function() {
    $ajaxlog.append('<li>ajax call stopped</li>');
  });
  $(document).ajaxSuccess(function(event, request, settings) {
    $ajaxlog.append('<li>Successful Request!</li>');
  });  
  
  $('.modal-trigger').leanModal();
  

  // SEARCH - SEARCH FOR ARTIST
  $('#artistSearch').keypress(function(e) {
    if (e.which == 13) {
      e.preventDefault();
      // console.log($('#artistSearch').val());
      var query = $('#artistSearch').val();
      if (query.length > 2) {
        // $searchResults.html('');
        searchArtists(query);
        $('#artist').removeClass('hidden');
        var targetContent = $(this).data('navigation-item');
        var topPosition = $('.content-' + targetContent).offset().top;
        $('body').animate ({
          scrollTop: topPosition
        });
        $('.fixed-action-btn').removeClass('hidden');
        $('#top10tracks').removeClass('hidden');
        $('#artistContent').removeClass('hidden');    
        $('#relatedAs').removeClass('hidden');    
      }
    }
  }); 

//SEARCH PAGE - AFTER USER SELECTS ARTIST 
     $('body').on('click', '.artist', function(e) {
      e.preventDefault();
      var query = $(this).data('artist-name');
      searchArtists(query);
      $('.viewLessTracks').css('display', 'none');
      $('.viewMoreTracks').css('display', 'block');
      $('#top10tracks').css('height', '100vh');
      $('#top10tracks').css('overflow-y', 'hidden');
      $albums.css('height', '100vh');
      $('.viewMoreAlbums').css('display', 'block');
      var targetContent = $(this).data('navigation-item');
      var topPosition = $('.content-' + targetContent).offset().top;
      $('body').animate ({
        scrollTop: topPosition
      });
      $('#artistSearch').val($(this).data('artist-name'));
      // console.log('related artist:' + $('#artistSearch').val());
    });

//LANDING PAGE TO SEARCH PAGE
  $('body').on('click', '.btn-large i', function(e) {
    var targetContent = $(this).data('navigation-item');
    var topPosition = $('.content-' + targetContent).offset().top;
    $('body').animate ({
      scrollTop: topPosition
    });
  });

//GO BACK TO SEARCH PAGE
  $('body').on('click', '.searchAgain', function(e) {
    var targetContent = $(this).data('navigation-item');
    var topPosition = $('.content-' + targetContent).offset().top;
    $('#artistSearch').html('');
    $('body').animate ({
      scrollTop: topPosition
    });
  });

//TOP TRACKS - VIEW MORE
  $('body').on('click', '#topTracksMore', function(e) {
    e.preventDefault();
    $('.viewMoreTracks').css('display', 'none');
    $('#top10tracks').css('overflow-y', 'hidden');
    $('#top10tracks').css('height', '100%')
    $('.viewLessTracks').css('display', 'block');
  });

//TOP TRACKS - VIEW LESS
  $('body').on('click', '#topTracksLess', function(e) {
    e.preventDefault();
    $('.viewLessTracks').css('display', 'none');
    var targetContent = $(this).data('navigation-item');
    var topPosition = $('.content-' + targetContent).offset().top;
    $('body').animate ({
      scrollTop: topPosition
    });
    $('#top10tracks').css('overflow-y', 'hidden');
    $('#top10tracks').css('height', '100vh');
    $('.viewMoreTracks').css('display', 'block');
  });

//ALBUMS - VIEW MORE
  $('body').on('click', '#albumsMore', function(e) {
    e.preventDefault();
    $albums.css('overflow-y', 'visible');
    $albums.css('max-height', '0');
    $('.viewMoreAlbums').css('display', 'none');
  });



  // $('body').on('click', '.artist', function(e) {
  //    e.preventDefault();
  //    selectedIndex = $(this).attr('data-selected-index');
  //    selectedID = $(this).attr('href');
  //    displayArtistData(selectedIndex);
  // });
  
  // $('body').on('click', '#searchagainbutton', function(e) {
  //   $('#searchcard').removeClass('hidden').addClass('animated bounceInDown');
  // });
  
  // $('body').on('click', '#spotifylogin', function(e) {
  //   e.preventDefault();
  //   console.log($(this).attr('id') + ' clicked');    
  //   console.log(e);
  //   window.location = BUILT_URL;
  // }); 

//GET SPOTIFY DATA - TOP TRACKS, ALBUMS, RELATED ARTISTS, ARTIST IMAGE
  function getTopTracksByID(artistID) {
    // console.log(artistID);
    return $.get(BASE_URL + 'artists/' + artistID + '/top-tracks?country=US')
    .pipe(renderTopTracks);
  } 

  function getAlbums(artistID) {
    // console.log('albums url: ' + BASE_URL + 'artists/' + artistID + '/albums')
    return $.get(BASE_URL + 'artists/' + artistID + '/albums')
    .pipe(renderAlbums);
  }
  
  function getRelatedByID(artistID) {
    return $.get(BASE_URL + 'artists/' + artistID + '/related-artists')
    .pipe(trimResults)
    .pipe(renderRelated);
  }

  function getArtistImage(artistID) {
    return $.get(BASE_URL + 'artists/' + artistID)
    .pipe(renderArtistImage);
  }


  function trimResults(response) {
    if (response.artists.length > RELATED_LIMIT) {
      response.artists = response.artists.slice(0, RELATED_LIMIT);
    }
    return response;
  }
  
  //SEARCH - QUERY
  function searchArtists(query) {
    var oData = {
      q: query,
      type: 'artist',
      limit: SEARCH_LIMIT,
      offset: 0,
      market: 'US',
      album_type: 'album'
    };
    var url = BASE_URL+'search';
    $.ajax ({
      url: url,
      data: oData,
      success: function(data) {
        return $.get(url, oData)
        .pipe(renderSearchResults);
      },
      fail: function(){
        alert("Please input valid artist");
      } 
    });
  }

//SEARCH - DISPLAY ARTISTS
  function renderSearchResults(response) {
    searchResultData = response;
    // console.log(response.artists.items);
    var artists = response.artists.items;
    if (artists.length > 0) {
      displayArtistData(0);
    }
  }


//RENDER BIO DATA
  function renderArtistImage(artist) {
    // console.log("artist image: " + artist);
    $artistImage.attr('src', artist.images[0].url);
    $artistName.html(artist.name);
  }

    function getBiographies(query){
  // console.log("biographies: "+selectedID);
    $.ajax({
      url:"http://developer.echonest.com/api/v4/artist/biographies?api_key=WFQW0DDRWPPLDK1JT&id=spotify:artist:"+selectedID,
      success: function(data){
      for (var i = 0; i < data.response.biographies.length; i++) {
        var biotext = data.response.biographies[i].text;
        if (biotext.length > 100) {
          $bio.html(biotext); 
          var biourl = '<a href="'+data.response.biographies[i].url+'" target="_blank"><p>See full bio</p><a>';
          $viewMoreBio.html(biourl);
          break;
        } 
      }
    }
  });
};

/*TWITTER*/
function insertTwitter(d,s,id){
   // console.log('insert twitter');
   var js,fjs=d.getElementsByTagName(s)[0],
       p=/^http:/.test(d.location)?'http':'https';

   if(!d.getElementById(id)){
     js=d.createElement(s);js.id=id;
     js.src=p+"://platform.twitter.com/widgets.js";
     fjs.parentNode.insertBefore(js,fjs);
   }
 };

 function getTweets(artistID) {
   var eID = 'spotify:artist:' + artistID;
   var url = 'http://developer.echonest.com/api/v4/artist/twitter?api_key=RKFREUONDORDOYUPI&id='+eID+'&format=json'
   // console.log('tweetsID: ', eID);
   $.ajax ({
     url: url,
     success: function(data) {
       // console.log('Tweets data: ', data);
       var twitterHandle = data.response.artist.twitter;
       var twitterUrl = 'https://twitter.com/' + data.response.artist.twitter;
       $twitterTimeline.attr('href', twitterUrl);
       $twitterTimeline.attr('data-screen-name', twitterHandle);
       $twitterTimeline.attr('screen-name', twitterHandle);
       $twitterTimeline.attr('height', '400px');
       insertTwitter(document,"script","twitter-wjs");
     }
   });
 }

//RENDER TOP TRACKS DATA
  function renderTopTracks(topTracks) {
    console.log('topTracks: ', topTracks);
    var topTracksResult = '';
    var viewMoreBtn = '';
    for (var i = 0; i < topTracks.tracks.length; i++) {
      // console.log('topTracksFor: ', topTracks);
      var trackName = topTracks.tracks[i].name;
      var trackTime = topTracks.tracks[i].duration_ms;
      var seconds = Math.round(trackTime/1000);
      var minutes = Math.floor(seconds/60);
      var time = minutes + ":" + seconds%60;
      if (time.length == 3) {
        time = minutes + ':0' + seconds%60;
      }
      // console.log("track time: " + trackTime);
      var albumCover = topTracks.tracks[i].album.images[2].url;
      var href = topTracks.tracks[i].href;
      var number = i+1;
      var externalURL = topTracks.tracks[i].external_urls.spotify;
      // console.log("minutes: " + minutes%60);
      // console.log("seconds: " + seconds);
      // console.log('trackName: ' + trackName);
      topTracksResult += '<tr><td>'+number+'</td><td><img src="'+albumCover+'"></td><td>'+trackName+'</td><td>'+time+'</td><td><a class="playBtn btn-floating btn-small waves- waves-light lime lighten-1" href="'+externalURL+'" target="_blank"><i class="material-icons">play_arrow</i></a></td></tr>' 
      // console.log('topTracksResult: ' + topTracksResult);
    }
    if (topTracks.tracks.length > 3) {
      $('.viewMoreTracks').css('display', 'block');
    }
    else {
      $('.viewMoreTracks').css('display', 'none');
    }
    $topTracks.html(topTracksResult);
  }

//RENDER ALBUMS DATA
  function renderAlbums(albums) {
    var albumsResult = '';
    var response = albums.items;
    if (response[0].name != 'null') {
      // albumsResult += '<div class="no-text section-header"><div class="title"><i class="material-icons">'+"albums"+'</i><h3>'+"Albums"+'</h3></div></div>';
      albumsResult += '<figure class="effect-apollo"><a href="'+response[0].external_urls.spotify+'" target="_blank"><img src="'+response[0].images[0].url+'"><figcaption><h2>'+response[0].name+'</h2><i class="material-icons">play_circle_filled</i></figcaption></a></figure>'
    }
    for (var i = 0; i < response.length-1; i++) {
      var albumNamePrev = response[i].name;
      var albumNameCur = response[i+1].name;
      // console.log('albumNamePrev:', albumNamePrev);
      // console.log('albumNameCur:', albumNameCur);
      var albumCover = response[i+1].images[0].url;
      var albumID = response[i+1].id;
      var externalURL = response[i+1].external_urls.spotify;
      // console.log('albums: ' + response);
      if (albumNameCur != albumNamePrev && response[i].type === 'album') {
        albumsResult += '<figure class="effect-apollo wow fadeIn"><a href="'+externalURL+'" target="_blank"><img src="'+albumCover+'"><figcaption><h2>'+albumNameCur+'</h2><i class="material-icons">play_circle_filled</i></figcaption></a></figure>';
      }
    }
    if (response.length > 5) {
      albumsResult += '<div class="viewMoreAlbums"><a href="#" id="albumsMore">'+"View More"+'</a></div>';
      $('#albums').css('overflow-y', 'hidden');
    }
    $albums.html(albumsResult);
  }

    //RENDER RELATED ARTISTS
  function renderRelated(relatedArtists) {
    // console.log('relatedArtists: ', relatedArtists);
    // console.log('passed to template2: ', relatedArtists.artists);
    var rArtistsResult = '';
    // rArtistsResult += '<div class="no-text section-header"><div class="title"><i class="material-icons">'+"headset"+'</i><h3>'+"Related Artists"+'</h3></div></div>';
    for (var i = 0; i < 5; i++) {
      // var artistPicture = rArtists;
      var artistName = relatedArtists.artists[i].name;
      var artistID = relatedArtists.artists[i].id;
      var artistImage = relatedArtists.artists[i].images[0].url;
      var artistPopularity = relatedArtists.artists[i].popularity;
      rArtistsResult += '<figure class="effect-apollo wow fadeIn"><a class="artist" data-selected-index="'+i+'" data-navigation-item="1" data-artist-name="'+artistName+'" href="'+artistID+'"><img src="'+artistImage+'"><figcaption><h2>'+artistName+'</h2></figcaption></a></figure>';

//      rArtistsResult += '<figure class="effect-apollo wow fadeIn"><a class="artist" data-selected-index="'+i+'" data-navigation-item="1" data-artist-name="'+artistName+'" href="'+artistID+'"><img src="'+artistImage+'"><figcaption><h2>'+artistName+'</h2><i class="material-icons">youtube_searched_for</i></figcaption></a></figure>';
      // console.log("artistResult: " + rArtistsResult);
    }
    $relatedArtists.html(rArtistsResult);
  }

//DISPLAY ALL DATA
  function displayArtistData(index) {
    selectedArtistData = searchResultData.artists.items[index];
    selectedID = searchResultData.artists.items[index].id;
    // console.log('passed to template1: ', selectedArtistData);
    getArtistImage(selectedID);
    getTopTracksByID(selectedID);
    getBiographies(selectedID);
    getAlbums(selectedID);
    getTweets(selectedID);
    getRelatedByID(selectedID);
    // $searchResults.html('');
  }

  // function justDisplayResponse(response) {
  //   Console.log('response: ', response);
  // }