function initConstantIntegralPlot() {
  var C = 8, tMax = 20;
  createIntegralPlot({
    idPrefix:       'Constant',
    tMin:           0,
    tMax:           tMax,
    f:              function(t) { return C; },
    F:              function(t) { return C * t; },
    title:          'f(t) = 8',
    integralLabel:  '∫ₐᵇ 8 dτ',
    yRange:         [0, C + 2],
    dtick:          2,
    hoverFmt:       ':.1f',
    defaultLower:   0,
    defaultUpper:   10
  });
}
