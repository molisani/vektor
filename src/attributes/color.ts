import { Attribute } from "../attribute";
import { Element } from "../element";
import { _lerp } from "../interpolation";

export type InterpolationMode = "rgb" | "hsl-shortest" | "hsl-longest" | "hsl-clockwise" | "hsl-counterclockwise";

abstract class ColorImpl {
  public abstract toString(): string;
  public abstract interpolate(from: ColorImpl, t: number, mode: InterpolationMode): ColorImpl;
}

class RGB extends ColorImpl {
  private r: number = 0;
  private g: number = 0;
  private b: number = 0;
  private a: number = 1;
  constructor(css: string);
  constructor(r: number, g: number, b: number);
  constructor(r: number, g: number, b: number, a: number);
  constructor(x: string | number = 0, y: number = 0, z: number = 0, a: number = 1) {
    super();
    if (typeof x === "string") {
      const rgbaMatch = x.match(/^rgba\s*?\(\s*?(000|0?\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\s*?,\s*?(000|0?\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\s*?,\s*?(000|0?\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\s*?,\s*?(0|0\.\d*|1|1.0*)\s*?\)$/i);
      if (rgbaMatch !== null) {
        this.r = parseInt(rgbaMatch[1], 10);
        this.g = parseInt(rgbaMatch[2], 10);
        this.b = parseInt(rgbaMatch[3], 10);
        this.a = parseFloat(rgbaMatch[4]);
      }
      const rgbMatch = x.match(/^rgb\s*?\(\s*?(000|0?\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\s*?,\s*?(000|0?\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\s*?,\s*?(000|0?\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\s*?\)$/i);
      if (rgbMatch !== null) {
        this.r = parseInt(rgbMatch[1], 10);
        this.g = parseInt(rgbMatch[2], 10);
        this.b = parseInt(rgbMatch[3], 10);
      }
    } else {
      this.r = x;
      this.g = y;
      this.b = z;
      this.a = a;
    }
  }
  public toString(): string {
    return `rgba(${Math.round(this.r)}, ${Math.round(this.g)}, ${Math.round(this.b)}, ${this.a})`;
  }
  public toHSL(): HSL {
    const r = this.r / 255;
    const g = this.g / 255;
    const b = this.b / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const avg = (max + min) / 2;
    const d = max - min;
    let h: number;
    let s: number;
    const l = avg;
    if (d === 0) {
      h = 0;
      s = 0;
    } else {
      s = d / (1 - Math.abs(2 * avg - 1));
      switch (max) {
        case r:
          h = ((g - b) / d) % 6;
          break;
        case g:
          h = ((b - r) / d) + 2;
          break;
        case b:
          h = ((r - g) / d) + 4;
          break;
        default:
          h = 0;
          break;
      }
      h *= 60;
    }
    return new HSL(h, s, l);
  }
  public interpolate(from: ColorImpl, t: number, mode: InterpolationMode): ColorImpl {
    const modePrefix = mode.substr(0, 3);
    if (modePrefix === "rgb") {
      if (from instanceof HSL) {
        from = from.toRGB();
      }
      if (from instanceof RGB) {
        return new RGB(_lerp(from.r, this.r, t), _lerp(from.g, this.g, t), _lerp(from.b, this.b, t), _lerp(from.a, this.a, t));
      }
    } else if (modePrefix === "hsl") {
      return this.toHSL().interpolate(from, t, mode);
    }
    return this;
  }
}

class HSL extends ColorImpl {
  private h: number = 0;
  private s: number = 0;
  private l: number = 0;
  private a: number = 1;
  constructor(css: string);
  constructor(h: number, s: number, l: number);
  constructor(h: number, s: number, l: number, a: number);
  constructor(x: string | number = 0, y: number = 0, z: number = 0, a: number = 1) {
    super();
    if (typeof x === "string") {
      const hslaMatch = x.match(/^hsla\s*?\(\s*?(000|0?\d{1,2}|[1-2]\d\d|3[0-5]\d|360)\s*?,\s*?(0\.?0*|100\.?0*|\d{1,2}|\d{1,2}\.\d+)\%\s*?,\s*?(0\.?0*|100\.?0*|\d{1,2}|\d{1,2}\.\d+)\%\s*?,\s*?(0|0\.\d*|1|1.0*)\s*?\)$/i);
      if (hslaMatch !== null) {
        this.h = parseFloat(hslaMatch[1]);
        this.s = parseFloat(hslaMatch[2]) / 100;
        this.l = parseFloat(hslaMatch[3]) / 100;
        this.a = parseFloat(hslaMatch[4]);
      }
      const hslMatch = x.match(/^hsl\s*?\(\s*?(000|0?\d{1,2}|[1-2]\d\d|3[0-5]\d|360)\s*?,\s*?(0\.?0*|100\.?0*|\d{1,2}|\d{1,2}\.\d+)\%\s*?,\s*?(0\.?0*|100\.?0*|\d{1,2}|\d{1,2}\.\d+)\%\s*?\)$/i);
      if (hslMatch !== null) {
        this.h = parseFloat(hslMatch[1]);
        this.s = parseFloat(hslMatch[2]) / 100;
        this.l = parseFloat(hslMatch[3]) / 100;
      }
    } else {
      this.h = x;
      this.s = y;
      this.l = z;
      this.a = a;
    }
  }
  public toString(): string {
    return `hsla(${this.h % 360}, ${this.s * 100}%, ${this.l * 100}%, ${this.a})`;
  }
  public toRGB(): RGB {
    let r = 0;
    let g = 0;
    let b = 0;
    if (this.s !== 0) {
      const c = (1 - Math.abs(2 * this.l - 1)) * this.s;
      const x = c * (1 - Math.abs((this.h / 60) % 2 - 1));
      if (this.h < 60) {
        r = c;
        g = x;
      } else if (this.h < 120) {
        r = x;
        g = c;
      } else if (this.h < 180) {
        g = c;
        b = x;
      } else if (this.h < 240) {
        g = x;
        b = c;
      } else if (this.h < 180) {
        b = c;
        r = x;
      } else if (this.h < 240) {
        b = x;
        r = c;
      }
      const m = this.l - 0.5 * c;
      r += m;
      g += m;
      b += m;
    }
    return new RGB(r * 255, g * 255, b * 255);
  }
  public interpolate(from: ColorImpl, t: number, mode: InterpolationMode): ColorImpl {
    const modePrefix = mode.substr(0, 3);
    if (modePrefix === "hsl") {
      if (from instanceof RGB) {
        from = from.toHSL();
      }
      if (from instanceof HSL) {
        let h1 = from.h;
        let h2 = this.h;
        const diff = h1 - h2;
        if (Math.abs(diff) > 180) {
          if (mode === "hsl-shortest") {
            if (diff < 0) {
              h1 += 360;
            } else if (diff > 0) {
              h2 += 360;
            }
          }
        } else {
          if (mode === "hsl-longest") {
            if (diff < 0) {
              h1 += 360;
            } else if (diff > 0) {
              h2 += 360;
            }
          }
        }
        if (diff > 0 && mode === "hsl-clockwise") {
          h2 += 360;
        }
        if (diff < 0 && mode === "hsl-counterclockwise") {
          h1 += 360;
        }
        return new HSL(_lerp(h1, h2, t) % 360, _lerp(from.s, this.s, t), _lerp(from.l, this.l, t), _lerp(from.a, this.a, t));
      }
    } else if (modePrefix === "rgb") {
      return this.toRGB().interpolate(from, t, mode);
    }
    return this;
  }
}

export class Color implements Attribute<Color> {
  public static DEFAULT_MODE: InterpolationMode = "rgb";
  public mode: InterpolationMode = Color.DEFAULT_MODE;
  private impl: ColorImpl;
  constructor();
  constructor(css: string);
  constructor(format: "rgb", r: number, g: number, b: number, a?: number);
  constructor(format: "hsl", h: number, s: number, l: number, a?: number);
  constructor(format?: "rgb" | "hsl" | string, x: number = 0, y: number = 0, z: number = 0, a: number = 1) {
    if (format === "rgb") {
      this.impl = new RGB(x, y, z, a);
    } else if (format === "hsl") {
      this.impl = new HSL(x, y, z, a);
    } else if (format !== undefined) {
      if (format.indexOf("rgb") === 0) {
        this.impl = new RGB(format);
      } else if (format.indexOf("hsl") === 0) {
        this.impl = new HSL(format);
      } else if (format.indexOf("#") === 0) {
        let r = 0;
        let g = 0;
        let b = 0;
        let m = format.match(/^#([0-9a-fA-F]{3})$/i);
        if (m !== null) {
          r = parseInt(m[1].charAt(0), 16) * 0x11;
          g = parseInt(m[1].charAt(1), 16) * 0x11;
          b = parseInt(m[1].charAt(2), 16) * 0x11;
        } else {
          m = format.match(/^#([0-9a-fA-F]{6})$/i);
          if (m !== null) {
            r = parseInt(m[1].substr(0, 2), 16);
            g = parseInt(m[1].substr(2, 2), 16);
            b = parseInt(m[1].substr(4, 2), 16);
          }
        }
        this.impl = new RGB(r, g, b);
      }
    }
  }
  public toString(): string {
    return this.impl.toString();
  }
  public parse(css: string | null): Color {
    if (css !== null) {
      return new Color(css);
    } else {
      return new Color();
    }
  }
  public get(element: Element<SVGElement, any, any>, attr: string): Color {
    return this.parse(element.getAttribute(attr));
  }
  public set(element: Element<SVGElement, any, any>, attr: string, override?: Color): void {
    if (override !== undefined) {
      element.setAttribute(attr, override.toString());
    } else {
      element.setAttribute(attr, this.toString());
    }
  }
  public interpolate(from: Color, t: number): Color {
    const c = new Color();
    c.impl = this.impl.interpolate(from.impl, t, this.mode);
    c.mode = this.mode;
    return c;
  }
}
