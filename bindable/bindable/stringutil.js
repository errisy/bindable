"use strict";
var SectionDivider = (function () {
    function SectionDivider() {
    }
    SectionDivider.Divide = function (value, pattern) {
        var Sections = [];
        var lastPos = -1;
        pattern.Matches(value).forEach(function (match, index, array) {
            if (lastPos > -1) {
                if (lastPos == 0) {
                    //console.log(value.substr(lastPos, match.index - lastPos));
                    Sections.push(value.substr(lastPos, match.index - lastPos));
                }
                else {
                    //console.log(value.substr(lastPos + 1, match.index - lastPos));
                    Sections.push(value.substr(lastPos + 1, match.index - lastPos));
                }
            }
            lastPos = match.index;
        });
        if (lastPos == 0) {
            Sections.push(value.substr(lastPos));
        }
        else {
            Sections.push(value.substr(lastPos + 1));
        }
        return Sections;
    };
    SectionDivider.SelectSection = function (Sections, pattern) {
        var results = [];
        Sections.forEach(function (value, index, array) {
            //console.log(pattern.test(value) + ' for: ' + value);
            if (pattern.test(value)) {
                results.push(value);
                pattern.lastIndex = 0;
            }
        });
        return results;
    };
    SectionDivider.RemoveQuotation = function (Value) {
        return Value.replace(/^\s*"/g, '').replace(/"\s*$/g, '');
    };
    return SectionDivider;
}());
exports.SectionDivider = SectionDivider;
var RegularExpressionMatch = (function () {
    function RegularExpressionMatch() {
    }
    return RegularExpressionMatch;
}());
exports.RegularExpressionMatch = RegularExpressionMatch;
RegExp.prototype.Matches = function (value) {
    var hit;
    var result = [];
    var that = eval('this');
    while (hit = that.exec(value)) {
        var match = new RegularExpressionMatch();
        match.index = hit.index;
        match.lastIndex = that.lastIndex;
        match.length = match.lastIndex - match.index;
        match.groups = hit;
        //console.log('from ' + match.index.toString() + ' to ' + match.lastIndex.toString());
        result.push(match);
    }
    that.lastIndex = 0;
    return result;
};
RegExp.prototype.Match = function (value) {
    var hit;
    var result = null;
    var that = eval('this');
    that.lastIndex = 0;
    if (hit = that.exec(value)) {
        result = new RegularExpressionMatch();
        result.index = hit.index;
        result.lastIndex = that.lastIndex;
        result.length = result.lastIndex - result.index;
        result.groups = hit;
    }
    return result;
};
//# sourceMappingURL=stringutil.js.map