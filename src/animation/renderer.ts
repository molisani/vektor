
import { animationFrameScheduler, interval, Observable, Subject, Subscription } from "rxjs";
import { bufferWhen, filter, map } from "rxjs/operators";
import { Core_Attributes } from "../attributes/base";
import { Element } from "../element";
import { randomShortStringId } from "../id";
import { EasingFunction } from "./easing";

export interface TimeResolvable {
  resolve?: (t: number) => void;
}

export interface AttributeUpdate<ATTRIBUTES extends Core_Attributes, ATTRIBUTE extends keyof ATTRIBUTES> {
  name: ATTRIBUTE;
  val: ATTRIBUTES[ATTRIBUTE];
}

type AttributeOnlyElement<ATTRIBUTES extends Core_Attributes> = Element<SVGElement, ATTRIBUTES>;

export interface ElementUpdateRender<ATTRIBUTES extends Core_Attributes, ELEMENT extends AttributeOnlyElement<ATTRIBUTES>> extends TimeResolvable {
  el: ELEMENT;
  attribute: AttributeUpdate<ATTRIBUTES, keyof ATTRIBUTES>;
}

export interface AttributeInterpolation<ATTRIBUTES, ATTRIBUTE extends keyof ATTRIBUTES> {
  name: ATTRIBUTE;
  val(t: number): ATTRIBUTES[ATTRIBUTE];
}

export interface ElementInterpolateRender<ATTRIBUTES extends Core_Attributes, ELEMENT extends AttributeOnlyElement<ATTRIBUTES>> extends TimeResolvable {
  el: ELEMENT;
  attributes: AttributeInterpolation<ATTRIBUTES, keyof ATTRIBUTES>[];
  start: number;
  duration: number;
  easing: EasingFunction;
}

export class Renderer {
  public static getInstance(animationFrames?: Observable<number>): Renderer {
    if (!Renderer._instance) {
      Renderer._instance = new Renderer(animationFrames);
    }
    return Renderer._instance;
  }
  private static _instance: Renderer;
  private _attributeUpdates = new Subject<ElementUpdateRender<any, Element<any>>>();
  private _attributeInterpolations: { [key: string]: ElementInterpolateRender<any, Element<any>> } = {};
  private _renderSubscription?: Subscription;
  constructor(private _animationFrames: Observable<number> = interval(0, animationFrameScheduler)) {
    this.startRendering();
  }
  public startRendering() {
    if (!this._renderSubscription || this._renderSubscription.closed) {
      this._renderSubscription = this._attributeUpdates.pipe(bufferWhen(() => this._animationFrames)).subscribe((updates) => this._render(updates));
    }
  }
  public async stopRendering(): Promise<any> {
    const sub = this._renderSubscription;
    if (sub) {
      const done = new Promise((resolve) => sub.add(resolve));
      sub.unsubscribe();
      return done;
    }
  }
  public queueAttributeUpdate<ATTRIBUTES extends Core_Attributes, ELEMENT extends AttributeOnlyElement<ATTRIBUTES>>(el: ELEMENT, attrs: Partial<ATTRIBUTES>): Promise<number>;
  public queueAttributeUpdate<ATTRIBUTES extends Core_Attributes, ATTRIBUTE extends keyof ATTRIBUTES, ELEMENT extends AttributeOnlyElement<ATTRIBUTES>>(el: ELEMENT, attr: ATTRIBUTE, val: ATTRIBUTES[ATTRIBUTE]): Promise<number>;
  public queueAttributeUpdate<ATTRIBUTES extends Core_Attributes, ATTRIBUTE extends keyof ATTRIBUTES, ELEMENT extends AttributeOnlyElement<ATTRIBUTES>>(a1: ELEMENT, a2: ATTRIBUTE | Partial<ATTRIBUTES>, a3?: ATTRIBUTES[ATTRIBUTE]): Promise<number> {
    if (typeof a2 === "string") {
      return new Promise((resolve) => {
        this._attributeUpdates.next({ el: a1, attribute: { name: a2, val: a3 }, resolve });
      });
    } else if (typeof a2 === "object") {
      return Promise.all(Object.keys(a2).map((name) => {
        return new Promise<number>((resolve) => {
          this._attributeUpdates.next({ el: a1, attribute: { name, val: a2[name] }, resolve });
        });
      })).then((renders) => Math.max(...renders));
    }
    throw new Error("No attributes specified for attribute update");
  }
  public registerAttributeInterpolation<ATTRIBUTES extends Core_Attributes, ATTRIBUTE extends keyof ATTRIBUTES, ELEMENT extends AttributeOnlyElement<ATTRIBUTES>>(el: ELEMENT, attr: ATTRIBUTE, val: (t: number) => ATTRIBUTES[ATTRIBUTE], duration: number, easing: EasingFunction): Promise<number> {
    return new Promise((resolve) => {
      const key = randomShortStringId();
      const start = Date.now();
      const attributes = [{ name: attr, val }];
      this._attributeInterpolations[key] = { el, attributes, start, duration, easing, resolve };
    });
  }
  public subscribeAttributeObservable<ATTRIBUTES extends Core_Attributes, ATTRIBUTE extends keyof ATTRIBUTES, ELEMENT extends AttributeOnlyElement<ATTRIBUTES>>(el: ELEMENT, attr: ATTRIBUTE, val: Observable<ATTRIBUTES[ATTRIBUTE]>): Subscription {
    return val.pipe(
      bufferWhen(() => this._animationFrames),
      filter((updates) => updates.length > 0),
      map((updates) => ({ el, attribute: { name: attr, val: updates[updates.length - 1] } })),
    ).subscribe(this._attributeUpdates);
  }
  private _render<ATTRIBUTES extends Core_Attributes>(updates: ElementUpdateRender<ATTRIBUTES, AttributeOnlyElement<ATTRIBUTES>>[]) {
    const now = Date.now();
    const pendingResolutions: ((t: number) => void)[] = [];
    updates.forEach(({ el, attribute, resolve }) => {
      el.renderAttribute(attribute.name, attribute.val);
      if (resolve) {
        pendingResolutions.push(resolve);
      }
    });
    Object.keys(this._attributeInterpolations).forEach((key) => {
      const interpolation = this._attributeInterpolations[key];
      const finalRender = now >= (interpolation.start + interpolation.duration);
      const t = (finalRender) ? 1 : interpolation.easing((now - interpolation.start) / interpolation.duration);
      interpolation.attributes.forEach((attribute) => {
        const val = attribute.val(t);
        interpolation.el.renderAttribute(attribute.name, val);
      });
      if (finalRender) {
        delete this._attributeInterpolations[key];
        if (interpolation.resolve) {
          pendingResolutions.push(interpolation.resolve);
        }
      }
    });
    if (pendingResolutions.length > 0) {
      setImmediate(() => {
        pendingResolutions.forEach((resolve) => resolve(now));
      });
    }
  }
}
