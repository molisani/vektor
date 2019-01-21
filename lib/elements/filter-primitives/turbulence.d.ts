import { NumberOptionalNumber } from "../../attributes/number-optional-number";
import { Filter } from "../filter";
import { FilterPrimitive, FilterPrimitive_Attributes } from "../filter-primitive";
export interface Turbulence_Attributes extends FilterPrimitive_Attributes {
    type: "fractalNoise" | "turbulence";
    baseFrequency: NumberOptionalNumber;
    numOctaves: number;
    seed: number;
    stitchTiles: "noStitch" | "stitch";
}
export declare class Turbulence_Primitive extends FilterPrimitive<SVGFETurbulenceElement, Turbulence_Attributes> {
    constructor(filter: Filter, attrs?: Partial<Turbulence_Attributes>);
}