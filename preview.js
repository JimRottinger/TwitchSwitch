//2bcc326d72f54fd0b340e4ed52eab249

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
	return "<object type='application/x-shockwave-flash' height='378' width='620' id='live_embed_player_flash' data='http://www.twitch.tv/widgets/live_embed_player.swf?channel="+channel+"' bgcolor='#000000'><param name='allowFullScreen' value='true' /><param name='allowScriptAccess' value='always' /><param name='allowNetworking' value='all' /><param name='movie' value='http://www.twitch.tv/widgets/live_embed_player.swf' /><param name='flashvars' value='hostname=www.twitch.tv&channel="+channel+"&auto_play=true&start_volume=25' /></object>";
	//return "<iframe id='player' type='text/html' width='620' height='378' \
  	//		src='http://www.twitch.tv/"+channel+"/hls' \
  	//		frameborder='0'></iframe>"
};

var popup_video = function(loc){
	$(".popup").remove();
	$.embedly.extract('http://embed.ly', {key: '2bcc326d72f54fd0b340e4ed52eab249'}).progress(function(data){
  		alert(data.title);
	});
	var offset = loc.offset().top;
	var channel = loc.data("channel_name");
	var box = 	"<div class='popup' style='position: absolute;padding: 20px 20px;border: 2px solid #333;background: #fff;left: 20px;top:"+offset+"px; z-index: 5;overflow: visible;'> \
					<h3> "+loc.data("channel_name")+"</h3 \
					" + generate_embed(channel) + " \
				</div>";
	$("#main_col").append(box);
};

$(document).ready(function(){
	$("#nav").on("click", ".preview_li", function(){
		popup_video($(this));
	});
	if ($("#nav_personal").length > 0){
		var follow_nav = 		"<script src='http://cdn.embed.ly/jquery.embedly-3.1.1.min.js' type='text/javascript'></script> \
								<div class='nav_section js-nav-menu' id='nav_preview'> \
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