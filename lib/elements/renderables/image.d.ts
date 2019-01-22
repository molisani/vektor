import { HasOverflow, Inherit, Length } from "../../attributes/base";
import { Box } from "../../attributes/box";
import { Point } from "../../attributes/point";
import { PreserveAspectRatio } from "../../attributes/preserve-aspect-ratio";
import { Context } from "../../context";
import { AbstractRenderable, Graphics_Attributes, Renderable_Events } from "../renderable";
export interface Image_Attributes extends Graphics_Attributes, HasOverflow {
    x: Length;
    y: Length;
    "x:y": Point;
    width: Length;
    height: Length;
    "width:height": Point;
    "x:y:width:height": Box;
    href: string;
    preserveAspectRatio?: PreserveAspectRatio;
    viewBox?: Box;
    "color-profile": "auto" | "sRGB" | string | Inherit;
    "image-rendering": "auto" | "optimizeSpeed" | "optimizeQuality" | Inherit;
}
export interface Image_Events extends Renderable_Events {
    load: ProgressEvent;
}
export declare class Image extends AbstractRenderable<SVGImageElement, Image_Attributes, Image_Events> {
    static afterLoad(context: Context, href: string, attrs?: Partial<Image_Attributes>): Promise<Image>;
    constructor(context: Context, attrs?: Partial<Image_Attributes>);
}
