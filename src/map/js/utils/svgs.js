import React from 'react';

export function createSvgById (svgId) {
  let __html = `<use xlink:href='#${svgId}' />`;
  return <svg dangerouslySetInnerHTML={{ __html }}></svg>;
}

export const AlertsSvg = () => createSvgById('icon-analysis-draw');
export const AnalysisSvg = () => createSvgById('icon-analysis');
export const DrawSvg = () => createSvgById('icon-analysis-draw');
export const ImagerySvg = () => createSvgById('icon-tab-highresolution');
export const TimelineSvg = () => createSvgById('icon-timeline');
export const BasemapSvg = () => createSvgById('icon-basemap');
export const CalendarSvg = () => createSvgById('icon-calendar');
export const ViewFinderSvg = () => createSvgById('shape-crosshairs');
