import Entry from '../../../Components/CanvasEditor/EntryRep';
import {ReducerError} from '../../../common/reducers'
import uuidv1 from 'uuid/v1';
import 'babel-polyfill';

import {EditorReducer} from '../reducers/EditorReducer'

var defaultState = {
  store : {
    volatile : {pending : [], _id: 'exampleID-0'},
    persistent : {
      canvases : {
        'exampleID-0' : {
          _id : 'exampleID-0',
          canvasType : 'BusinessModelCanvas',
          buildingBlocks : {
            b0: {_id: 'b0', title: 'Key Partners',  buildingBlockType: 'data', layoutEntry:{}, entries:{}},
            b1: {_id: 'b1', title: 'Key Activities', buildingBlockType: 'data', layoutEntry:{}, entries:{}},
            b2: {_id: 'b2', title: 'Key Resources', buildingBlockType: 'data', layoutEntry:{}, entries:{}}
          }
        },
        'exampleID-2' : {
          _id : 'exampleID-2',
          canvasType : 'ValuePropositionCanvas',
          buildingBlocks : {
            b0: {_id: 'b0', title: 'Products & Services', buildingBlockType: 'data', layoutEntry:{}, entries:{}},
            b1: {_id: 'b1', title: 'Gain Creators',       buildingBlockType: 'data', layoutEntry:{}, entries:{}},
            b2: {_id: 'b2', title: 'Pain Relievers',      buildingBlockType: 'data', layoutEntry:{}, entries:{}},
          }
        }
      }
    }
  }
};

defaultState.store.persistent.canvases['exampleID-2'].buildingBlocks.b2.entries = {
  e1 : {_id: 'e1', content: {}},
  e2 : {_id: 'e2', content: {text: "hello!"}},
  e3 : {_id: 'e3', content: {text: ""}}
};
defaultState.store.persistent.canvases['exampleID-2'].buildingBlocks.b1.entries = {
  e4 : {_id: 'e4', content: {}},
  e5 : {_id: 'e5', content: {text: "hello!"}},
  e6 : {_id: 'e6', content: {text: ""}}
};

describe('editor add entry reducer test', () => {

  it('should handle ADD_ENTRY_ACTION and return changed diff', () => {

    expect(
      EditorReducer(defaultState.store.persistent, {
        type: 'ADD_ENTRY_ACTION',
        entry : {_id: 'e12345'},
        block_uuid : 'b1',
        canvas_uuid : 'exampleID-0'
      })
    ).toEqual(
      {canvases: {"exampleID-0": {buildingBlocks: {b1: {entries: {e12345: {_id: "e12345"}}}}}}}
    )

    expect(() => {
      EditorReducer(defaultState.store.persistent, {
        type: 'ADD_ENTRY_ACTION',
        entry : {},
        block_uuid : 'b1',
        canvas_uuid : 'exampleID-0'
      })}).toThrow("add entry failure")

    expect(() => {
      EditorReducer(defaultState.store.persistent, {
        type: 'ADD_ENTRY_ACTION',
        entry : {_id: 'e12345'},
        block_uuid : undefined,
        canvas_uuid : 'exampleID-0'
      })}).toThrow("add entry failure")

    expect(() => {
      EditorReducer(defaultState.store.persistent, {
        type: 'ADD_ENTRY_ACTION',
        entry : {_id: 'e12345'},
        block_uuid : 'b1',
        canvas_uuid : undefined
      })}).toThrow("add entry failure")

  })
})

describe('editor remove entry reducer test', () => {

  it('should handle REMOVE_ENTRY_ACTION and return changed diff', () => {

    expect(
      EditorReducer(defaultState.store.persistent, {
        type: 'REMOVE_ENTRY_ACTION',
        entry : {_id: 'e2'},
        block_uuid : 'b2',
        canvas_uuid : 'exampleID-2'
      })
    ).toEqual(
      {canvases: {"exampleID-2": {buildingBlocks: {b2: {entries: {
        e1 : {_id: 'e1', content: {}},
        e3 : {_id: 'e3', content: {text: ""}}}}}}}}
    )

    expect(
      EditorReducer(defaultState.store.persistent, {
        type: 'REMOVE_ENTRY_ACTION',
        entry : {index: 0},
        block_uuid : 'b2',
        canvas_uuid : 'exampleID-2'
      })
    ).toEqual(
      {canvases: {"exampleID-2": {buildingBlocks: {b2: {entries: {
        e2 : {_id: 'e2', content: {text: "hello!"}},
        e3 : {_id: 'e3', content: {text: ""}}}}}}}}
    )

    expect(() => {
      EditorReducer(defaultState.store.persistent, {
        type: 'REMOVE_ENTRY_ACTION',
        entry : {_id: undefined},
        block_uuid : 'b2',
        canvas_uuid : 'exampleID-2'
      })}).toThrow("add entry failure")

    expect(() => {
      EditorReducer(defaultState.store.persistent, {
        type: 'REMOVE_ENTRY_ACTION',
        entry : {_id: 'e2'},
        block_uuid : undefined,
        canvas_uuid : 'exampleID-2'
      })}).toThrow("add entry failure")

    expect(() => {
      EditorReducer(defaultState.store.persistent, {
        type: 'REMOVE_ENTRY_ACTION',
        entry : {_id: 'e2'},
        block_uuid : 'b2',
        canvas_uuid : undefined
    })}).toThrow("add entry failure")
  })
})

describe('editor change entry reducer test', () => {

  it('should handle CHANGE_ENTRY_ACTION and return changed diff', () => {
    expect(
      EditorReducer(defaultState.store.persistent, {
        type: 'CHANGE_ENTRY_ACTION',
        entry : {_id: 'e2', content : {text : "Hallo"}},
        block_uuid : 'b2',
        canvas_uuid : 'exampleID-2'
      })
    ).toEqual(
      {canvases: {"exampleID-2": {buildingBlocks: {b2: {entries: {e2: {_id: "e2", content:{text: "Hallo"}}}}}}}}
    )

    expect(
      EditorReducer(defaultState.store.persistent, {
        type: 'CHANGE_ENTRY_ACTION',
        entry : {_id: 'e1', content : {text : "Hallo"}},
        block_uuid : 'b2',
        canvas_uuid : 'exampleID-2'
      })
    ).toEqual(
      {canvases: {"exampleID-2": {buildingBlocks: {b2: {entries: {e1: {_id: "e1", content:{text: "Hallo"}}}}}}}}
    )

    expect(() => {
      EditorReducer(defaultState.store.persistent, {
        type: 'CHANGE_ENTRY_ACTION',
        entry : {_id: 'e8', content : {text : "Hallo"}},
        canvas_uuid : 'exampleID-2'
    })}).toThrow("change entry failure")

    expect(() => {
      EditorReducer(defaultState.store.persistent, {
        type: 'CHANGE_ENTRY_ACTION',
        entry : {},
        block_uuid : 'b2',
        canvas_uuid : 'exampleID-2'
    })}).toThrow("change entry failure")

    expect(() => {
      EditorReducer(defaultState.store.persistent, {
        type: 'CHANGE_ENTRY_ACTION',
        entry : {_id: 'e2'},
        block_uuid : 'b2',
        canvas_uuid : undefined
      })}).toThrow("change entry failure")

  })
})
