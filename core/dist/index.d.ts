declare type Shift = {
    data: Int8Array;
    get(x: number, y: number): number;
    set(x: number, y: number, value: number): void;
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
export declare const getShift: (previous: ImageData, current: ImageData) => Shift;
export declare const approximate: (previous: ImageData, shift: Shift) => ImageData;
export declare const elementEvent: (element: HTMLElement, eventName: string) => Promise<unknown>;
export declare const getDimensions: (segments: Segment[]) => Promise<{
    width: number;
    height: number;
}>;
export declare const prepareGlideSegment: (segment: GlideSegment, renderRoot: HTMLElement) => Promise<PreparedGlideSegment>;
export declare const prepareMovementSegment: (segment: MovementSegment, renderRoot: HTMLElement, onProgress?: (progress: number) => void) => Promise<PreparedMovementSegment>;
export declare const runCopySegment: (segment: PreparedCopySegment, ctx: CanvasRenderingContext2D, renderRoot: HTMLElement, onProgress?: (progress: number) => void) => Promise<void>;
export declare const runGlideSegment: (segment: PreparedGlideSegment, ctx: CanvasRenderingContext2D, onProgress?: (progress: number) => void) => Promise<void>;
export declare const runMovementSegment: (segment: PreparedMovementSegment, ctx: CanvasRenderingContext2D, onProgress?: (progress: number) => void) => Promise<void>;
export {};
