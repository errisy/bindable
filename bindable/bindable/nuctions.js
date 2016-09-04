"use strict";
var eventservice_1 = require('./eventservice');
var Nuctions = (function () {
    function Nuctions() {
    }
    Nuctions.TAGCFilter = function (value) {
        if (value == null)
            return '';
        var i;
        var result = [];
        for (i = 0; i < value.length; i++) {
            if (this.RegA.test(value[i])) {
                result.push(this.ChrA);
            }
            if (this.RegT.test(value[i])) {
                result.push(this.ChrT);
            }
            if (this.RegG.test(value[i])) {
                result.push(this.ChrG);
            }
            if (this.RegC.test(value[i])) {
                result.push(this.ChrC);
            }
            if (this.RegY.test(value[i])) {
                result.push(this.ChrY);
            }
            if (this.RegR.test(value[i])) {
                result.push(this.ChrR);
            }
            if (this.RegM.test(value[i])) {
                result.push(this.ChrM);
            }
            if (this.RegK.test(value[i])) {
                result.push(this.ChrK);
            }
            if (this.RegW.test(value[i])) {
                result.push(this.ChrW);
            }
            if (this.RegS.test(value[i])) {
                result.push(this.ChrS);
            }
            if (this.RegD.test(value[i])) {
                result.push(this.ChrD);
            }
            if (this.RegH.test(value[i])) {
                result.push(this.ChrH);
            }
            if (this.RegB.test(value[i])) {
                result.push(this.ChrB);
            }
            if (this.RegV.test(value[i])) {
                result.push(this.ChrV);
            }
            if (this.RegN.test(value[i])) {
                result.push(this.ChrN);
            }
        }
        return result.join(this.empty);
    };
    Nuctions.ReverseComplementN = function (value) {
        if (value == null)
            return '';
        var i;
        var result = [];
        for (i = 0; i < value.length; i++) {
            if (this.RegA.test(value[i])) {
                result.push(this.ChrT);
            }
            if (this.RegT.test(value[i])) {
                result.push(this.ChrA);
            }
            if (this.RegG.test(value[i])) {
                result.push(this.ChrC);
            }
            if (this.RegC.test(value[i])) {
                result.push(this.ChrG);
            }
            if (this.RegY.test(value[i])) {
                result.push(this.ChrR);
            }
            if (this.RegR.test(value[i])) {
                result.push(this.ChrY);
            }
            if (this.RegM.test(value[i])) {
                result.push(this.ChrK);
            }
            if (this.RegK.test(value[i])) {
                result.push(this.ChrM);
            }
            if (this.RegW.test(value[i])) {
                result.push(this.ChrW);
            }
            if (this.RegS.test(value[i])) {
                result.push(this.ChrS);
            }
            if (this.RegD.test(value[i])) {
                result.push(this.ChrH);
            }
            if (this.RegH.test(value[i])) {
                result.push(this.ChrD);
            }
            if (this.RegB.test(value[i])) {
                result.push(this.ChrV);
            }
            if (this.RegV.test(value[i])) {
                result.push(this.ChrB);
            }
            if (this.RegN.test(value[i])) {
                result.push(this.ChrN);
            }
        }
        return result.join(this.empty);
    };
    Nuctions.empty = '';
    Nuctions.RegA = /a/i;
    Nuctions.RegT = /t/i;
    Nuctions.RegG = /g/i;
    Nuctions.RegC = /c/i;
    Nuctions.RegY = /y/i;
    Nuctions.RegR = /r/i;
    Nuctions.RegM = /m/i;
    Nuctions.RegK = /k/i;
    Nuctions.RegW = /w/i;
    Nuctions.RegS = /s/i;
    Nuctions.RegD = /d/i;
    Nuctions.RegH = /h/i;
    Nuctions.RegB = /b/i;
    Nuctions.RegV = /v/i;
    Nuctions.RegN = /n/i;
    Nuctions.ChrA = 'A';
    Nuctions.ChrT = 'T';
    Nuctions.ChrG = 'G';
    Nuctions.ChrC = 'C';
    Nuctions.ChrY = 'Y'; //CT rc->R
    Nuctions.ChrR = 'R'; //GA rc->Y
    Nuctions.ChrM = 'M'; //AC rc->K
    Nuctions.ChrK = 'K'; //TG rc->M
    Nuctions.ChrW = 'W'; //TA rc->W
    Nuctions.ChrS = 'S'; //GC rc->S
    Nuctions.ChrD = 'D'; //AGT
    Nuctions.ChrH = 'H'; //ACT
    Nuctions.ChrB = 'B'; //CGT
    Nuctions.ChrV = 'V'; //ACG
    Nuctions.ChrN = 'N'; //ATGC
    return Nuctions;
}());
exports.Nuctions = Nuctions;
var RestrictionEnzyme = (function () {
    function RestrictionEnzyme(Name, Sequence, SCut, ACut, ReEx, Palindromic) {
        this.Name = Name;
        this.Sequence = Sequence;
        this.SCut = SCut;
        this.ACut = ACut;
        this.ReEx = ReEx;
        this.Palindromic = Palindromic;
    }
    return RestrictionEnzyme;
}());
exports.RestrictionEnzyme = RestrictionEnzyme;
var RecombinationSite = (function () {
    function RecombinationSite(Name, Sequence, SCut, ACut, ReEx, 
        /** type of recombiation: attB, attP, attL, attR, self */
        Type) {
        this.Name = Name;
        this.Sequence = Sequence;
        this.SCut = SCut;
        this.ACut = ACut;
        this.ReEx = ReEx;
        this.Type = Type;
    }
    return RecombinationSite;
}());
exports.RecombinationSite = RecombinationSite;
var RecombinationSiteGroup = (function () {
    function RecombinationSiteGroup(Name, Sites) {
        this.Name = Name;
        this.Sites = Sites;
    }
    ;
    return RecombinationSiteGroup;
}());
exports.RecombinationSiteGroup = RecombinationSiteGroup;
var FeatureAnalysis = (function () {
    function FeatureAnalysis() {
    }
    /**
     * Use restriction enzymes to analyze a given DNA sequence and produce annotations;
     * @param sequence
     * @param isCircular
     * @param enzymes
     */
    FeatureAnalysis.AnnotateRestrictionEnzymes = function (sequence, isCircular, enzymes) {
        var length = sequence.length;
        var reverse = Nuctions.ReverseComplementN(sequence);
        var annotations = [];
        if (isCircular) {
            var forward2 = sequence + sequence;
            var reverse2 = reverse + reverse;
            for (var i = 0; i < enzymes.length; i++) {
                var enzyme = enzymes[i];
                var matchArr = void 0;
                //forward;
                enzyme.ReEx.lastIndex = -1;
                while ((matchArr = enzyme.ReEx.exec(forward2)) && enzyme.ReEx.lastIndex < length) {
                    var anno = new RestrictionEnzymeAnnotation();
                    anno.Start = matchArr.index + 1;
                    anno.End = matchArr.index + enzyme.Sequence.length;
                    if (anno.End > length)
                        anno.End -= length;
                    annotations.push(anno);
                }
                if (enzyme.Palindromic)
                    continue;
                //reverse;
                enzyme.ReEx.lastIndex = -1;
                while ((matchArr = enzyme.ReEx.exec(reverse2)) && enzyme.ReEx.lastIndex < length) {
                    var anno = new RestrictionEnzymeAnnotation();
                    anno.Start = length - matchArr.index;
                    anno.End = length - matchArr.index + enzyme.Sequence.length;
                    if (anno.End > length)
                        anno.End -= length;
                    annotations.push(anno);
                }
            }
        }
        else {
            for (var i = 0; i < enzymes.length; i++) {
                var enzyme = enzymes[i];
                var matchArr = void 0;
                //forward;
                enzyme.ReEx.lastIndex = -1;
                while (matchArr = enzyme.ReEx.exec(sequence)) {
                    var anno = new RestrictionEnzymeAnnotation();
                    anno.Start = matchArr.index + 1;
                    anno.End = matchArr.index + enzyme.Sequence.length;
                    if (anno.End > length)
                        anno.End -= length;
                    annotations.push(anno);
                }
                //reverse;
                enzyme.ReEx.lastIndex = -1;
                while (matchArr = enzyme.ReEx.exec(reverse)) {
                    var anno = new RestrictionEnzymeAnnotation();
                    anno.Start = length - matchArr.index;
                    anno.End = length - matchArr.index + enzyme.Sequence.length;
                    if (anno.End > length)
                        anno.End -= length;
                    annotations.push(anno);
                }
            }
        }
        return annotations;
    };
    FeatureAnalysis.AnnotateRecombinationSite = function (sequence, isCircular, sites) {
        var length = sequence.length;
        var reverse = Nuctions.ReverseComplementN(sequence);
        var annotations = [];
        if (isCircular) {
            var forward2 = sequence + sequence;
            var reverse2 = reverse + reverse;
            for (var i = 0; i < sites.length; i++) {
                var enzyme = sites[i];
                var matchArr = void 0;
                //forward;
                enzyme.ReEx.lastIndex = -1;
                while ((matchArr = enzyme.ReEx.exec(forward2)) && enzyme.ReEx.lastIndex < length) {
                    var anno = new RecombinatinionSiteAnnotation();
                    anno.Start = matchArr.index + 1;
                    anno.End = matchArr.index + enzyme.Sequence.length;
                    if (anno.End > length)
                        anno.End -= length;
                    annotations.push(anno);
                }
                //reverse;
                enzyme.ReEx.lastIndex = -1;
                while ((matchArr = enzyme.ReEx.exec(reverse2)) && enzyme.ReEx.lastIndex < length) {
                    var anno = new RecombinatinionSiteAnnotation();
                    anno.Start = length - matchArr.index;
                    anno.End = length - matchArr.index + enzyme.Sequence.length;
                    if (anno.End > length)
                        anno.End -= length;
                    annotations.push(anno);
                }
            }
        }
        else {
            for (var i = 0; i < sites.length; i++) {
                var enzyme = sites[i];
                var matchArr = void 0;
                //forward;
                enzyme.ReEx.lastIndex = -1;
                while (matchArr = enzyme.ReEx.exec(sequence)) {
                    var anno = new RecombinatinionSiteAnnotation();
                    anno.Start = matchArr.index + 1;
                    anno.End = matchArr.index + enzyme.Sequence.length;
                    if (anno.End > length)
                        anno.End -= length;
                    annotations.push(anno);
                }
                //reverse;
                enzyme.ReEx.lastIndex = -1;
                while (matchArr = enzyme.ReEx.exec(reverse)) {
                    var anno = new RecombinatinionSiteAnnotation();
                    anno.Start = length - matchArr.index;
                    anno.End = length - matchArr.index + enzyme.Sequence.length;
                    if (anno.End > length)
                        anno.End -= length;
                    annotations.push(anno);
                }
            }
        }
        return annotations;
    };
    return FeatureAnalysis;
}());
exports.FeatureAnalysis = FeatureAnalysis;
var RestrictionEnzymeAnnotation = (function () {
    function RestrictionEnzymeAnnotation() {
        this.SelectionEvents = new eventservice_1.EventService({ selected: 'selected' });
    }
    return RestrictionEnzymeAnnotation;
}());
exports.RestrictionEnzymeAnnotation = RestrictionEnzymeAnnotation;
var RecombinatinionSiteAnnotation = (function () {
    function RecombinatinionSiteAnnotation() {
        this.SelectionEvents = new eventservice_1.EventService({ selected: 'selected' });
    }
    return RecombinatinionSiteAnnotation;
}());
exports.RecombinatinionSiteAnnotation = RecombinatinionSiteAnnotation;
//# sourceMappingURL=nuctions.js.map