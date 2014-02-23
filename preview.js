var get_follows = function(username) {
	var url = "http://api.twitch.tv/kraken/users/"+username+"/follows/channels";
	console.log(url);
	$.getJSON( url, {
		offset: 0,
		on_site: 1
	})
	.done(function( data ) {
	  $.each( data.follows, function( i, follow ) {
	  	var list_el = 	"<li class='preview_li'style='height=35px; position: relative;'> \
	  						<a class='clearfix preview_link' href='#' data-channel_name="+follow.channel.display_name+" style='line-height:22px;'> \
	  							<span class='logo' style='display: inline-block;'><img src=" + follow.channel.logo + " height='20' width='20' style='margin-top: -8px; margin-left: 25px;'></img></span> \
	  							<span class='title' style='display: inline-block; margin-left: 10px; margin-top: 5px'>" + follow.channel.display_name + "</span> \
	  						</a> \
	  					</li>";
	  	$(list_el).appendTo($("#channel_previews"));
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

	//&auto_play=true&start_volume=25
	$.embedly.oembed(url, {query: {maxwidth: maxwidth, auto_play: true, start_volume:0}})
		.progress(function(obj){
			console.log(obj);
			$(".popup div").html(obj.html);			
		});

	return false;
};

$(document).ready(function(){
	$("#nav").on("click", ".preview_link", function(){
		popup_video($(this));
	});
	$("#main_col").on("click", '.xout', function(){
		$(".popup").remove();
	});
	if ($("#nav_personal").length > 0){
		var follow_nav = 		"<div class='nav_section js-nav-menu' id='nav_preview'> \
								<div class='header'>Preview</div> \
								<ul class='game_filters' id = 'channel_previews'></ul> \
								<div class='nav-divider'></div> \
							</div>";
		$("#nav_primary").before(follow_nav);
		var username = get_username();
		get_follows(username);
	}
	else{
		alert("Please log in to use twitch preview");
	}
});