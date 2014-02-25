/** Shoves a 'load' method into the JSON object that async-GETs data from a same-origin url */
JSON.load = function(url, callback) {
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "json";
    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            callback(request.response);
        }
    };
    request.send();
};

/** Obtains the channels followed by a user and adds them to the 'channel_previews' nav item */
function get_follows(username) {
    var url = "http://api.twitch.tv/kraken/users/"+username+"/follows/channels?limit=24&offset=0&on_site=1";
    JSON.load(url, function(data) {
        for (var i = 0; i < data.follows.length; i++) {
            var channel = data.follows[i].channel;
            var li = "<li class='preview_li' style='height=35px; position: relative;'>";
            var a = "<a class='clearfix preview_link' href='#' data-channel_name="+channel.display_name+" style='line-height:22px;'>";
            var span1 = "<span class='logo' style='display:inline-block;'>";
            var img = "<img src="+channel.logo+" height=20 width=20 style='margin-top:-8px;margin-left:25px;'>";
            var span2 = "<span class='title' style='display: inline-block; margin-left: 10px; margin-top: 5px'>"+channel.display_name;
            var element = li + a + span1 + img + "</img></span>" + span2 + "</span></a></li>";
            document.getElementById("channel_previews").innerHTML += element;
        }
    });
}

/** Scrapes the username out of the webpage and returns it */
function get_username() {
    var elements = document.getElementById("you").getElementsByClassName("username");
    if (elements.length == 0)
        return undefined;
    return elements[0].innerText;
}

//not currently being used but might when moving off of embed.ly. Do not remove
/*
var generate_embed = function(channel){
	return "<object type='application/x-shockwave-flash' height='378' width='620' id='live_embed_player_flash' data='http://www.twitch.tv/widgets/live_embed_player.swf?channel="+channel+"' bgcolor='#000000'><param name='allowFullScreen' value='true' /><param name='allowScriptAccess' value='always' /><param name='allowNetworking' value='all' /><param name='movie' value='http://www.twitch.tv/widgets/live_embed_player.swf' /><param name='flashvars' value='hostname=www.twitch.tv&channel="+channel+"&auto_play=true&start_volume=25' /></object>";
};*/

var popup_video = function(loc){
	console.log("enabling popup");
	$(".popup").remove();
	var offset = loc.offset().top;
	var url = "http://twitch.tv/"+loc.data('channel_name');

	var box = 	"<div class='popup' style='position: absolute;padding: 20px 20px;border: 2px solid #333;background: #fff;left: 20px;top:"+offset+"px; z-index: 5;overflow: visible;'> \
	 				<h3> "+loc.data("channel_name")+" (Preview) <span class='xout' style='float:right; cursor: pointer;'> X </span></h3> \
	 				<div id='player'></div> \
	 				<p> <a href='"+url+"'> Switch to this stream </a> </p> \
	 			</div>";
	$("#main_col").append(box);

	var maxwidth = $('#popup div').width();

	console.log(url)

	$.embedly.oembed(url, {query: {maxwidth: maxwidth, autoplay: true}})
		.progress(function(obj){
			console.log(obj);
			$(".popup div").html(obj.html);			
		});

	return false;
};

$("#nav").on("click", ".preview_link", function(){
	popup_video($(this));
});
$("#main_col").on("click", '.xout', function(){
	$(".popup").remove();
});

var username = get_username();
if (username) {
	var follow_nav = 		"<div class='nav_section js-nav-menu' id='nav_preview'> \
							<div class='header'>Preview</div> \
							<ul class='game_filters' id = 'channel_previews'></ul> \
							<div class='nav-divider'></div> \
						</div>";
	$("#nav_primary").before(follow_nav);
	get_follows(username);
} else {
	console.log("TwitchSwitch: Could not get username (is a user logged in?)");
}
