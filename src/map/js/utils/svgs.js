import React from 'react';

export function createSvg (svgId) {
  let __html = `<use xlink:href='#${svgId}' />`;
  return <svg dangerouslySetInnerHTML={{ __html }}></svg>
}

export function AlertsSvg () { return createSvg('icon-alerts'); };
export function AnalysisSvg () { return createSvg('icon-analysis'); };
export function BasemapSvg () { return createSvg('icon-basemap'); };
export function CalendarSvg () { return createSvg('icon-calendar'); };
