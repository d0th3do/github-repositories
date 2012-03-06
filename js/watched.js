(function() {
	
	// Keep in global namespace for background page.
	window.Watched = {
	
		init: function(){
			this.name = "watched";
			window[this.name] = this;
		},
		
		bind: {},
		
		display: {
			
			/**
			 * Append
			 * 
			 * @param repos Watched repositories to append to display.
			 */
			append: function(contextId, repos) {
				console.log(repos);
			},
			
			/**
			 * List
			 * 
			 * @param contextId Context ID requesting display.
			 * @param repos Watched repositories to be displayed.
			 */
			list: function(contextId, repos) {
				App.content.post(contextId, App.watched.name, function() {
					App.content.display(App.watched.html.list(repos));
				});
			}
		},
		
		filter: {
			
			/**
			 * Remove Users Repos
			 * 
			 * @param repos Set of repos to remove own repos from.
			 * @param login Users login.
			 * @return The set of repos not containing owned repos.
			 */
			removeUserRepos: function(repos, login) {
				if(repos.length == 0) {
					return repos;
				}
				for(var i = (repos.length - 1); i >= 0; i--) {
					if(repos[i].owner.login == login) {
						repos.splice(i, 1);
					}
				}
				return repos;
			}
		},
		
		html: {
			
			/**
			 * Item
			 * 
			 * @param repo Item to generate HTML for.
			 * @return Watched repo list item HTML.
			 */
			item: function(repo) {
				return "<li class='" + (repo['private'] ? "private" : "public") + "'>"
				     + "<a href='" + repo.html_url + "' target='_blank'>"
					 + "<span class='user'>" + repo.owner.login + "</span>"
					 + "/"
					 + "<span class='repo'>" + repo.name + "</span>"
					 + "</a>"
					 + "</li>";
			},
			
			/**
			 * List
			 * 
			 * @param repos Watched repos to create HTML list for.
			 * @return Watched repo list in HTML.
			 */
			list: function(repos) {		
				var html = "<ul class='watched_list'>";
				for(var i in repos) {
					html += App.watched.html.item(repos[i]);
				}
				html += "</ul>";
				return html;
			}
		},
		
		load: {
			
			/**
			 * Cache
			 * 
			 * @param context Context requesting load.
			 */
			cache: function(context) {
				var cache = Cache.load(context.id, App.watched.name);
				
				if(cache != null) {
					App.watched.display.list(context.id, cache.data);
				}
				
				if(!cache || cache.expired) {
					App.watched.load.refresh(context);
				}
			},
			
			/**
			 * Github
			 * 
			 * @param context Context requesting repositories.
			 * @param token Users OAuth2 token.
			 */
			github: function(context, token) {
				(function getWatchedRepos(buffer, page) {
					jQuery.getJSON("https://api.github.com/user/watched", {access_token: token, page: page})
						.success(function(json) {
							if(json.length > 0) {
								json = Watched.filter.removeUserRepos(json, context.login);
								Socket.postMessage(Watched.name, "display", "append", [context.id, json]);
								getWatchedRepos(buffer.concat(json), ++page);
							}
							else {
								Cache.save(context.id, Watched.name, buffer);
								Socket.postComplete();
							}
						});
				})([], 1);				
			},
			
			/**
			 * Refresh
			 *
			 * @param context Context requesting refresh.
			 */
			refresh: function(context) {
				Socket.postMessage(App.watched.name, "load", "github", [context, OAuth2.getToken()]);
			}
		}
	};
	
	Watched.init();
})();