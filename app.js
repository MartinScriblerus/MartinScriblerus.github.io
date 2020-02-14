// Loads the YouTube IFrame API JavaScript code.
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
// Inserts YouTube JS code into the page.
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;

// onYouTubeIframeAPIReady() is called when the IFrame API is ready to go.
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
 
        zoom: 10,
        videoId: 'TW733Ut5zE0', // the ID of the video (mentioned above)
        playerVars: {
          autoplay: 1, // start automatically
          start: 1,
            
            mute: 1,
          end: 3,
          controls: 0, // don't show the controls (we can't click them anyways)
          modestbranding: 1, // show smaller logo
          loop: 10, // loop when complete
          playlist: 'TW733Ut5zE0' // required for looping, matches the video ID
        }
  });
}