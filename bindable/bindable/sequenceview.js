"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var nuctions_1 = require('./nuctions');
var eventservice_1 = require('./eventservice');
var easel_1 = require('../easel/easel');
/**
 * this class draw part of the sequence in a 'scroll view' like UI
 */
var GeneSequenceView = (function (_super) {
    __extends(GeneSequenceView, _super);
    function GeneSequenceView() {
        var _this = this;
        _super.call(this);
        this.nucleotidesPerGroup = 10;
        this.groupsPerLine = 5;
        this.groupsSpacing = 4;
        this.font = '12pt Arial';
        this.lines = [];
        this.scrollEvents = new eventservice_1.EventService({});
        this.on('added', function () {
            if (_this.stage) {
                _this.resizeStage = _this.stage;
                _this.resizeStage.onHeightChanged = function (height, stage) {
                };
            }
        });
        this.on('removed', function () {
            if (!_this.stage) {
                _this.resizeStage = _this.stage;
                _this.resizeStage.onHeightChanged = undefined;
            }
        });
        this.scrollBarBackground = new easel_1.createjs.Shape();
        this.scrollBar = new easel_1.createjs.Shape();
        this.lineContainer = new easel_1.createjs.Container();
    }
    GeneSequenceView.prototype.leftOfNucleotide = function (indexFromZero) {
        return this.indent + indexFromZero * this.unitWidth + Math.floor(indexFromZero / 5) * this.groupsSpacing;
    };
    GeneSequenceView.prototype.rightOfNucleotide = function (indexFromZero) {
        return this.indent + (indexFromZero + 1) * this.unitWidth + Math.floor(indexFromZero / 5) * this.groupsSpacing;
    };
    /**
     * construct the size of the whole sequence view by analyzing it;
     */
    GeneSequenceView.prototype.virtualize = function () {
        var lineLength = this.nucleotidesPerGroup * this.groupsPerLine;
        this.scrollLength = Math.ceil(this.geneFile.Length / lineLength) - 1;
        var totalLength = this.geneFile.Length;
        //meature font sizes:
        var fontA = new easel_1.createjs.Text('A', this.font, 'black');
        var fontT = new easel_1.createjs.Text('T', this.font, 'black');
        var fontG = new easel_1.createjs.Text('G', this.font, 'black');
        var fontC = new easel_1.createjs.Text('C', this.font, 'black');
        // !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~ all asc letters that may occur in the fonts;
        var fonts = new easel_1.createjs.Text(' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~', this.font, 'black');
        this.unitWidth = 2 + Math.max(fontA.getMeasuredWidth(), fontT.getMeasuredWidth(), fontG.getMeasuredWidth(), fontC.getMeasuredWidth());
        this.unitHeight = 2 + Math.max(fontA.getMeasuredHeight(), fontT.getMeasuredHeight(), fontG.getMeasuredHeight(), fontC.getMeasuredHeight());
        this.rowHeight = 4 + fonts.getMeasuredHeight();
        var fontIndex = new easel_1.createjs.Text(this.geneFile.Length.toString(), this.font, 'black');
        this.indent = fontIndex.getMeasuredWidth() + 24;
        var rowCount = 0;
        for (var i = 1; i <= totalLength; i += lineLength) {
            var line = new GeneSequenceLine(this, i);
            line.top = rowCount * this.rowHeight;
            rowCount += line.numberOfRows;
            line.bottom = rowCount * this.rowHeight;
            this.lines.push(line);
        }
    };
    /**
     * this method require the size of parent canvas. it won't draw if it was not added to a stage.
     */
    GeneSequenceView.prototype.present = function () {
        if (!this.stage)
            return;
        var canvas = this.stage.canvas;
        var height = canvas.clientHeight;
        var width = canvas.clientWidth;
        this.lineContainer.removeAllChildren();
        this.scrollBarBackground.graphics.clear();
        this.scrollBarBackground.graphics.beginStroke('grey').beginFill('white').moveTo(width - 16, 0).lineTo(width, 0).lineTo(width, height).lineTo(width - 16, height).lineTo(width - 16, 0).closePath().endFill().endStroke();
    };
    return GeneSequenceView;
}(easel_1.createjs.Container));
var GeneSequenceLine = (function () {
    function GeneSequenceLine(sequenceView, begin) {
        this.sequenceView = sequenceView;
        this.begin = begin;
        this.buildView();
    }
    /**
     * allocate annotations to layers, and return the number of row;
     */
    GeneSequenceLine.prototype.buildView = function () {
        //basic height are 4 rows
        var _this = this;
        this.restrictoinEnzymeStack = new AnnotationLayingStack();
        this.recombinationSiteStack = new AnnotationLayingStack();
        this.annotationStack = new AnnotationLayingStack();
        this.sequenceView.geneFile.RestrictionEnzymes.forEach(function (anno) {
            var fill = _this.intersectWithAnnotation(anno.Start, anno.End);
            if (fill) {
                fill.type = 'RestrictionEnzyme';
                fill.restrictionEnzyme = anno;
                _this.restrictoinEnzymeStack.place(fill);
            }
        });
        this.sequenceView.geneFile.RecombinatinionSites.forEach(function (anno) {
            var fill = _this.intersectWithAnnotation(anno.Start, anno.End);
            if (fill) {
                fill.type = 'RestrictionEnzyme';
                fill.recombinationSite = anno;
                _this.recombinationSiteStack.place(fill);
            }
        });
        this.sequenceView.geneFile.Annotations.forEach(function (anno) {
            var fill = _this.intersectWithAnnotation(anno.Start, anno.End);
            if (fill) {
                fill.type = 'RestrictionEnzyme';
                fill.annotation = anno;
                _this.annotationStack.place(fill);
            }
        });
        return 4 + this.restrictoinEnzymeStack.layers.length + this.recombinationSiteStack.layers.length + this.annotationStack.layers.length;
    };
    Object.defineProperty(GeneSequenceLine.prototype, "numberOfRows", {
        get: function () {
            return 4 + this.restrictoinEnzymeStack.layers.length + this.recombinationSiteStack.layers.length + this.annotationStack.layers.length;
        },
        enumerable: true,
        configurable: true
    });
    GeneSequenceLine.prototype.intersectWithAnnotation = function (from, to) {
        var length = this.sequenceView.geneFile.Length;
        //split annotation;
        var from2, to2;
        if (from >= to) {
            var f = from;
            var t = to;
            //200 to length;
            from = f;
            to = length;
            //0 to 50;
            from2 = 1;
            to2 = t;
        }
        var end = this.begin + this.sequenceView.groupsPerLine * this.sequenceView.nucleotidesPerGroup - 1;
        if (from2) {
            //there are 2 sections;
            if (to2 >= this.begin && from <= end) {
                var fill = new AnnotationFill(Math.max(from, this.begin), end, true);
                fill.from2 = this.begin;
                fill.to2 = Math.min(to2, end);
                return fill;
            }
            else {
                if (Math.sign(from2 - end) * Math.sign(to2 - this.begin) <= 0) {
                    return new AnnotationFill(Math.max(from2, this.begin), Math.min(to2, end), true);
                }
            }
        }
        //this is only one section;
        if (Math.sign(from - end) * Math.sign(to - this.begin) <= 0) {
            return new AnnotationFill(Math.max(from, this.begin), Math.min(to, end), true);
        }
    };
    /**
     * the sequence view works out which line to show and ask it to show;
     * but sequence line will disappear when it works out that it is out of the visible range;
     */
    GeneSequenceLine.prototype.show = function () {
        if (this.View)
            return; //do nothing if the View is visible;
        this.View = new easel_1.createjs.Container();
        var y;
        //draw annotations;
        y = 0;
        //draw nucleotides;
        y = this.annotationStack.layers.length * this.sequenceView.rowHeight;
        //work out selection;
        y = (this.annotationStack.layers.length + this.recombinationSiteStack.layers.length) * this.sequenceView.rowHeight;
        //draw the index and nucleotides;
        y = (this.annotationStack.layers.length + this.recombinationSiteStack.layers.length + this.restrictoinEnzymeStack.layers.length + 1) * this.sequenceView.rowHeight;
        var index = new easel_1.createjs.Text(this.begin.toString(), this.sequenceView.font, 'black');
        index.y = y;
        this.View.addChild(index);
        for (var i = this.begin - 1; i < this.sequenceView.nucleotidesPerGroup * this.sequenceView.groupsPerLine; i++) {
            var charF = this.sequenceView.geneFile.Sequence.charAt(i);
            var charR = nuctions_1.Nuctions.ReverseComplementN(charF);
            var nucleotideF = new easel_1.createjs.Text(charF, this.sequenceView.font, 'black');
            var nucleotideR = new easel_1.createjs.Text(charR, this.sequenceView.font, 'black');
            nucleotideF.x = this.sequenceView.leftOfNucleotide(i - this.begin + 1);
            nucleotideR.x = nucleotideF.x;
            nucleotideF.y = y;
            nucleotideR.y = y + this.sequenceView.rowHeight;
            var nucleotideContainer = new easel_1.createjs.Container();
            var nucleotideBox = new easel_1.createjs.Shape();
            nucleotideBox.graphics.beginFill('white')
                .moveTo(0, 0)
                .lineTo(this.sequenceView.unitWidth, 0)
                .lineTo(this.sequenceView.unitWidth, this.sequenceView.rowHeight * 2)
                .lineTo(0, this.sequenceView.rowHeight * 2)
                .closePath().endFill();
            nucleotideBox.x = nucleotideF.x;
            nucleotideBox.y = nucleotideF.y;
            nucleotideContainer.addChild(nucleotideBox, nucleotideF, nucleotideR);
            this.View.addChild(nucleotideContainer);
        }
        //draw the primers:
        y = (this.annotationStack.layers.length + this.recombinationSiteStack.layers.length + this.restrictoinEnzymeStack.layers.length + 0) * this.sequenceView.rowHeight;
        y = (this.annotationStack.layers.length + this.recombinationSiteStack.layers.length + this.restrictoinEnzymeStack.layers.length + 3) * this.sequenceView.rowHeight;
        this.sequenceView.scrollEvents.subscribe('scroll', this, this.scrollTo);
    };
    GeneSequenceLine.prototype.scrollTo = function () {
        if (this.View) {
            this.View.x = this.top - this.sequenceView.scrollOffset;
        }
    };
    GeneSequenceLine.prototype.hide = function () {
        this.sequenceView.lineContainer.removeChild(this.View);
        this.sequenceView.scrollEvents.unsubscribeAll(this);
        this.View = undefined;
    };
    return GeneSequenceLine;
}());
var AnnotationLayingStack = (function () {
    function AnnotationLayingStack() {
        this.layers = [];
    }
    AnnotationLayingStack.prototype.place = function (fill) {
        if (this.layers.length == 0)
            this.layers.push(new AnnotationLayer());
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
                    this.layers.push(new AnnotationLayer());
            }
        }
    };
    AnnotationLayingStack.prototype.test = function (fill, layer) {
        return !(layer.fills.some(function (item) { return fill.intersectsWith(item); }));
    };
    return AnnotationLayingStack;
}());
var AnnotationLayer = (function () {
    function AnnotationLayer() {
        this.fills = [];
    }
    return AnnotationLayer;
}());
/**
 * This is for managing view through multiple
 */
