"use strict";
(function (ViewElement) {
    ViewElement[ViewElement["div"] = 0] = "div";
    ViewElement[ViewElement["span"] = 1] = "span";
    ViewElement[ViewElement["p"] = 2] = "p";
    ViewElement[ViewElement["a"] = 3] = "a";
    ViewElement[ViewElement["ul"] = 4] = "ul";
    ViewElement[ViewElement["li"] = 5] = "li";
    ViewElement[ViewElement["table"] = 6] = "table";
    ViewElement[ViewElement["thead"] = 7] = "thead";
    ViewElement[ViewElement["tbody"] = 8] = "tbody";
    ViewElement[ViewElement["tr"] = 9] = "tr";
    ViewElement[ViewElement["td"] = 10] = "td";
})(exports.ViewElement || (exports.ViewElement = {}));
var ViewElement = exports.ViewElement;
(function (Display) {
    /**Default value. Displays an element as an inline element (like <span>)*/
    Display[Display["inline"] = 0] = "inline";
    /**Displays an element as a block element (like <p>)*/
    Display[Display["block"] = 1] = "block";
    /**Displays an element as an block-level flex container. New in CSS3*/
    Display[Display["flex"] = 2] = "flex";
})(exports.Display || (exports.Display = {}));
var Display = exports.Display;
(function (FlexAlignSelf) {
    FlexAlignSelf[FlexAlignSelf["auto"] = 0] = "auto";
    FlexAlignSelf[FlexAlignSelf["start"] = 1] = "start";
    FlexAlignSelf[FlexAlignSelf["end"] = 2] = "end";
    FlexAlignSelf[FlexAlignSelf["center"] = 3] = "center";
    FlexAlignSelf[FlexAlignSelf["baseline"] = 4] = "baseline";
    FlexAlignSelf[FlexAlignSelf["stretch"] = 5] = "stretch";
})(exports.FlexAlignSelf || (exports.FlexAlignSelf = {}));
var FlexAlignSelf = exports.FlexAlignSelf;
(function (FlexItemsAlign) {
    FlexItemsAlign[FlexItemsAlign["start"] = 0] = "start";
    FlexItemsAlign[FlexItemsAlign["end"] = 1] = "end";
    FlexItemsAlign[FlexItemsAlign["center"] = 2] = "center";
    FlexItemsAlign[FlexItemsAlign["baseline"] = 3] = "baseline";
    FlexItemsAlign[FlexItemsAlign["stretch"] = 4] = "stretch";
})(exports.FlexItemsAlign || (exports.FlexItemsAlign = {}));
var FlexItemsAlign = exports.FlexItemsAlign;
(function (FlexDirection) {
    FlexDirection[FlexDirection["row"] = 0] = "row";
    FlexDirection[FlexDirection["rowReverse"] = 1] = "rowReverse";
    FlexDirection[FlexDirection["column"] = 2] = "column";
    FlexDirection[FlexDirection["columnReverse"] = 3] = "columnReverse";
})(exports.FlexDirection || (exports.FlexDirection = {}));
var FlexDirection = exports.FlexDirection;
(function (FlexWrap) {
    FlexWrap[FlexWrap["none"] = 0] = "none";
    FlexWrap[FlexWrap["wrap"] = 1] = "wrap";
    FlexWrap[FlexWrap["wrapReverse"] = 2] = "wrapReverse";
})(exports.FlexWrap || (exports.FlexWrap = {}));
var FlexWrap = exports.FlexWrap;
(function (FlexItemsJustify) {
    FlexItemsJustify[FlexItemsJustify["start"] = 0] = "start";
    FlexItemsJustify[FlexItemsJustify["end"] = 1] = "end";
    FlexItemsJustify[FlexItemsJustify["center"] = 2] = "center";
    FlexItemsJustify[FlexItemsJustify["spaceBetween"] = 3] = "spaceBetween";
    FlexItemsJustify[FlexItemsJustify["spaceAround"] = 4] = "spaceAround";
})(exports.FlexItemsJustify || (exports.FlexItemsJustify = {}));
var FlexItemsJustify = exports.FlexItemsJustify;
(function (FlexLinesJustify) {
    FlexLinesJustify[FlexLinesJustify["start"] = 0] = "start";
    FlexLinesJustify[FlexLinesJustify["end"] = 1] = "end";
    FlexLinesJustify[FlexLinesJustify["center"] = 2] = "center";
    FlexLinesJustify[FlexLinesJustify["spaceBetween"] = 3] = "spaceBetween";
    FlexLinesJustify[FlexLinesJustify["spaceAround"] = 4] = "spaceAround";
    FlexLinesJustify[FlexLinesJustify["stretch"] = 5] = "stretch";
})(exports.FlexLinesJustify || (exports.FlexLinesJustify = {}));
var FlexLinesJustify = exports.FlexLinesJustify;
var View = (function () {
    function View() {
    }
    View.build = function (container) {
        var builder = [];
        builder.push('<div style="');
        //styles:
        View.parseFlexDirection(container, builder);
        View.parseFlexWrap(container, builder);
        View.parseFlexItemsJustify(container, builder);
        View.parseFlexLinesJustify(container, builder);
        View.parseFlexItemsAlign(container, builder);
        builder.push('" >');
        //content
        builder.push('</div>');
    };
    View.parseDisplay = function (view, builder) {
        builder.push('display:');
    };
    View.parseFlexAlignSelf = function (view, builder) {
        builder.push('align-self:');
        switch (view.alignSelf) {
            case FlexAlignSelf.auto:
                builder.push('auto;');
                break;
            case FlexAlignSelf.start:
                builder.push('flex-start;');
                break;
            case FlexAlignSelf.end:
                builder.push('flex-end;');
                break;
            case FlexAlignSelf.center:
                builder.push('center;');
                break;
            case FlexAlignSelf.baseline:
                builder.push('baseline;');
                break;
            case FlexAlignSelf.stretch:
                builder.push('stretch;');
                break;
        }
    };
    View.parseFlexDirection = function (container, builder) {
        builder.push('flex-direction:');
        switch (container.itemsDirection) {
            case FlexDirection.row:
                builder.push('row;');
                break;
            case FlexDirection.rowReverse:
                builder.push('row-reverse;');
                break;
            case FlexDirection.column:
                builder.push('column');
                break;
            case FlexDirection.columnReverse:
                builder.push('column-reverse;');
                break;
        }
    };
    View.parseFlexWrap = function (container, builder) {
        builder.push('flex-wrap:');
        switch (container.itemsWrap) {
            case FlexWrap.none:
                builder.push('nowrap;');
                break;
            case FlexWrap.wrap:
                builder.push('wrap;');
                break;
            case FlexWrap.wrapReverse:
                builder.push('wrap-reverse;');
                break;
        }
    };
    View.parseFlexItemsJustify = function (container, builder) {
        builder.push('justify-content:');
        switch (container.itemsJustify) {
            case FlexItemsJustify.start:
                builder.push('flex-start;');
                break;
            case FlexItemsJustify.end:
                builder.push('flex-end;');
                break;
            case FlexItemsJustify.center:
                builder.push('center;');
                break;
            case FlexItemsJustify.spaceBetween:
                builder.push('space-between;');
                break;
            case FlexItemsJustify.spaceAround:
                builder.push('space-around;');
                break;
        }
    };
    View.parseFlexLinesJustify = function (container, builder) {
        builder.push('align-content:');
        switch (container.linesJustify) {
            case FlexLinesJustify.start:
                builder.push('flex-start;');
                break;
            case FlexLinesJustify.end:
                builder.push('flex-end;');
                break;
            case FlexLinesJustify.center:
                builder.push('center;');
                break;
            case FlexLinesJustify.spaceBetween:
                builder.push('space-between;');
                break;
            case FlexLinesJustify.spaceAround:
                builder.push('space-around;');
                break;
            case FlexLinesJustify.stretch:
                builder.push('stretch;');
                break;
        }
    };
    View.parseFlexItemsAlign = function (container, builder) {
        builder.push('align-items:');
        switch (container.itemsAlign) {
            case FlexItemsAlign.start:
                builder.push('flex-start;');
                break;
            case FlexItemsAlign.end:
                builder.push('flex-end;');
                break;
            case FlexItemsAlign.center:
                builder.push('center;');
                break;
            case FlexItemsAlign.baseline:
                builder.push('baseline;');
                break;
            case FlexItemsAlign.stretch:
                builder.push('stretch;');
                break;
        }
    };
    View.test = function () {
        View.build({ itemsDirection: FlexDirection.row });
    };
    return View;
}());
exports.View = View;
//# sourceMappingURL=view.js.map