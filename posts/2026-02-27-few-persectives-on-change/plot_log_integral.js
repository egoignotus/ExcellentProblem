function initLogIntegralPlot() {
  var tMax = 20;
  createIntegralPlot({
    idPrefix:       'Log',
    tMin:           1,
    tMax:           tMax,
    f:              function(t) { return Math.log(t); },
    F:              function(t) { return t * Math.log(t) - t; },
    title:          'f(t) = ln(t)',
    integralLabel:  '∫ₐᵇ ln(τ) dτ',
    yRange:         [0, Math.log(tMax) + 0.3],
    dtick:          2,
    hoverFmt:       ':.2f',
    defaultLower:   1,
    defaultUpper:   10
  });
}
