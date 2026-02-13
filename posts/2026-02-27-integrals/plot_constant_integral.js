function initConstantIntegralPlot() {
  var C = 5, tMax = 10;
  createIntegralPlot({
    idPrefix:       'Constant',
    tMin:           0,
    tMax:           tMax,
    f:              function(t) { return C; },
    F:              function(t) { return C * t; },
    title:          'f(t) = 5',
    integralLabel:  '∫ₐᵇ 5 dτ',
    yRange:         [0, tMax],
    dtick:          2,
    hoverFmt:       ':.1f',
    defaultLower:   0,
    defaultUpper:   5
  });
}
