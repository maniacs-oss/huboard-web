import Ember from 'ember';
import template from 'app/templates/css';

var CssView = Ember.View.extend({
  tagName:"style",
  attributeBindings: ["type"],
  type: "text/css",
  template:template,
  combinedLabels: function(){

    var labels = Ember.copy(this.get('content.labels'))
      .map((l) => Ember.get(l, 'labels'))
      .reduce((l, r) => l.concat(r), []);
    var links = Ember.copy(this.get('content.repos'))
      .map((l) => Ember.get(l, 'repo.color'))
      .slice(1);
    return _.chain(labels)
      .union(links)
      .map(function(label) {
        var color = Ember.$.Color("#" + label.color);
        Ember.set(label, "contrastColor", color.contrastColor());
        Ember.set(label, 'activeColor', color.alpha(0.3).toString());
        Ember.set(label, 'dimColor', color.alpha(0.6).toString());
        return label;
      })
      .value();
  }.property('content.repos.[]')
});

export default CssView;
