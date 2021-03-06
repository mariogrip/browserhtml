/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {html, thunk, forward, Effects} from 'reflex';
import * as Style from '../../common/style';
import * as Toggle from "../../common/toggle";
import * as Button from "../../common/button";
import {merge} from "../../common/prelude";
import {cursor} from "../../common/cursor";
import * as Unknown from "../../common/unknown";

/*::
import type {Address, DOM} from "reflex"
import type {Context, Model, Action} from "./toolbar"
*/

export const Attach/*:Action*/ =
  { type: "Attach"
  };

export const Detach/*:Action*/ =
  { type: "Detach"
  };

export const CreateWebView/*:Action*/ =
  { type: "CreateWebView"
  };

const ToggleAction = action =>
  ( action.type === "Check"
  ? Attach
  : action.type === "Uncheck"
  ? Detach
  : {type: "Toggle", action}
  );

const CloseButtonAction = action =>
  ( action.type === "Press"
  ? CreateWebView
  : { type: "CloseButton"
    , source: action
    }
  );

const updateToggle = cursor({
  get: model => model.pin,
  set: (model, pin) => merge(model, {pin}),
  tag: ToggleAction,
  update: Toggle.update
});

const updateCloseButton = cursor({
  get: model => model.close,
  set: (model, close) => merge(model, {close}),
  tag: CloseButtonAction,
  update: Button.update
})

export const init = ()/*:[Model, Effects<Action>]*/ => {
  const [pin, pinFX] = Toggle.init();
  const [close, closeFX] = Button.init(false, false, false, false, '');
  return [
    {pin, close},
    Effects.batch
    ( [ pinFX.map(ToggleAction)
      , closeFX.map(CloseButtonAction)
      ]
    )

  ]
}

export const update =
  (model/*:Model*/, action/*:Action*/)/*:[Model, Effects<Action>]*/ =>
  ( action.type === "Attach"
  ? updateToggle(model, Toggle.Check)
  : action.type === "Detach"
  ? updateToggle(model, Toggle.Uncheck)

  : action.type === "Toggle"
  ? updateToggle(model, action.action)
  : action.type === "CloseButton"
  ? updateCloseButton(model, action.source)

  : Unknown.update(model, action)
  );

export const height = '48px';

export const styleSheet = Style.createSheet({
  base: {
    left: '0',
    height,
    position: 'absolute',
    bottom: '0',
    width: '100%'
  },
  invisible: {
    opacity: 0,
    pointerEvents: 'none'
  }
});

const viewPin = Toggle.view('pin-button', Style.createSheet({
  base: {
    cursor: 'pointer',
    height: '32px',
    width: '32px',
    margin: '8px',
    borderRadius: '5px',
    backgroundRepeat: 'no-repeat',
    backgroundColor: 'transparent',
    backgroundPosition: 'center',
    backgroundImage: 'url(css/pin.png)',
    backgroundSize:
        window.devicePixelRatio == null
      ? '24px 36px'
      : `${24 / window.devicePixelRatio}px ${36 / window.devicePixelRatio}px`
  },
  checked: {
    backgroundColor: '#3D91F2'
  }
}));

const viewClose = Button.view('create-tab-button', Style.createSheet({
  base:
  { MozWindowDragging: 'no-drag'
  , WebkitAppRegion: 'no-drag'
  , color: 'rgb(255,255,255)'
  , fontFamily: 'FontAwesome'
  , fontSize: '18px'
  , lineHeight: '32px'
  , position: 'absolute'
  , textAlign: 'center'
  , bottom: '8px'
  , right: '8px'
  , width: '32px'
  , height: '32px'
  , background: 'transparent'
  }
}));

export const view =
  (model/*:Model*/, address/*:Address<Action>*/, display/*:Context*/)/*:DOM*/ =>
  html.div({
    key: 'sidebar-toolbar',
    className: 'sidebar-toolbar',
    style:
    Style.mix
    ( styleSheet.base
    , ( display.toolbarOpacity === 0
      ? styleSheet.invisible
      : { opacity: display.toolbarOpacity }
      )
    )
  }, [
    thunk('pin', viewPin, model.pin, forward(address, ToggleAction)),
    thunk('close', viewClose, model.close, forward(address, CloseButtonAction))
  ]);
