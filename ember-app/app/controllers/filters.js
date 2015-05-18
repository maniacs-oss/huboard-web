import Ember from 'ember';

var FiltersController = Ember.Controller.extend({
  needs: ["application"],

  queryParamsBinding: "controllers.application.queryParams",
  repoBinding: "controllers.application.repo",
  assigneeBinding: "controllers.application.assignee",
  milestoneBinding: "controllers.application.milestone",
  labelBinding: "controllers.application.label",

  milestonesBinding: "controllers.application.model.board.filterMilestones",
  otherLabelsBinding: "controllers.application.model.board.filterLabels",
  linkLabelsBinding: "controllers.application.model.board.link_labels",

  userFilters: null,
  milestoneFilters: null,
  boardFilters: null,

  init: function(){
    if(App.get("loggedIn")){
      this.set("userFilters", [
        {
          name: "Assigned to me",
          queryParam: "assignee",
          mode: 0,
          condition: function(i){
            return i.assignee && i.assignee.login === App.get("currentUser").login;
          }
        },

        {
          name: "Assigned to others",
          queryParam: "assignee",
          mode: 0,
          condition: function(i){
            return i.assignee && i.assignee.login !== App.get("currentUser").login;
          }
        },
        {
          name: "Unassigned issues",
          queryParam: "assignee",
          mode: 0,
          condition: function(i){
            return !i.assignee;
          }
        }
      ]);
    }else{
      this.set("userFilters", [
        {
          name: "Unassigned issues",
          queryParam: "assignee",
          mode: 0,
          condition: function(i){
            return !i.assignee;
          }
        }
      ]);
    
    }
    this.set("milestoneFilters", this.get("milestones").map(function(m){
       return Ember.Object.create({
        name: m.title,
        queryParam: "milestone",
        mode:0,
        condition:function(i){
         return i.milestone && i.milestone.title.toLocaleLowerCase() === m.title.toLocaleLowerCase();
        }
       });
    }));
    this.get("milestoneFilters").insertAt(0, Ember.Object.create({
      name: 'No milestone',
      queryParam: "milestone",
      mode:0,
      condition:function(i){
        return i.milestone == null;
      }

    }));
    this.set("labelFilters", this.get("otherLabels").map(function(l){
       return Ember.Object.create({
        name: l.name,
        queryParam: "label",
        mode:0,
        color: l.color,
        condition:function(i){
          return _.union(i.labels, i.other_labels).any(function(label){ 
             return l.name.toLocaleLowerCase() === label.name.toLocaleLowerCase();
          });
        }
       });
    }));
    var parentBoardOwner = this.get("controllers.application.model.board.full_name").split("/")[0];
    this.set("boardFilters", this.get("linkLabels").map(function(l){
       var name = parentBoardOwner === l.user ? l.repo : l.user + "/" + l.repo;
       return Ember.Object.create({
        name: name,
        queryParam: "repo",
        mode:0,
        color: l.color,
        condition:function(i){
          return i.repo.name === l.repo && i.repo.owner.login === l.user;
        }
       });
    }));
    this.get("boardFilters").insertAt(0, Ember.Object.create({
      name: App.get('repo.name'),
      queryParam: "repo",
      mode:0,
      color: "7965cc",
      condition:function(i){
        return i.repo.name === App.get('repo.name');
      }
    }));
  },
  allFilters: function(){
      return this.get("milestoneFilters")
              .concat(this.get("userFilters"))
              .concat(this.get("boardFilters"))
              .concat(this.get("labelFilters"));
  }.property("milestoneFilters.@each.mode", "userFilters.@each.mode","labelFilters.@each.mode", "boardFilters.@each.mode"),
  dimFiltersChanged: function(){
    var self = this;
    Ember.run.once(function(){
      var allFilters = self.get("allFilters");

      this.set("dimFilters", allFilters.filter(function(f){
        return f.mode === 1;
      }));

      this.set("hideFilters", allFilters.filter(function(f){
        var formattedParam = f.name.replace(/\s+/g, '');
        var isQueryParamFiltered = self.get(f.queryParam).contains(formattedParam);
        return f.mode === 2 || isQueryParamFiltered;
      }));
    }.bind(this));

  }.observes("allFilters").on("init"),
  dimFiltersBinding: "App.dimFilters",
  hideFiltersBinding: "App.hideFilters",
  filtersActive: function(){
    var allFilters = this.get("allFilters");
    var active =  _.any(allFilters, function(f){
      return f.mode > 0;
    });
    return active;
  }.property("allFilters"),
  forceDimsToActive: function(){
    var dim_filters = this.get("dimFilters");
    if (!dim_filters){ return; }

    var member_filter = App.get("memberFilter");
    var search_filter = App.get("searchFilter");
    var hide_filters = this.get("hideFilters");

    if (hide_filters.length || member_filter || search_filter) {
      dim_filters.forEach(function(f){
        Ember.set(f, "mode", 2);
      });
    }
  }.observes("hideFilters", "App.searchFilter", "App.memberFilter"),
  membersActive: false,
  actions: {
    clearFilters: function(){
      var self = this;
      Ember.run.once(function(){
        var params = ["repo", "assignee", "milestone", "label"];
        _.each(params, function(p){ self.get(p).clear(); });
        self.get("allFilters").forEach(function(f){
          Ember.set(f,"mode",0);
        });
      });
    }
  }
});

export default FiltersController;
