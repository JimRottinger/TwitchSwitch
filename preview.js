var get_follows = function(username) {
	var url = "http://api.twitch.tv/kraken/users/"+username+"/follows/channels";
	console.log(url);
	$.getJSON( url, {
		offset: 0,
		on_site: 1
	})
	.done(function( data ) {
		console.log(data)
	  $.each( data.follows, function( i, follow ) {
	  	var list_el = 	"<li class='preview_li' data-channel_name="+follow.channel.display_name+" style='height=35px; position: relative;'> \
	  						<a class='clearfix' href='#' style='line-height:22px;'> \
	  							<span class='logo' style='display: inline-block;'><img src=" + follow.channel.logo + " height='25' width='25' style='margin-top: -8px; margin-left: 25px;'></img></span> \
	  							<span class='title' style='display: inline-block; margin-left: 10px; margin-top: 5px'>" + follow.channel.display_name + "</span> \
	  						</a> \
	  					</li>";
	  	$(list_el).appendTo($("#channel_previews"));
	    console.log(follow.channel.display_name);
	  });
	});
};

var get_username = function(){
	return $("#you .username").text();
};

var generate_embed = function(channel){
	return "<object type='application/x-shockwave-flash' height='378' width='620' id='live_embed_player_flash' data='http://www.twitch.tv/widgets/live_embed_player.swf?channel="+channel+"' bgcolor='#000000'><param name='allowFullScreen' value='true' /><param name='allowScriptAccess' value='always' /><param name='allowNetworking' value='all' /><param name='movie' value='http://www.twitch.tv/widgets/live_embed_player.swf' /><param name='flashvars' value='hostname=www.twitch.tv&channel="+channel+"&auto_play=true&start_volume=25' /></object><a href='http://www.twitch.tv/"+channel+"' style='padding:2px 0px 4px; display:block; width:345px; font-weight:normal; font-size:10px;text-decoration:underline; text-align:center;''>Watch live video from "+ channel + " on www.twitch.tv</a>";
};

var popup_video = function(loc){
	$(".popup").remove();
	console.log(loc.data("channel_name"));
	var box = 	"<div class='popup' style='position: absolute;border: 2px solid #333;background: #fff;right: -50px;top:0; z-index: 5;overflow: visible;'> \
					<h3> hello world </h3 \
				</div>";
	loc.append(box);
};

$(document).ready(function(){
	$("#nav").on("click", ".preview_li", function(){
		popup_video($(this));
	});
	if ($("#nav_personal").length > 0){
		var follow_nav = 	"<div class='nav_section js-nav-menu' id='nav_preview'> \
								<div class='header'>Preview</div> \
								<ul class='game_filters' id = 'channel_previews'></ul> \
								<div class='nav-divider'></div> \
							</div>";
		$("#nav_primary").before(follow_nav);
		var username = get_username();
		console.log(username);
		get_follows(username);
		console.log(generate_embed());
	}
	else{
		alert("Please log in to use twitch preview");
	}
});