var ViewAnnotation = (function () {
    function ViewAnnotation() {
    }
    return ViewAnnotation;
}());
var AnnotationFill = (function () {
    function AnnotationFill(from, to, direction) {
        this.from = from;
        this.to = to;
        this.direction = direction;
    }
    AnnotationFill.prototype.split = function (length) {
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
    AnnotationFill.prototype.intersects = function (begin, end) {
        if (this.from2) {
            //there are 2 sections;
            if (this.to2 >= begin && this.from <= end) {
                var fill = new AnnotationFill(Math.max(this.from, begin), end, true);
                fill.from2 = begin;
                fill.to2 = Math.min(this.to2, end);
                return fill;
            }
            else {
                if (Math.sign(this.from2 - end) * Math.sign(this.to2 - begin) <= 0) {
                    return new AnnotationFill(Math.max(this.from2, begin), Math.min(this.to2, end), true);
                }
            }
        }
        //this is only one section;
        if (Math.sign(this.from - end) * Math.sign(this.to - begin) <= 0) {
            return new AnnotationFill(Math.max(this.from, begin), Math.min(this.to, end), true);
        }
        return undefined;
    };
    AnnotationFill.prototype.intersectsWith = function (fill) {
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
    return AnnotationFill;
}());
//# sourceMappingURL=sequenceview.js.map