/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {html, thunk, forward, Effects} from 'reflex';
import {merge, setIn} from '../../common/prelude';
import {cursor} from '../../common/cursor';
import * as Style from '../../common/style';
import * as Toolbar from './toolbar';
import * as Tab from './tab';
import * as Unknown from '../../common/unknown';

/*::
import type {Address, DOM} from "reflex"
import type {ID, Context, Model, Action} from "./tabs"
*/

const styleSheet = Style.createSheet({
  base: {
    width: '100%',
    height: `calc(100% - ${Toolbar.height})`,
    // This padding matches title bar height.
    paddingTop: '32px',
    overflowY: 'scroll',
    boxSizing: 'border-box'
  }
});

export const Close =
  (id/*:ID*/)/*:Action*/ =>
  ( { type: "Close"
    , id
    }
  );


export const Activate =
  (id/*:ID*/)/*:Action*/ =>
  ( { type: "Activate"
    , id
    }
  );


const ByID =
  id =>
  action =>
  ( action.type === "Close"
  ? Close(id)
  : action.type === "Activate"
  ? Activate(id)
  : { type: "Tab"
    , id
    , source: action
    }
  );


export const view =
  (model/*:Model*/, address/*:Address<Action>*/, context/*:Context*/)/*:DOM*/ =>
  html.div
  ( { className: 'sidebar-tabs-scrollbox'
    , style: styleSheet.base
    }
  , model
      .order
      .map
      ( id =>
          thunk
          ( id
          , Tab.view
          , model.entries[id]
          , forward(address, ByID(id))
          , context
          )
      )
  );
