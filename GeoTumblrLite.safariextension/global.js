// ------ MESSAGE SCRIPTS ------ //

function handleMessage(event) {
	if (event.name === "requestSettings") {
		if (!supportsLocalStorage()) {
			event.target.page.dispatchMessage("error", "HTML5 Local Storage not supported.");
		} else {
			gatherSettings();
			if (typeof safari !== 'undefined') {
				event.target.page.dispatchMessage("returnSettings", geo_vars);
			} else if (typeof chrome !== 'undefined') {
				chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
					chrome.tabs.sendMessage(tabs[0].id, {name: "returnSettings", message: geo_vars}, function(response) {
						// console.log(response.farewell);
					});
				});
			}
		}
	}
	if (event.name === "setCookie") {
		$('body').data(event.message);
	}
	if (event.name === "saveBookmarks") {
		saveBookmarks(event.message);
	}
}

if (typeof safari !== 'undefined') {
	console.log("Safari addEventListener");
	safari.application.addEventListener("message", handleMessage, false);
} else if (typeof chrome !== 'undefined') {
	console.log("Chrome addListener");
	chrome.runtime.onMessage.addListener(function(request) {
		console.log("request n="+request.name+" m="+request.message);
		handleMessage(request);
	});
}

function supportsLocalStorage() {
	try {
		return 'localStorage' in window && window['localStorage'] !== null;
	} catch (e) {
		return false;
	}
}

function saveBookmarks(bookmarks) {
	geo_vars.bookmarks = bookmarks;
	for (var i = 0; i < 10; i++) {
		localStorage.removeItem("bookmark"+i, bookmarks[i]);
	};
	for (var i = 0; i < bookmarks.length; i++) {
		if (i<10) localStorage.setItem("bookmark"+i, bookmarks[i]);
	};
}

function updateSettings(e) {
	if (!e) { e = window.event; }
	gatherSettings();
	if (typeof safari !== 'undefined') {
		console.log("Safari dispatchMessage updateSettings");
		safari.application.activeBrowserWindow.activeTab.page.dispatchMessage("updateSettings", geo_vars);
	} else if (typeof chrome !== 'undefined') {
		console.log("Chrome sendMessage updateSettings");
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {name: "updateSettings", message: geo_vars});
		});
	}
}

if (window.addEventListener) {
	window.addEventListener("storage", updateSettings, false);
} else {
	window.attachEvent("onstorage", updateSettings);
}

function parseVal(val) {
	if (val === "true") return true;
	if (val === "false") return false;
	if (val === "" || val === undefined) return null;
	return val;
}

var geo_vars = new Array();

function gatherSettings() {
	// gather blogs data into array
	var total = parseInt(localStorage.getItem("blogsTotal"));
	console.log("gatherSettings blogsTotal = "+total);
	if (total > 0) {
		var blogs = new Array();
		for (var i = 0; i < total; i++) {
			blogs[i] = {
				"userName" : localStorage.getItem("blog"+i+".userName")
			};
		}
	}
	var bookmarks = new Array();
	for (var i = 0; i < 10; i++) {
		var mark = localStorage.getItem("bookmark"+i);
		if (mark) bookmarks.push(mark);
	}
	geo_vars = {
		"reblogPostAs" : localStorage.getItem("reblogPostAs"),
		"reblogSchedule" : localStorage.getItem("reblogSchedule"),
		"reblogAutoSubmit" : parseVal(localStorage.getItem("reblogAutoSubmit")),
		"reblogAutoLike" : parseVal(localStorage.getItem("reblogAutoLike")),

		"viewFocusGlow" : parseVal(localStorage.getItem("viewFocusGlow")),
		"viewBookmarkColor" : localStorage.getItem("viewBookmarkColor"),
		"viewHideMine" : parseVal(localStorage.getItem("viewHideMine")),
		"viewMarkMine" : parseVal(localStorage.getItem("viewMarkMine")),
		"viewMarkMineColor" : localStorage.getItem("viewMarkMineColor"),
		"viewHideReblog" : parseVal(localStorage.getItem("viewHideReblog")),
		"viewMarkReblog" : parseVal(localStorage.getItem("viewMarkReblog")),
		"viewMarkReblogColor" : localStorage.getItem("viewMarkReblogColor"),
		"viewHideLiked" : parseVal(localStorage.getItem("viewHideLiked")),
		"viewMarkLiked" : parseVal(localStorage.getItem("viewMarkLiked")),
		"viewMarkLikedColor" : localStorage.getItem("viewMarkLikedColor"),
		"viewHideFollowing" : parseVal(localStorage.getItem("viewHideFollowing")),
		"viewHideFollowingSelf" : parseVal(localStorage.getItem("viewHideFollowingSelf")),
		"viewSidebarMin" : parseVal(localStorage.getItem("viewSidebarMin")),
		"viewSidebarFix" : parseVal(localStorage.getItem("viewSidebarFix")),
		"viewHideRecommended" : parseVal(localStorage.getItem("viewHideRecommended")),
		"viewHideSponsored" : parseVal(localStorage.getItem("viewHideSponsored")),

		"bookmarks" : bookmarks,
		"blogs" : blogs,
		"cookies" : $('body').data()
	};
}
