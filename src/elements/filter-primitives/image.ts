import { PreserveAspectRatio } from "../../attributes/preserve-aspect-ratio";
import { Filter, FilterInput } from "../filter";
import { FilterPrimitive } from "../filter-primitive";

export interface Image_Attributes {
  preserveAspectRatio: PreserveAspectRatio;
  "xlink:href": string;
}

export class Image_Primitive extends FilterPrimitive<SVGFEImageElement, Image_Attributes> {
  constructor(filter: Filter, attrs?: Partial<Image_Attributes>) {
    super(filter, "feImage", attrs);
  }
}
