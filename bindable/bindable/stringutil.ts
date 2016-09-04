export class SectionDivider {
    static Divide(value: string, pattern: RegExp): string[] {
        var Sections: string[] = [];
        var lastPos: number = -1;
        pattern.Matches(value).forEach((match: RegularExpressionMatch, index: number, array: RegularExpressionMatch[]) => {
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
    }
    static SelectSection(Sections: string[], pattern: RegExp): string[] {
        var results: string[] = [];
        Sections.forEach((value: string, index: number, array: string[]) => {
            //console.log(pattern.test(value) + ' for: ' + value);
            if (pattern.test(value)) {
                results.push(value);
                pattern.lastIndex = 0;
            }
        });
        return results;
    }
    static RemoveQuotation(Value: string): string {
        return Value.replace(/^\s*"/g, '').replace(/"\s*$/g, '');
    }
}

export class RegularExpressionMatch {
    public index: number;
    public length: number;
    public lastIndex: number;
    public groups: RegExpMatchArray;
}

declare global {
    interface RegExp {
        Matches(value: string): RegularExpressionMatch[];
        Match(value: string): RegularExpressionMatch;
    }
}

RegExp.prototype.Matches = (value: string): RegularExpressionMatch[] => {
    var hit: RegExpExecArray;
    var result: RegularExpressionMatch[] = [];
    var that = <RegExp>eval('this');

    while (hit = that.exec(value)) {
        var match: RegularExpressionMatch = new RegularExpressionMatch();
        match.index = hit.index;
        match.lastIndex = that.lastIndex;
        match.length = match.lastIndex - match.index;
        match.groups = hit;
        //console.log('from ' + match.index.toString() + ' to ' + match.lastIndex.toString());
        result.push(match);
    }
    that.lastIndex = 0;
    return result;
}
RegExp.prototype.Match = (value: string): RegularExpressionMatch => {
    var hit: RegExpMatchArray;
    var result: RegularExpressionMatch = null;
    var that = <RegExp>eval('this');
    that.lastIndex = 0;
    if (hit = that.exec(value)) {
        result = new RegularExpressionMatch();
        result.index = hit.index;
        result.lastIndex = that.lastIndex;
        result.length = result.lastIndex - result.index;
        result.groups = hit;
    }
    return result;
}