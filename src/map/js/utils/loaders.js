
import Deferred from 'dojo/Deferred';

const loaders = {

  loadCSS: url => {
    let sheet = document.createElement('link');
    sheet.rel = 'stylesheet';
    sheet.type = 'text/css';
    sheet.href = url;
    requestAnimationFrame(function () { document.getElementsByTagName('head')[0].appendChild(sheet); });
  },

  loadJS: (url, async) => {

    let deferred = new Deferred();

    let script = document.createElement('script');
    script.src = url;
    script.async = async || false;
    script.onload = deferred.resolve();
    script.onerror = deferred.reject();
    requestAnimationFrame(function () { document.getElementsByTagName('head')[0].appendChild(script); });

    // let promise = new Promise((resolve, reject) => {
    //   let script = document.createElement('script');
    //   script.src = url;
    //   script.async = async || false;
    //   script.onload = resolve;
    //   script.onerror = reject;
    //   requestAnimationFrame(function () { document.getElementsByTagName('head')[0].appendChild(script); });
    // });
    return deferred;
  }

};

export const loadCSS = loaders.loadCSS;
export const loadJS = loaders.loadJS;
