"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var stringutil_1 = require('./stringutil');
var nuctions_1 = require('./nuctions');
var eventservice_1 = require('./eventservice');
var Serializable_1 = require('Serializable');
var GeneFile = (function () {
    function GeneFile() {
        this.OperationEvents = new eventservice_1.EventService({ selected: 'selected' });
    }
    Object.defineProperty(GeneFile.prototype, "Length", {
        get: function () {
            return this.Sequence.length;
        },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(GeneFile.prototype, "IsCircular", {
        get: function () {
            return (this.End_F == '::' && this.End_R == '::');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GeneFile.prototype, "IsLinearPlasmid", {
        get: function () {
            return (this.End_F == '0B' && this.End_R == '0B');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GeneFile.prototype, "IsClosedVector", {
        get: function () {
            return this.IsCircular || this.IsLinearPlasmid;
        },
        enumerable: true,
        configurable: true
    });
    GeneFile = __decorate([
        Serializable_1.Serializable('/mcds/genefile'), 
        __metadata('design:paramtypes', [])
    ], GeneFile);
    return GeneFile;
}());
exports.GeneFile = GeneFile;
/**
 * Annotation inherits EventService to synchronize behaviors in the sequence view and vector view
 */
var Annotation = (function () {
    function Annotation() {
        this.Complement = false;
        this.SelectionEvents = new eventservice_1.EventService({ selected: 'selected' });
    }
    Annotation = __decorate([
        Serializable_1.Serializable('/mcds/genefile'), 
        __metadata('design:paramtypes', [])
    ], Annotation);
    return Annotation;
}());
exports.Annotation = Annotation;
var Feature = (function () {
    function Feature() {
    }
    Feature.prototype.Length = function () {
        if (this.Sequence)
            return this.Sequence.length;
        return 0;
    };
    Feature = __decorate([
        Serializable_1.Serializable('/mcds/genefile'), 
        __metadata('design:paramtypes', [])
    ], Feature);
    return Feature;
}());
exports.Feature = Feature;
var GeneBankFileParser = (function () {
    function GeneBankFileParser() {
    }
    GeneBankFileParser.ParseGeneBank = function (Value) {
        var gf = new GeneFile();
        var Sections = stringutil_1.SectionDivider.Divide(Value, /(^|\n)(\/\/|\w+)/g);
        //console.log(Sections.length);
        var LOCI = stringutil_1.SectionDivider.SelectSection(Sections, /^locus/gi);
        //console.log(LOCI.length);
        if (LOCI.length == 1) {
            var LOCUS = LOCI[0];
            gf.Name = /LOCUS\s+([^\s]+)/gi.exec(LOCUS)[1];
            var topo = /LOCUS\s+([^\s]+)\s+(\d+)\s+(\w+)\s+(\w+)\s+([\w\-]+)\s+/gi.exec(LOCUS)[5];
            var topoMatch = /LOCUS\s+([^\s]+)\s+(\d+)\s+(\w+)\s+(\w+)\s+([\w\-]+)\s+/gi.exec(LOCUS);
            var topo = topoMatch[5];
            gf.Date = /\w+-\w+-\w+/.exec(LOCUS.substr(topoMatch.index))[0];
            if (topo.toLowerCase() == "linear") {
                gf.End_F = "*B";
                gf.End_R = "*B";
            }
            else {
                gf.End_F = "::";
                gf.End_R = "::";
            }
        }
        var Origins = stringutil_1.SectionDivider.SelectSection(Sections, /^origin/gi);
        var codes;
        if (Origins.length == 1) {
            var ORIGIN = Origins[0];
            codes = nuctions_1.Nuctions.TAGCFilter(ORIGIN.substr(6));
            gf.Sequence = codes;
            gf.RCSequence = nuctions_1.Nuctions.ReverseComplementN(codes);
        }
        gf.Annotations = [];
        var Features = stringutil_1.SectionDivider.SelectSection(Sections, /^features/gi);
        var regFeature = /\s+(\w+)\s+[<>]?(\d+)\.\.[<>]?(\d+)/g;
        var regFeatureComplement = /\s+(\w+)\s+complement\([<>]?(\d+)\.\.[<>]?(\d+)\)/g;
        //console.log('number of features: ' + Features.length);
        for (var i = 0; i < Features.length; i++) {
            var f = Features[i];
            var fSections = stringutil_1.SectionDivider.Divide(f, /(^|\n)\s{1,9}(\w+)\s+\w+/gi);
            //console.log('number of sections: ' + fSections.length);
            for (var j = 0; j < fSections.length; j++) {
                var fSec = fSections[j];
                var ff = regFeature.Match(fSec);
                var rf = regFeatureComplement.Match(fSec);
                var ga = new Annotation();
                if (ff) {
                    ga.Complement = false;
                    ga.Type = ff.groups[1];
                    ga.Start = Number(ff.groups[2]);
                    ga.End = Number(ff.groups[3]);
                }
                if (rf) {
                    ga.Complement = true;
                    ga.Type = rf.groups[1];
                    ga.Start = Number(rf.groups[2]);
                    ga.End = Number(rf.groups[3]);
                }
                //additional call to save the special method
                //ga.split(gf.Length);
                var sfSections = stringutil_1.SectionDivider.Divide(fSec, /(^|\n)\s+\/\w+\s*=\s*/g);
                //for (var k: number = 0; k < sfSections.length; k++) {
                //    sfSections[k] = sfSections[k].replace(/(^|\n)\s+/g, '');
                //}
                var rMeta = /^\/([\w\-\+\(\)]+)\s*=\s*/;
                var protein_id;
                for (var k = 0; k < sfSections.length; k++) {
                    var meta = sfSections[k].replace(/(^|\n)\s+/g, '');
                    //console.log(meta);
                    rMeta.lastIndex = 0;
                    var m = rMeta.Match(meta);
                    rMeta.lastIndex = 0;
                    //console.log(rMeta.test(meta));
                    var field = m.groups[1].toLowerCase();
                    var data = meta.replace(/[\r\n]+/g, '');
                    //console.log(data.substr(m.groups[0].length).replace(/^\s*\"/, ''));
                    var content = data.substr(m.groups[0].length).replace(/^\s*\"/, '').replace(/\"\s*$/g, '').replace(/\s{2,}/, ' ');
                    switch (field) {
                        case "transl_table":
                            data = /\d+/.Match(data).groups[0];
                            break;
                        case "translation":
                            break;
                        case "locus_tag":
                            ga.Label = content;
                            break;
                        case "product":
                            ga.Note = content;
                            break;
                        case "codon_start":
                            break;
                        case "gene":
                            ga.Label = content;
                            break;
                        case "label":
                            ga.Label = content;
                            break;
                        case "note":
                            ga.Note = content;
                            break;
                        case "protein_id":
                            protein_id = content;
                            break;
                        default:
                            break;
                    }
                    if (ga.Note == null || ga.Label == '') {
                        if (ga.Note)
                            if (ga.Note.length > 0) {
                                ga.Label = ga.Note;
                            }
                            else {
                                if (protein_id)
                                    if (protein_id.length > 0)
                                        ga.Label = protein_id;
                            }
                    }
                }
                gf.Annotations.push(ga);
            }
        }
        //console.log(gf.Name);
        //console.log(gf.Date);
        return gf;
    };
    return GeneBankFileParser;
}());
exports.GeneBankFileParser = GeneBankFileParser;
//# sourceMappingURL=genefile.js.map