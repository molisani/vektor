import { point } from "../../../attributes";
import { lengthTest } from "../../../attributes/base.spec";
import { pointTest } from "../../../attributes/point.spec";
import { runAttributeTests, runCreateTest } from "../../../util/test-env";
import { ShapeAttributeTests } from "../shape.spec";
import { Circle, Circle_Attributes } from "./circle";

describe("Circle", () => {

  describe(".create()", () => {

    runCreateTest(Circle.create, "circle", [
      ["Point", point(1, 2)],
      ["Length", 3],
    ], {
      cx: "1",
      cy: "2",
      r: "3",
    });

    runCreateTest(Circle.create, "circle", [
      ["Length", 1],
      ["Length", 2],
      ["Length", 3],
    ], {
      cx: "1",
      cy: "2",
      r: "3",
    });

  });

  describe("attributes", () => {

    runAttributeTests<Circle_Attributes>(Circle.new, {
      ...ShapeAttributeTests,
      cx: lengthTest("cx"),
      cy: lengthTest("cy"),
      c: pointTest("c"),
      r: lengthTest("r"),
    });

  });

});