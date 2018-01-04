namespace SavageDOM.Elements.Renderables {

  export interface Image_Attributes extends Graphics_Attributes, Attributes.HasOverflow {
    x: Attributes.Length;
    y: Attributes.Length;
    "x:y": Attributes.Point;
    width: Attributes.Length;
    height: Attributes.Length;
    "width:height": Attributes.Point;
    "x:y:width:height": Attributes.Box;
    href: string;
    preserveAspectRatio?: Attributes.PreserveAspectRatio;
    viewBox?: Attributes.Box;
    "color-profile": "auto" | "sRGB" | string | Attributes.Inherit;
    "image-rendering": "auto" | "optimizeSpeed" | "optimizeQuality" | Attributes.Inherit;
  }

  export interface Image_Events extends BaseEvents {
    load: ProgressEvent;
  }

  export class Image extends AbstractRenderable<SVGImageElement, Image_Attributes, Image_Events> {
    constructor(context: Context, attrs?: Partial<Renderable_Attributes & Image_Attributes>) {
      super(context, "image", attrs);
    }
  }

}

namespace SavageDOM {

  export interface Context {
    image(href: string): Promise<Elements.Renderables.Image>;
  }

  Context.prototype.image = function(this: Context, href: string): Promise<Elements.Renderables.Image> {
    const img = new Elements.Renderables.Image(this);
    const promise = img.getEvent("load").take(1).toPromise();
    img.setAttribute("href", href);
    this.addChild(img);
    return promise.then(() => img);
  };

}