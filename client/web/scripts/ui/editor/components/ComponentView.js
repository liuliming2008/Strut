// Generated by CoffeeScript 1.2.1-pre
/*
@author Matt Crinklaw-Vogt
*/

define(["vendor/backbone", "ui/widgets/DeltaDragControl", "../Templates", "css!../res/css/ComponentView.css"], function(Backbone, DeltaDragControl, Templates, empty) {
  return Backbone.View.extend({
    transforms: ["skewX", "skewY", "rotate", "scale"],
    className: "component",
    events: function() {
      return {
        "mousedown": "mousedown",
        "click": "clicked",
        "click .removeBtn": "removeClicked",
        "deltadrag span[data-delta='skewX']": "skewX",
        "deltadrag span[data-delta='skewY']": "skewY",
        "deltadrag span[data-delta='rotate']": "rotate",
        "deltadrag span[data-delta='scale']": "scale",
        "deltadragStart span[data-delta='skewX']": "skewXStart",
        "deltadragStart span[data-delta='skewY']": "skewYStart",
        "deltadragStart span[data-delta='rotate']": "rotateStart",
        "deltadragStart span[data-delta='scale']": "scaleStart"
      };
    },
    initialize: function() {
      this._dragging = false;
      this.allowDragging = true;
      this.model.on("change:selected", this._selectionChanged, this);
      this.model.on("change:color", this._colorChanged, this);
      this.model.on("unrender", this._unrender, this);
      this._mouseup = this.stopdrag.bind(this);
      this._mousemove = this.mousemove.bind(this);
      $(document).bind("mouseup", this._mouseup);
      $(document).bind("mousemove", this._mousemove);
      return this._deltaDrags = [];
    },
    _selectionChanged: function(model, selected) {
      if (selected) {
        return this.$el.addClass("selected");
      } else {
        return this.$el.removeClass("selected");
      }
    },
    _colorChanged: function(model, color) {
      return this.$el.css("color", "#" + color);
    },
    clicked: function(e) {
      return e.stopPropagation();
    },
    removeClicked: function(e) {
      e.stopPropagation();
      return this.remove();
    },
    skewX: function(e, deltas) {
      this.model.set("skewX", this._initialSkewX + Math.atan2(deltas.dx, 22));
      return this._setUpdatedTransform();
    },
    skewXStart: function() {
      return this._initialSkewX = this.model.get("skewX") || 0;
    },
    skewY: function(e, deltas) {
      this.model.set("skewY", this._initialSkewY + Math.atan2(deltas.dy, 22));
      return this._setUpdatedTransform();
    },
    skewYStart: function() {
      return this._initialSkewY = this.model.get("skewY") || 0;
    },
    rotate: function(e, deltas) {
      var rot;
      rot = Math.atan2(deltas.y - this._origin.y, deltas.x - this._origin.x);
      this.model.set("rotate", this._initialRotate + rot - this._rotOffset);
      return this._setUpdatedTransform();
    },
    rotateStart: function(e, deltas) {
      this.updateOrigin();
      this._rotOffset = this._calcRot(deltas);
      return this._initialRotate = this.model.get("rotate") || 0;
    },
    updateOrigin: function() {
      return this._origin = {
        x: this.$el.width() / 2 + this.model.get("x"),
        y: this.$el.height() / 2 + this.model.get("y")
      };
    },
    _calcRot: function(point) {
      return Math.atan2(point.y - this._origin.y, point.x - this._origin.x);
    },
    scale: function(e, deltas) {
      var contentHeight, contentWidth, newHeight, newWidth, scale;
      contentWidth = this.$content.width();
      contentHeight = this.$content.height();
      newWidth = contentWidth + deltas.dx;
      newHeight = contentHeight + deltas.dy;
      scale = (newWidth * newHeight) / (contentWidth * contentHeight);
      this.model.set("scale", scale * this._initialScale);
      return this._setUpdatedTransform();
    },
    scaleStart: function() {
      return this._initialScale = this.model.get("scale") || 1;
    },
    _setUpdatedTransform: function() {
      var obj, transformStr;
      transformStr = this.buildTransformString();
      obj = {
        transform: transformStr
      };
      obj[window.browserPrefix + "transform"] = transformStr;
      return this.$content.css(obj);
    },
    buildTransformString: function() {
      var transformStr,
        _this = this;
      transformStr = "";
      this.transforms.forEach(function(transformName) {
        var transformValue;
        transformValue = _this.model.get(transformName);
        if (transformValue) {
          if (transformName === "scale") {
            return transformStr += transformName + "(" + transformValue + ") ";
          } else {
            return transformStr += transformName + "(" + transformValue + "rad) ";
          }
        }
      });
      return transformStr;
    },
    mousedown: function(e) {
      console.log("Setting self to selected");
      this.model.set("selected", true);
      this._dragging = true;
      return this._prevPos = {
        x: e.pageX,
        y: e.pageY
      };
    },
    render: function() {
      var _this = this;
      this.$el.html(this.__getTemplate()(this.model.attributes));
      this.$el.find("span[data-delta]").each(function(idx, elem) {
        var deltaDrag;
        deltaDrag = new DeltaDragControl($(elem), true);
        return _this._deltaDrags.push(deltaDrag);
      });
      this.$content = this.$el.find(".content");
      this._setUpdatedTransform();
      return this.$el;
    },
    __getTemplate: function() {
      return Templates.Component;
    },
    _unrender: function() {
      console.log("Unrendering");
      return this.remove(true);
    },
    remove: function(keepModel) {
      var $doc, deltaDrag, idx, _ref;
      Backbone.View.prototype.remove.call(this);
      _ref = this._deltaDrags;
      for (idx in _ref) {
        deltaDrag = _ref[idx];
        deltaDrag.dispose();
      }
      if (!keepModel) {
        this.model.dispose();
      } else {
        this.model.off(null, null, this);
      }
      $doc = $(document);
      $doc.unbind("mouseup", this._mouseup);
      return $doc.unbind("mousemove", this._mousemove);
    },
    mousemove: function(e) {
      var dx, dy, newX, newY, x, y;
      if (this._dragging && this.allowDragging) {
        x = this.model.get("x");
        y = this.model.get("y");
        dx = e.pageX - this._prevPos.x;
        dy = e.pageY - this._prevPos.y;
        newX = x + dx;
        newY = y + dy;
        this.model.set("x", newX);
        this.model.set("y", newY);
        this.$el.css({
          left: newX,
          top: newY
        });
        this._prevPos.x = e.pageX;
        return this._prevPos.y = e.pageY;
      }
    },
    stopdrag: function() {
      this._dragging = false;
      return true;
    },
    constructor: function ComponentView() {
			Backbone.View.prototype.constructor.apply(this, arguments);
		}
  });
});
