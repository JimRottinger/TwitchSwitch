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

(function(){
/** Draws the link into the sidebar for every followed user */
function draw_preview_link(channel){
    // create the list element
    var li = document.createElement("li");
    li.id = "preview_" + channel.name;
    // create the link to catch any preview clicks
    var a = document.createElement("a");
    a.id = "preview_link_" + channel.name;
    a.className = "game";
    a.href = "#";
    a.setAttribute("data-channel_name", channel.name);
    a.setAttribute("data-channel_dname", channel.display_name);
    a.addEventListener("click", function(event) {
        var popup = document.getElementById("popup");
        if (popup && popup.getAttribute("channel_name") === channel.name)
            document.getElementById("main_col").removeChild(popup);
        else
	    popup_video($("#preview_link_" + channel.name));
    });
    // add the image
    var img = document.createElement("img");
    img.className = "image";
    img.src = channel.logo ? channel.logo : "http://static-cdn.jtvnw.net/jtv_user_pictures/xarth/404_user_150x150.png";
    // add the name of the stream
    var span = document.createElement("span");
    span.className = "title";
    span.appendChild(document.createTextNode(channel.display_name));
    // join everything together
    a.appendChild(img);
    a.appendChild(span);
    li.appendChild(a);
    return li;
}

/** Obtains a list of channels followed by a user */
function get_follows(username, callback) {
    var channels = [];
    function handler(data) {
        if (!data || !data.follows || data.follows.length == 0) {
            callback(channels);
            return;
        }
        for (var i = 0; i < data.follows.length; i++)
            channels.push(data.follows[i].channel);
        JSON.load(data._links.next, handler);
    }
    var url = "https://api.twitch.tv/kraken/users/"+username+"/follows/channels?limit=75&offset=0&on_site=1";
    JSON.load(url, handler);
}

/** Filter out only the channels that are online */
function filter_follows_online(channels, callback) {
    var filtered = {};
    for (i = 0; i < channels.length; i++)
        filtered[channels[i].name] = true;
    var okay = [];
    function handler(data) {
        if (!data || !data.streams || data.streams.length == 0) {
            callback(okay);
            return;
        }
        var i;
        for (i = 0; i < data.streams.length; i++)
            filtered[data.streams[i].channel.name] = false;
        for (i = 0; i < channels.length; i++)
            if (!filtered[channels[i].name])
                okay.push(channels[i]);
        JSON.load(data._links.next, handler);
    }
    var url = "https://api.twitch.tv/kraken/streams?limit=75&channel=";
    for (var i = 0; i < channels.length; i++)
        url += channels[i].name + ",";
    JSON.load(url, handler);
}

/** Updates the 'channel_previews' nav item with the listed channels */
function insert_follows_into_page(channels) {
    var i;
    var list = document.getElementById("channel_previews");
    var blist = document.getElementById("extra_previews");
    while (blist.firstChild) blist.removeChild(list.firstChild);
    while (list.firstChild) list.removeChild(list.firstChild);
    document.getElementById("preview_dropdown_link").style.display='none';
    if (channels.length == 0){
        var li = document.createElement("li");
        li.style.textAlign = "center";
        li.appendChild(document.createTextNode("No followed streams are online"));
        document.getElementById("channel_previews").appendChild(li);
    }
    else if (channels.length > 5){
	for (i=0; i < 5; i++)
            document.getElementById("channel_previews").appendChild(draw_preview_link(channels[i]));
	for (; i < channels.length; i++)
            document.getElementById("extra_previews").appendChild(draw_preview_link(channels[i]));
    document.getElementById("preview_dropdown_link").style.display='';
    }
    else{
	for (i=0; i < channels.length; i++)
            document.getElementById("channel_previews").appendChild(draw_preview_link(channels[i]));
    }
}

/** Scrapes the username out of the webpage and returns it */
function get_username() {
    var elements = document.getElementById("you").getElementsByClassName("username");
    if (elements.length == 0)
        return undefined;
    return elements[0].textContent;
}

var generate_embed_object_for_stream = function(channel_name){
    return '<object type="application/x-shockwave-flash" \
    height="213" \
    width="350" \
    id="live_embed_player_flash" \
    data="http://www.twitch.tv/widgets/live_embed_player.swf?channel='+channel_name+'" \
    bgcolor="#000000">\
        <param  name="allowFullScreen"   value="false" />\
        <param  name="allowScriptAccess" value="always" />\
        <param  name="allowNetworking"   value="all" />\
        <param  name="movie"             value="http://www.twitch.tv/widgets/live_embed_player.swf" />\
        <param  name="flashvars"         value="hostname=www.twitch.tv&channel='+channel_name+'&auto_play=true&start_volume=0" />\
    </object>';
};

/** Pops up the video next to the preview link that was clicked */
var popup_video = function(preview_clicked){
    if (document.getElementById("popup"))
        document.getElementById("main_col").removeChild(document.getElementById("popup"));
    var offset = preview_clicked.offset().top;
    if (offset+256 > window.innerHeight)
	offset = window.innerHeight - 256;
    if (offset < 0)
	offset = 0;
    var channel_name = preview_clicked.data('channel_name');
    var channel_dname = preview_clicked.data('channel_dname');
    var url = "http://twitch.tv/"+channel_name;
    // create a popup element to display the channel preview
    var popup = document.createElement("div");
    popup.id = "popup";
    popup.className = "popup";
    popup.style.cssText = "position:absolute;padding:12px;border:2px solid #333;background:#fff;left:0px;top:"+offset+"px;z-index:5;";
    popup.setAttribute("channel_name", channel_name);
    // create an 'x' button to close the popup
    var span = document.createElement("span");
    span.style.cssText = "position:absolute;top:1ex;right:1ex;font-weight:bold;cursor:pointer;";
    span.appendChild(document.createTextNode("X"));
    span.addEventListener("click", function(event) {
        document.getElementById("main_col").removeChild(document.getElementById("popup"));
    });
    // create the header, displaying the channel name and a link to it
    var h3 = document.createElement("h3");
    var a = document.createElement("a");
    a.href = url;
    a.appendChild(document.createTextNode(channel_dname));
    h3.appendChild(a);
    h3.appendChild(document.createTextNode(" (Preview)"));
    // create the player object
    var player = document.createElement("div");
    player.id = player;
    player.innerHTML = generate_embed_object_for_stream(channel_name);
    // place the popup on screen
    popup.appendChild(span);
    popup.appendChild(h3);
    popup.appendChild(player);
    document.getElementById("main_col").appendChild(popup);
};

function expand_or_collapse_extra_follows(){
    var extra_menu = document.getElementById("extra_previews");
    var dropdown_button = document.getElementById("preview_dropdown_link");
    if (extra_menu.style.height == 'auto'){
        extra_menu.style.height = '0';
        dropdown_button.className = 'left-col-dropdown collapsed';
    }
    else{
       extra_menu.style.height = 'auto'; 
       dropdown_button.className += "left-col-dropdown expanded";
    }
}

// // dropdown extea prewview links on click of 
// $("#nav").on("click", "#preview_dropdown_link", function(){
// 	$("#extra_previews").css("height", "auto");
// 	$("#preview_dropdown_link").removeClass("collapsed").addClass("expanded");
// });
// // collapses the dropdown for the preview links
// $("#nav").on("click", ".left-col-dropdown.expanded", function(){
// 	$("#extra_previews").css("height", "0px");
// 	$("#preview_dropdown_link").removeClass("expanded").addClass("collapsed");
// });

var username = get_username();
var limit = 100;
if (username) {
    /* Building the following html
	<div class='nav_section js-nav-menu' id='nav_preview'> 
		<div class='header'>Preview</div> 
		<ul class='game_filters' id = 'channel_previews'></ul> 
		<ul class='extra-menu' id='extra_previews'></ul> 
		<div class='left-col-dropdown collapsed' id='preview_dropdown_link' style='display:none;'></div> 
		<div class='nav-divider'></div> 
	</div>*/
    var follow_nav = document.createElement("DIV");
    follow_nav.id = "nav_preview";
    follow_nav.className = "nav_section js-nav-menu";
    var header = document.createElement("DIV");
    header.className = 'header';
    header.appendChild(document.createTextNode('Preview'));
    follow_nav.appendChild(header);
    var follow_list = document.createElement("UL");
    follow_list.id='channel_previews';
    follow_list.className='game_filters';
    follow_list.style.cssText = 'max-height: 240px;';
    follow_nav.appendChild(follow_list)
    var hidden_follow_list = document.createElement("UL");
    hidden_follow_list.id = "extra_previews";
    hidden_follow_list.style.cssText="min-height:0;height:0;overflow:hidden";
    //hidden_follow_list.className = 'extra-menu';
    follow_nav.appendChild(hidden_follow_list);
    var dropdown = document.createElement("DIV");
    dropdown.id="preview_dropdown_link";
    dropdown.className='left-col-dropdown collapsed';
    dropdown.style.display = 'none';
    dropdown.addEventListener('click', expand_or_collapse_extra_follows, false);
    var divider = document.createElement("DIV");
    divider.className='nav-divider';
    follow_nav.appendChild(dropdown);
    follow_nav.appendChild(divider);

    var parent_nav = document.getElementsByClassName("tse-content")[0];
    parent_nav.insertBefore(follow_nav, parent_nav.getElementsByClassName("nav_primary")[0]);
	$("#nav_primary").before(follow_nav);
    (function update() {
        get_follows(username, function(follows) {
            if (follows.length > limit)
            	follows = follows.slice(0, limit);
            filter_follows_online(follows, function(filtered) {
                insert_follows_into_page(filtered);
            });
        });
        // re-update every _ milliseconds
        window.setTimeout(update, 30000);
    })();
} else {
	console.log("TwitchSwitch: Could not get username (is a user logged in?)");
}
})();
