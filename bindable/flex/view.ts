export interface IView {
    element?: ViewElement;
    display?: Display;
    /**indicates how this item aligns when it is in a flex container;*/
    alignSelf?: FlexAlignSelf;
    /**indicates the base size of a flex item when remaining space has not been distributed; auto, 1px, 2em, etc; flex-basis*/
    baseSize?: string;
    /**the contents in this view*/
    content?: IView[];
    /**indicates how this flex item can shrink when space is not enough; the default value is 1; flex-shrink*/
    sizeShrink?: number;
    /**indicates how this flex item can grow when space is not enough; the default value is 1; flex-grow*/
    sizeGrow?: number;
    /**inducates the order of this flex item in its flex container; order*/
    order?: number;
}
interface a {
    text?: string;
    clickEvent?: string;
    mouseoverEvent?: string;    
}
interface span {
    text?: string;
}
export interface IContainer extends IView {
    /**indicates this is a row container or a column container;*/
    itemsDirection?: FlexDirection;
    /**indicates the wrap method of this flex container;*/
    itemsWrap?: FlexWrap;
    /**indicates how items justify in each line of this flex container in the direction of item flow;*/
    itemsJustify?: FlexItemsJustify;
    /**indicates how lines of this flex container justify in the direction of line flow;*/
    linesJustify?: FlexLinesJustify;
    /**indicates how items align in each line of this container in the direction of line flow;*/
    itemsAlign?: FlexItemsAlign;
}
export enum ViewElement {
    div,
    span,
    p,
    a,
    ul,
    li,
    table,
    thead,
    tbody,
    tr,
    td
}
export enum Display {
    /**Default value. Displays an element as an inline element (like <span>)*/
    inline,
    /**Displays an element as a block element (like <p>)*/
    block,
    /**Displays an element as an block-level flex container. New in CSS3*/
    flex
}
export enum FlexAlignSelf {
    auto,
    start,
    end,
    center,
    baseline,
    stretch
}
export enum FlexItemsAlign {
    start,
    end,
    center,
    baseline,
    stretch
}
export enum FlexDirection {
    row,
    rowReverse,
    column,
    columnReverse
}
export enum FlexWrap {
    none,
    wrap,
    wrapReverse
}
export enum FlexItemsJustify {
    start,
    end,
    center,
    spaceBetween,
    spaceAround
}
export enum FlexLinesJustify {
    start,
    end,
    center,
    spaceBetween,
    spaceAround,
    stretch
}
export class View {
    static build(container: IContainer) {
        let builder: string[] = [];
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
    }
    static parseDisplay(view: IView, builder: string[]) {
        builder.push('display:');

    }
    static parseFlexAlignSelf(view: IView, builder: string[]) {
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
    }
    static parseFlexDirection(container: IContainer, builder: string[]) {
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
    }
    static parseFlexWrap(container: IContainer, builder: string[]) {
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
    }
    static parseFlexItemsJustify(container: IContainer, builder: string[]) {
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
    }
    static parseFlexLinesJustify(container: IContainer, builder: string[]) {
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
    }
    static parseFlexItemsAlign(container: IContainer, builder: string[]) {
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
    }
    static test() {
        View.build({ itemsDirection: FlexDirection.row });

    }
}