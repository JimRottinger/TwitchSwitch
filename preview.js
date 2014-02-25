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

/** Draws the link into the sidebar for every followed user */
function draw_preview_link(channel){
	var li = "<li class='preview_li' style='height=35px; position: relative;'>";
    var a = "<a class='clearfix preview_link game' href='#' data-channel_name="+channel.display_name+">";
    var img = "<img src="+channel.logo+" height=20 width=20 class='image' />";
    var span = "<span class='title'>"+channel.display_name+"</span>";
    return li + a + img + span + "</a></li>";
}

/** Obtains the channels followed by a user and adds them to the 'channel_previews' nav item */
function insert_user_follows_into_page(username) {
    var url = "http://api.twitch.tv/kraken/users/"+username+"/follows/channels?limit=24&offset=0&on_site=1";
    JSON.load(url, function(data) {
    	var i;
    	for (i=0; i < 5; i++){
    		var channel = data.follows[i].channel;
            document.getElementById("channel_previews").innerHTML += draw_preview_link(channel);
    	}
        for (; i < data.follows.length; i++) {
            var channel = data.follows[i].channel;
            document.getElementById("extra_previews").innerHTML += draw_preview_link(channel);
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

var generate_embed = function(channel){
	return "<object type='application/x-shockwave-flash' height='189' width='310' id='live_embed_player_flash' data='http://www.twitch.tv/widgets/live_embed_player.swf?channel="+channel+"' bgcolor='#000000'><param name='allowFullScreen' value='true' /><param name='allowScriptAccess' value='always' /><param name='allowNetworking' value='all' /><param name='movie' value='http://www.twitch.tv/widgets/live_embed_player.swf' /><param name='flashvars' value='hostname=www.twitch.tv&channel="+channel+"&auto_play=true&start_volume=0' /></object>";
};

/** Pops up the video next to the preview link that was clicked */
var popup_video = function(preview_clicked){
	console.log("enabling popup");
	$(".popup").remove();
	var offset = preview_clicked.offset().top;
	var channel_name = preview_clicked.data('channel_name');
	var url = "http://twitch.tv/"+channel_name;
	var box = 	"<div class='popup' style='position: absolute;padding:12px;border:2px solid #333;background:#fff;left:20px;top:"+offset+"px; z-index:5;overflow:visible;'> \
	 				<span class='xout' style='position:absolute;top:1ex;right:1ex;font-weight:bold;'>X</span>\
	 				<h3><a href="+url+">"+channel_name+"</a> (Preview)</h3> \
	 				<div id='player'>"+generate_embed(channel_name)+"</div> \
	 			</div>";
	$("#main_col").append(box);
};

// popup a video when a preview_link is clicked
$("#nav").on("click", ".preview_link", function(){
	popup_video($(this));
});
// remove a popup when its xout is clicked
$("#main_col").on("click", '.xout', function(){
	$(".popup").remove();
});
// dropdown extea prewview links on click of 
$("#nav").on("click", "#preview_dropdown_link", function(){
	$("#extra_previews").css("height", "auto");
	$("#preview_dropdown_link").removeClass("collapsed").addClass("expanded");
});
// collapses the dropdown for the preview links
$("#nav").on("click", ".left-col-dropdown.expanded", function(){
	$("#extra_previews").css("height", "0px");
	$("#preview_dropdown_link").removeClass("expanded").addClass("collapsed");
})

var username = get_username();
if (username) {
	var follow_nav = 		"<div class='nav_section js-nav-menu' id='nav_preview'> \
							<div class='header'>Preview</div> \
							<ul class='game_filters' id = 'channel_previews'></ul> \
							<ul class='extra-menu' id='extra_previews'></ul> \
							<div class='left-col-dropdown collapsed' id='preview_dropdown_link'></div> \
							<div class='nav-divider'></div> \
						</div>";
	$("#nav_primary").before(follow_nav);
	insert_user_follows_into_page(username);
} else {
	console.log("TwitchSwitch: Could not get username (is a user logged in?)");
}
