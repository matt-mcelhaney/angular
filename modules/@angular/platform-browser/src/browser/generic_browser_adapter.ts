/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DomAdapter} from '../dom/dom_adapter';
import {isPresent} from '../facade/lang';



/**
 * Provides DOM operations in any browser environment.
 *
 * @security Tread carefully! Interacting with the DOM directly is dangerous and
 * can introduce XSS risks.
 */
export abstract class GenericBrowserDomAdapter extends DomAdapter {
  private _animationPrefix: string = null;
  private _transitionEnd: string = null;
  constructor() {
    super();
    try {
      const element = this.createElement('div', this.defaultDoc());
      if (isPresent(this.getStyle(element, 'animationName'))) {
        this._animationPrefix = '';
      } else {
        const domPrefixes = ['Webkit', 'Moz', 'O', 'ms'];

        for (let i = 0; i < domPrefixes.length; i++) {
          if (isPresent(this.getStyle(element, domPrefixes[i] + 'AnimationName'))) {
            this._animationPrefix = '-' + domPrefixes[i].toLowerCase() + '-';
            break;
          }
        }
      }

      const transEndEventNames: {[key: string]: string} = {
        WebkitTransition: 'webkitTransitionEnd',
        MozTransition: 'transitionend',
        OTransition: 'oTransitionEnd otransitionend',
        transition: 'transitionend'
      };

      Object.keys(transEndEventNames).forEach((key: string) => {
        if (isPresent(this.getStyle(element, key))) {
          this._transitionEnd = transEndEventNames[key];
        }
      });
    } catch (e) {
      this._animationPrefix = null;
      this._transitionEnd = null;
    }
  }

  getDistributedNodes(el: HTMLElement): Node[] { return (<any>el).getDistributedNodes(); }
  resolveAndSetHref(el: HTMLAnchorElement, baseUrl: string, href: string) {
    el.href = href == null ? baseUrl : baseUrl + '/../' + href;
  }
  supportsDOMEvents(): boolean { return true; }
  supportsNativeShadowDOM(): boolean {
    return typeof(<any>this.defaultDoc().body).createShadowRoot === 'function';
  }
  getAnimationPrefix(): string { return this._animationPrefix ? this._animationPrefix : ''; }
  getTransitionEnd(): string { return this._transitionEnd ? this._transitionEnd : ''; }
  supportsAnimation(): boolean {
    return isPresent(this._animationPrefix) && isPresent(this._transitionEnd);
  }
}
