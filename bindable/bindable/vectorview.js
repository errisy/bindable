"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var easel_1 = require('../easel/easel');
/**
 * This class is display object, which should used in the canvas;
 */
var GeneVectorView = (function (_super) {
    __extends(GeneVectorView, _super);
    function GeneVectorView() {
        _super.call(this);
        /** baseLength pixels per Kbp*/
        this.baseWidth = 200;
        this.baseHeight = 24;
        this.partailStart = 0;
        this.partialEnd = 10000;
        this.annotationGroups = [];
    }
    /**
     * Draw the given genefile;
     */
    GeneVectorView.prototype.present = function () {
        var _this = this;
        if (!this.geneFile) {
            //clear children;
            this.removeAllChildren();
            this.annotationGroups = [];
            return;
        }
        this.isPartial = this.geneFile.Length > 50000;
        //if partial, we typically only draw 10Kbp in the view;
        this.drawMode = this.isPartial ? 'partial' : (this.geneFile.IsCircular ? 'circular' : 'linear');
        var halfWidth = this.baseWidth / 2;
        var halfHeight = this.baseHeight / 2;
        switch (this.drawMode) {
            case 'partial':
                {
                }
                break;
            case 'linear':
                {
                    var stack = new LinearLayingStack(this.geneFile.Length);
                    //draw the rect at the baseLength;
                    var main = ShapeUtil.LinearBase(this.baseWidth, this.baseHeight, 'black', 'grey', this.geneFile.Name, '16pt Arial', 'black');
                    this.addChild(main);
                    this.annotationGroups.push(main);
                    //draw the majoy label
                    //draw annotations
                    for (var i = 0; i < this.geneFile.Annotations.length; i++) {
                        var ga = this.geneFile.Annotations[i];
                        var anno = ShapeUtil.LinearAnnotation(this.baseWidth, this.baseHeight, ga.Start, ga.End, 'black', 'green', stack, ga.Label, '10pt Arial', 'black');
                        this.addChild(anno);
                        this.annotationGroups.push(anno);
                    }
                    //draw labels
                    var labelStack_1 = new LinearLayingStack(this.baseWidth);
                    var baseLabelHeight_1 = -(stack.layers.length + 2) * this.baseHeight;
                    var halfWidth_1 = this.baseWidth * 0.5;
                    var boundary_1 = new Boundary(-halfWidth_1, halfWidth_1, -(stack.layers.length + 0.5) * this.baseHeight, this.baseHeight * 0.5);
                    this.annotationGroups.forEach(function (anno) {
                        if (anno.isBase) {
                            anno.applyLinearLabel(_this.baseHeight);
                            boundary_1.include(anno);
                        }
                        else {
                            var index = labelStack_1.place(anno.linearLabelFill);
                            anno.applyLinearLabel(baseLabelHeight_1 - index * _this.baseHeight);
                            boundary_1.include(anno);
                        }
                    });
                    //draw enzymes
                    boundary_1.extend(3);
                    this.boundary = boundary_1;
                    //calculate size
                    this.background = ShapeUtil.Background(boundary_1, 'black', 'white');
                    this.addChildAt(this.background, 0);
                }
                break;
            case 'circular':
                {
                    var stack = new CircularLayingStack(this.geneFile.Length);
                    var main = ShapeUtil.CircularBase(this.baseHeight, this.baseWidth / 2, 'black', 'red', this.geneFile.Name, '16pt Arial', 'black');
                    this.addChild(main);
                    this.annotationGroups.push(main);
                    //draw annotations
                    for (var i = 0; i < this.geneFile.Annotations.length; i++) {
                        var ga = this.geneFile.Annotations[i];
                        var anno = ShapeUtil.CircularAnnotation(this.baseHeight, this.baseWidth / 2, ga.Start, ga.End, !ga.Complement, 'black', 'green', stack, ga.Label, '10pt Arial', 'black');
                        this.addChild(anno);
                        this.annotationGroups.push(anno);
                    }
                    //draw labels and calculate boundary
                    var labelStack_2 = new CircularLabelStack(this.baseWidth / 2 + (stack.layers.length + 2) * this.baseHeight);
                    var leftFills_1 = [];
                    var rightFills_1 = [];
                    this.annotationGroups.forEach(function (anno) {
                        if (!anno.isBase) {
                            if (anno.circularLabelFill.centerAngle >= Math.PI * 0.5 && anno.circularLabelFill.centerAngle < Math.PI * 1.5) {
                                leftFills_1.push(anno.circularLabelFill);
                                anno.circularLabelFill.sorter = Math.abs(anno.circularLabelFill.centerAngle - Math.PI);
                            }
                            else {
                                rightFills_1.push(anno.circularLabelFill);
                                anno.circularLabelFill.sorter = (anno.circularLabelFill.centerAngle > Math.PI) ? Math.PI * 2 - anno.circularLabelFill.centerAngle - Math.PI : anno.circularLabelFill.centerAngle;
                            }
                        }
                    });
                    leftFills_1.sort(function (a, b) { return Math.sign(b.sorter - a.sorter); });
                    rightFills_1.sort(function (a, b) { return Math.sign(b.sorter - a.sorter); });
                    leftFills_1.forEach(function (fill) { return labelStack_2.place(fill); });
                    rightFills_1.forEach(function (fill) { return labelStack_2.place(fill); });
                    var innerRadius = this.baseWidth / 2 + stack.layers.length * this.baseHeight;
                    var boundary_2 = new Boundary(-innerRadius, innerRadius, -innerRadius, innerRadius);
                    this.annotationGroups.forEach(function (anno) {
                        anno.applyCircularLabel();
                        boundary_2.include(anno);
                    });
                    boundary_2.extend(3);
                    this.boundary = boundary_2;
                    //calculate size
                    this.background = ShapeUtil.Background(boundary_2, 'black', 'white');
                    this.addChildAt(this.background, 0);
                    //move myself to some position
                    this.x = -boundary_2.left;
                    this.y = -boundary_2.top;
                }
                break;
        }
    };
    return GeneVectorView;
}(easel_1.createjs.Container));
exports.GeneVectorView = GeneVectorView;
var PI2 = Math.PI * 2;
var LinearLayingStack = (function () {
    function LinearLayingStack(size) {
        this.size = size;
        this.layers = [];
    }
    LinearLayingStack.prototype.place = function (fill) {
        if (this.layers.length == 0)
            this.layers.push(new LinearLayer());
        for (var i = 0; i < this.layers.length; i++) {
            //try get one layer
            var layer = this.layers[i];
            //check is the layer works
            if (this.test(fill, layer)) {
                layer.fills.push(fill);
                return i;
            }
            else {
                //if not, get the next layer or create a layer and get it;
                if (i + 1 == this.layers.length)
                    this.layers.push(new LinearLayer());
            }
        }
    };
    LinearLayingStack.prototype.test = function (fill, layer) {
        return !(layer.fills.some(function (item) { return fill.intersectsWith(item); }));
    };
    return LinearLayingStack;
}());
var LinearLayer = (function () {
    function LinearLayer() {
        this.fills = [];
    }
    return LinearLayer;
}());
var LinearFill = (function () {
    function LinearFill(from, to) {
        this.from = from;
        this.to = to;
    }
    LinearFill.prototype.intersectsWith = function (fill) {
        return Math.sign(this.from - fill.to) * Math.sign(this.to - fill.from) <= 0;
    };
    return LinearFill;
}());
var CircularLayingStack = (function () {
    function CircularLayingStack(size) {
        this.size = size;
        this.layers = [];
    }
    CircularLayingStack.prototype.place = function (fill) {
        fill.split(this.size);
        if (this.layers.length == 0)
            this.layers.push(new CircularLayer());
        for (var i = 0; i < this.layers.length; i++) {
            //try get one layer
            var layer = this.layers[i];
            //check is the layer works
            if (this.test(fill, layer)) {
                layer.fills.push(fill);
                return i;
            }
            else {
                //if not, get the next layer or create a layer and get it;
                if (i + 1 == this.layers.length)
                    this.layers.push(new CircularLayer());
            }
        }
    };
    CircularLayingStack.prototype.test = function (fill, layer) {
        return !(layer.fills.some(function (item) { return fill.intersectsWith(item); }));
    };
    return CircularLayingStack;
}());
var CircularLayer = (function () {
    function CircularLayer() {
        this.fills = [];
    }
    return CircularLayer;
}());
var CircularFill = (function () {
    function CircularFill(from, to, direction) {
        this.from = from;
        this.to = to;
        this.direction = direction;
    }
    CircularFill.prototype.split = function (length) {
        //console.log('splitting: ', this.from, this.to, this.direction ? '顺时针' : '逆时针');
        if (this.from >= this.to) {
            var f = this.from;
            var t = this.to;
            //200 to length;
            this.from = f;
            this.to = length;
            //0 to 50;
            this.from2 = 1;
            this.to2 = t;
        }
        //console.log('split result: ', this.from, this.to, this.from2, this.to2);
    };
    CircularFill.prototype.intersectsWith = function (fill) {
        if (Math.sign(this.from - fill.to) * Math.sign(this.to - fill.from) <= 0)
            return true;
        if (typeof this.from2 == 'number')
            if (Math.sign(this.from2 - fill.to) * Math.sign(this.to2 - fill.from) <= 0)
                return true;
        if (typeof fill.from2 == 'number')
            if (Math.sign(this.from - fill.to2) * Math.sign(this.to - fill.from2) <= 0)
                return true;
        if ((typeof this.from2 == 'number') && (typeof fill.from2 == 'number'))
            if (Math.sign(this.from2 - fill.to2) * Math.sign(this.to2 - fill.from2) <= 0)
                return true;
        return false;
    };
    return CircularFill;
}());
var CircularLabelStack = (function () {
    function CircularLabelStack(radius) {
        this.radius = radius;
        this.leftLayer = new CircularLabelLayer();
        this.rightLayer = new CircularLabelLayer();
    }
    CircularLabelStack.prototype.place = function (fill) {
        fill.allocate(this.radius);
        if (fill.centerAngle < Math.PI) {
            if (fill.centerAngle < Math.PI * 0.5) {
                fill.isLeft = false;
                //moving down
                while (this.rightLayer.fills.some(function (item) { return item.intersectsWith(fill); }))
                    fill.move(-1);
                this.rightLayer.fills.push(fill);
            }
            else {
                fill.isLeft = true;
                //moving down
                while (this.rightLayer.fills.some(function (item) { return item.intersectsWith(fill); }))
                    fill.move(-1);
                this.rightLayer.fills.push(fill);
            }
        }
        else {
            if (fill.centerAngle < Math.PI * 1.5) {
                fill.isLeft = true;
                //moving up 
                while (this.leftLayer.fills.some(function (item) { return item.intersectsWith(fill); }))
                    fill.move(1);
                this.leftLayer.fills.push(fill);
            }
            else {
                fill.isLeft = false;
                //moving up
                while (this.leftLayer.fills.some(function (item) { return item.intersectsWith(fill); }))
                    fill.move(1);
                this.leftLayer.fills.push(fill);
            }
        }
    };
    return CircularLabelStack;
}());
var CircularLabelLayer = (function () {
    function CircularLabelLayer() {
        this.fills = [];
    }
    return CircularLabelLayer;
}());
var CircularLabelFill = (function () {
    function CircularLabelFill(begin, end, direction, label) {
        this.label = label;
        if (direction) {
            this.centerAngle = begin + (end - begin) / 2;
        }
        else {
            this.centerAngle = end + (begin - end) / 2;
        }
        while (this.centerAngle < 0)
            this.centerAngle += PI2;
        while (this.centerAngle > PI2)
            this.centerAngle -= PI2;
        this.desiredHeight = this.label.getMeasuredHeight();
        this.desiredWidth = this.label.getMeasuredWidth();
    }
    CircularLabelFill.prototype.allocate = function (radius) {
        this.centerY = Math.sin(this.centerAngle) * radius;
        this.centerX = Math.cos(this.centerAngle) * radius;
        this.from = this.centerY - this.desiredHeight / 2;
        this.to = this.centerY + this.desiredHeight / 2;
    };
    CircularLabelFill.prototype.move = function (offset) {
        this.from += offset;
        this.to += offset;
        this.centerY += offset;
    };
    CircularLabelFill.prototype.intersectsWith = function (fill) {
        return Math.sign(this.from - fill.to) * Math.sign(this.to - fill.from) <= 0;
    };
    return CircularLabelFill;
}());
var ShapeUtil = (function () {
    function ShapeUtil() {
    }
    ShapeUtil.Background = function (boundary, stroke, fill) {
        var shape = new easel_1.createjs.Shape();
        shape.graphics.beginStroke(stroke).beginFill(fill).moveTo(boundary.left, boundary.top).lineTo(boundary.right, boundary.top).lineTo(boundary.right, boundary.bottom).lineTo(boundary.left, boundary.bottom)
            .lineTo(boundary.left, boundary.top).closePath();
        shape.alpha = 0.4;
        return shape;
    };
    ShapeUtil.LinearBase = function (width, height, stroke, fill, label, font, color) {
        var group = new AnnotationViewGroup(stroke, fill, label, font, color, true);
        group.isBase = true;
        group.isCircular = false;
        ShapeUtil.LinearRectangle(group, -width / 2, 0, width, height / 2, stroke, fill);
        return group;
    };
    ShapeUtil.LinearAnnotation = function (width, height, from, to, stroke, fill, stack, label, font, color) {
        var group = new AnnotationViewGroup(stroke, fill, label, font, color);
        group.isCircular = false;
        var layerIndex = stack.place(new LinearFill(from, to));
        var length = stack.size;
        var begin = (from / length - 0.5) * width;
        var end = (to / length - 0.5) * width;
        console.log('from->to:', from, to, 'linear layer: ', layerIndex);
        ShapeUtil.LinearArrow(group, begin, end, -height * layerIndex, height, stroke, fill);
        return group;
    };
    ShapeUtil.LinearRectangle = function (group, x, y, width, height, stroke, fill) {
        group.View.graphics.beginStroke(stroke).beginFill(fill).moveTo(x, y - height / 4).lineTo(x + width, y - height / 4).lineTo(x + width, y + height / 4).lineTo(x, y + height / 4).closePath();
    };
    ShapeUtil.LinearArrow = function (group, begin, end, y, height, stroke, fill) {
        var h2 = height * 0.5;
        var h4 = height * 0.25;
        var delta = Math.abs(end - begin);
        var middle = (end + begin) / 2;
        var wm;
        if (delta < h2) {
            wm = middle;
        }
        else {
            wm = end - Math.sign(end - begin) * h4;
        }
        console.log('draw linear arrow:', begin, end, wm, h2);
        group.View.graphics.beginStroke(stroke).beginFill(fill).moveTo(begin, y - h4).lineTo(wm, y - h4).lineTo(wm, y - h2)
            .lineTo(end, y).lineTo(wm, y + h2).lineTo(wm, y + h4).lineTo(begin, y + h4).closePath().endFill().endStroke();
        var halfLabelWidth = group.Label.getMeasuredWidth() / 2;
        group.linearLabelFill = new LinearFill(middle - halfLabelWidth, middle + halfLabelWidth);
        group.viewCenterX = (begin + end) / 2;
        group.viewCenterY = y;
    };
    ShapeUtil.CircularBase = function (height, radius, stroke, fill, label, font, color) {
        var group = new AnnotationViewGroup(stroke, fill, label, font, color);
        group.isBase = true;
        group.isCircular = true;
        ShapeUtil.CircularRectangle(group, -Math.PI / 2, Math.PI + Math.PI, true, radius, height / 2, stroke, fill);
        return group;
    };
    ShapeUtil.CircularRectangle = function (group, begin, sweep, direction, radius, height, stroke, fill) {
        var h2 = height / 2;
        var h4 = height / 4;
        group.View.graphics.beginStroke(stroke).beginFill(fill).arc(0, 0, radius + h4, begin, begin + sweep, direction).arc(0, 0, radius - h4, begin + sweep, begin, !direction);
    };
    ShapeUtil.CircularAnnotation = function (height, radius, from, to, direction, stroke, fill, stack, label, font, color) {
        var group = new AnnotationViewGroup(stroke, fill, label, font, color);
        group.isCircular = true;
        var length = stack.size;
        var f = direction ? from : to;
        var t = direction ? to : from;
        var layerIndex = stack.place(new CircularFill(from, to, direction));
        var begin = f / length * Math.PI * 2;
        var end = t / length * Math.PI * 2;
        ShapeUtil.CircularArrow(group, begin, end, direction, layerIndex * height + radius, height, stroke, fill);
        return group;
    };
    ShapeUtil.CircularArrow = function (group, begin, end, direction, radius, height, stroke, fill) {
        var h2 = height / 2;
        var h4 = height / 4;
        var sw = end - begin;
        var wm;
        //let PI2 = Math.PI * 2;
        if (direction) {
            //make sure end > begin and end - begin < PI2;
            while (end < begin)
                end += PI2;
            while (end - begin > PI2)
                end -= PI2;
            wm = (Math.abs(Math.sin((end - begin) / 4)) * radius < h4) ? (begin + (end - begin) / 2) : (end + (direction ? -2 : 2) * Math.asin(h4 / radius));
        }
        else {
            //make sure begin > end and begin - end < PI2;
            while (begin < end)
                begin += PI2;
            while (begin - end > PI2)
                begin -= PI2;
            wm = (Math.abs(Math.sin((begin - end) / 4)) * radius < h4) ? (begin - (begin - end) / 2) : (end + (direction ? -2 : 2) * Math.asin(h4 / radius));
        }
        begin -= Math.PI / 2;
        wm -= Math.PI / 2;
        end -= Math.PI / 2;
        group.View.graphics.beginStroke(stroke).beginFill(fill).arc(0, 0, radius + h4, begin, wm, !direction).lineToRA(radius + h2, wm).lineToRA(radius, end)
            .lineToRA(radius - h2, wm).arc(0, 0, radius - h4, wm, begin, direction);
        group.circularLabelFill = new CircularLabelFill(begin, end, direction, group.Label);
        group.viewCenterX = Math.cos((begin + end) / 2) * radius;
        group.viewCenterY = Math.sin((begin + end) / 2) * radius;
    };
    return ShapeUtil;
}());
var AnnotationViewGroup = (function (_super) {
    __extends(AnnotationViewGroup, _super);
    function AnnotationViewGroup(stroke, fill, text, font, color, hideline) {
        var _this = this;
        _super.call(this);
        this.stroke = stroke;
        this.fill = fill;
        this.text = text;
        this.font = font;
        this.color = color;
        this.hideline = hideline;
        this.applyLinearLabel = function (y) {
            if (_this.isBase) {
                _this.label.x = -_this.label.getMeasuredWidth() / 2;
                _this.label.y = y;
                _this.left = _this.label.x;
                _this.right = -_this.label.x;
                _this.bottom = y + _this.label.getMeasuredHeight();
            }
            else {
                var labelHeight = _this.label.getMeasuredHeight();
                _this.label.x = _this.linearLabelFill.from;
                _this.label.y = y - labelHeight / 2;
                _this.left = _this.label.x;
                _this.right = _this.label.x + _this.label.getMeasuredWidth();
                _this.top = _this.label.y;
                if (_this.line)
                    _this.line.graphics.beginStroke(_this.stroke).moveTo(_this.viewCenterX, _this.viewCenterY).lineTo(_this.viewCenterX, y + labelHeight / 2).endStroke();
            }
        };
        this.applyCircularLabel = function () {
            if (_this.isBase) {
                console.log('base label applied');
                _this.label.x = _this.label.getMeasuredWidth() * -0.5;
                _this.label.y = _this.label.getMeasuredHeight() * -0.5;
                _this.left = _this.label.x;
                _this.top = _this.label.y;
                _this.right = -_this.label.x;
                _this.bottom = -_this.label.y;
            }
            else {
                if (_this.circularLabelFill.isLeft) {
                    _this.label.x = _this.circularLabelFill.centerX - _this.circularLabelFill.desiredWidth;
                    _this.label.y = _this.circularLabelFill.from;
                    _this.left = _this.circularLabelFill.centerX - _this.circularLabelFill.desiredWidth;
                    _this.top = _this.circularLabelFill.from;
                    _this.bottom = _this.circularLabelFill.to;
                }
                else {
                    _this.label.x = _this.circularLabelFill.centerX;
                    _this.label.y = _this.circularLabelFill.from;
                    _this.right = _this.circularLabelFill.centerX + _this.circularLabelFill.desiredWidth;
                    _this.top = _this.circularLabelFill.from;
                    _this.bottom = _this.circularLabelFill.to;
                }
                if (_this.line)
                    _this.line.graphics.beginStroke(_this.stroke).moveTo(_this.viewCenterX, _this.viewCenterY).lineTo(_this.circularLabelFill.centerX, _this.circularLabelFill.centerY).endStroke();
            }
        };
        this.view = new easel_1.createjs.Shape();
        this.addChild(this.view);
        if (!hideline) {
            this.line = new easel_1.createjs.Shape();
            this.addChild(this.line);
        }
        this.label = new easel_1.createjs.Text(text, font, color);
        this.addChild(this.label);
    }
    Object.defineProperty(AnnotationViewGroup.prototype, "View", {
        get: function () {
            return this.view;
        },
        set: function (value) {
            if (this.contains(this.view))
                this.removeChild(this.view);
            this.view = value;
            this.addChild(this.view);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AnnotationViewGroup.prototype, "Line", {
        get: function () {
            return this.line;
        },
        set: function (value) {
            if (this.contains(this.line))
                this.removeChild(this.line);
            this.line = value;
            this.addChild(this.line);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AnnotationViewGroup.prototype, "Label", {
        get: function () {
            return this.label;
        },
        set: function (value) {
            if (this.contains(this.label))
                this.removeChild(this.label);
            this.label = value;
            this.addChild(this.label);
        },
        enumerable: true,
        configurable: true
    });
    return AnnotationViewGroup;
}(easel_1.createjs.Container));
exports.AnnotationViewGroup = AnnotationViewGroup;
var Boundary = (function () {
    function Boundary(left, right, top, bottom) {
        this.left = left;
        this.right = right;
        this.top = top;
        this.bottom = bottom;
    }
    Boundary.prototype.include = function (value) {
        if (typeof value.left == 'number' && !isNaN(value.left))
            this.left = Math.min(this.left, value.left);
        if (typeof value.right == 'number' && !isNaN(value.right))
            this.right = Math.max(this.right, value.right);
        if (typeof value.top == 'number' && !isNaN(value.top))
            this.top = Math.min(this.top, value.top);
        if (typeof value.bottom == 'number' && !isNaN(value.bottom))
            this.bottom = Math.max(this.bottom, value.bottom);
    };
    Boundary.prototype.extend = function (value) {
        this.left -= value;
        this.top -= value;
        this.right += value;
        this.bottom += value;
    };
    return Boundary;
}());
easel_1.createjs.Graphics.prototype.moveToRA = function (radius, angle) {
    var that = eval('this');
    return that.moveTo(radius * Math.cos(angle), radius * Math.sin(angle));
};
easel_1.createjs.Graphics.prototype.lineToRA = function (radius, angle) {
    var that = eval('this');
    return that.lineTo(radius * Math.cos(angle), radius * Math.sin(angle));
};
//# sourceMappingURL=vectorview.js.map