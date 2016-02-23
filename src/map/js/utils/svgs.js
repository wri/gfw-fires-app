import React from 'react';

export function createSvgById (svgId) {
  let __html = `<use xlink:href='#${svgId}' />`;
  return <svg dangerouslySetInnerHTML={{ __html }}></svg>;
}

export const AlertsSvg = () => createSvgById('icon-alerts');
export const AnalysisSvg = () => createSvgById('icon-analysis');
export const ImagerySvg = () => createSvgById('icon-imagery');
export const BasemapSvg = () => createSvgById('icon-basemap');
export const CalendarSvg = () => createSvgById('icon-calendar');
