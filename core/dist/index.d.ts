declare type Shift = {
    [xOffset: number]: {
        [yOffset: number]: {
            x: number;
            y: number;
        };
    };
};
declare type BaseSegment = {
    src: string;
};
export declare type CopySegment = BaseSegment & {
    transform: 'copy';
    start: number;
    end: number;
};
declare type PreparedCopySegment = CopySegment & {};
export declare type GlideSegment = BaseSegment & {
    transform: 'glide';
    time: number;
    length: number;
};
declare type PreparedGlideSegment = GlideSegment & {
    shift: Shift;
};
export declare type MovementSegment = BaseSegment & {
    transform: 'movement';
    start: number;
    end: number;
};
declare type PreparedMovementSegment = MovementSegment & {
    shifts: Shift[];
};
export declare type Segment = CopySegment | GlideSegment | MovementSegment;
export declare type PreparedSegment = PreparedCopySegment | PreparedGlideSegment | PreparedMovementSegment;
export declare const elementEvent: (element: HTMLElement, eventName: string) => Promise<unknown>;
export declare const getDimensions: (segments: Segment[]) => Promise<{
    width: number;
    height: number;
}>;
export declare const prepareGlideSegment: (segment: GlideSegment, renderRoot: HTMLElement) => Promise<PreparedGlideSegment>;
export declare const prepareMovementSegment: (segment: MovementSegment, renderRoot: HTMLElement) => Promise<PreparedMovementSegment>;
export declare const runCopySegment: (segment: PreparedCopySegment, ctx: CanvasRenderingContext2D, renderRoot: HTMLElement) => Promise<void>;
export declare const runGlideSegment: (segment: PreparedGlideSegment, ctx: CanvasRenderingContext2D) => Promise<void>;
export declare const runMovementSegment: (segment: PreparedMovementSegment, ctx: CanvasRenderingContext2D) => Promise<void>;
export {};
