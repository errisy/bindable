"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var easel_1 = require('../easel/easel');
var eventservice_1 = require('./eventservice');
var stage_component_1 = require('../easel/stage.component');
var Serializable_1 = require('Serializable');
var WorkSpaceView = (function (_super) {
    __extends(WorkSpaceView, _super);
    function WorkSpaceView() {
        _super.call(this);
        //events: Node Selected, StageMousedown,
        this.Events = new eventservice_1.EventService({ node$selected: 'node$selected' });
        this.Events.subscribe(this.Events.Directives.node$selected, this, this.event_node$selected);
        //it needs to monitor the stage events such as stagemousedown stagemouseup to allow drag view vertically
    }
    ;
    WorkSpaceView.prototype.grabByStage = function (stage) {
        stage_component_1.EaselCanvasUtil.CanGrabByStage(stage, this);
    };
    /**
     * when a node is selected
     * @param node
     */
    WorkSpaceView.prototype.event_node$selected = function (node) {
    };
    WorkSpaceView.prototype.addNode = function () {
        var _this = this;
        var nodes = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            nodes[_i - 0] = arguments[_i];
        }
        nodes.forEach(function (node) {
            _this.addChild(node);
            node.Events.subscribe('selected', _this, _this.onNodeSelected);
        });
    };
    WorkSpaceView.prototype.onNodeSelected = function (node) {
    };
    return WorkSpaceView;
}(easel_1.createjs.Container));
exports.WorkSpaceView = WorkSpaceView;
var WorkSpace = (function () {
    function WorkSpace() {
    }
    return WorkSpace;
}());
exports.WorkSpace = WorkSpace;
/**
 * A node stands for an operation. It can be dragged to anywhere in the view;
 */
var NodeView = (function (_super) {
    __extends(NodeView, _super);
    function NodeView() {
        _super.call(this);
        this.Events = new eventservice_1.EventService({ selected: 'selected' });
        this.on('mousedown', this.onMouseDown);
    }
    NodeView.prototype.onMouseDown = function (ev) {
        this.node.selected = true;
        this.Events.emit(this.Events.Directives.selected, this, true, this);
    };
    NodeView.prototype.present = function () {
        //draw operation on the top
        //draw DNA molecule 
        //draw index and title
        //draw molecule list
        //draw message
        //draw warning
        //draw the frameand background(transparent 0.2) for detecting selection;
    };
    return NodeView;
}(easel_1.createjs.Container));
exports.NodeView = NodeView;
var Node = (function () {
    function Node() {
        this.DNAMolecules = [];
        this.Warnings = [];
        this.Message = [];
        this.Sources = []; //for drawing arrows;
    }
    Node = __decorate([
        Serializable_1.Serializable('/mcds/workspace'), 
        __metadata('design:paramtypes', [])
    ], Node);
    return Node;
}());
exports.Node = Node;
var DNANode = (function (_super) {
    __extends(DNANode, _super);
    function DNANode() {
        _super.call(this);
        this.Operation = 'DNA';
    }
    DNANode = __decorate([
        Serializable_1.Serializable('/mcds/workspace'), 
        __metadata('design:paramtypes', [])
    ], DNANode);
    return DNANode;
}(Node));
exports.DNANode = DNANode;
/**
 * A page is a page for print; In this system, MCDS must generate a new html page for print; This is just a way to point out where to print;
 */
var PageView = (function (_super) {
    __extends(PageView, _super);
    function PageView() {
        _super.call(this);
    }
    PageView.prototype.present = function () {
        //draw page frames;
        //draw the resize bar;
    };
    return PageView;
}(easel_1.createjs.Container));
exports.PageView = PageView;
var Page = (function () {
    function Page() {
    }
    return Page;
}());
exports.Page = Page;
//# sourceMappingURL=workspace.js.map