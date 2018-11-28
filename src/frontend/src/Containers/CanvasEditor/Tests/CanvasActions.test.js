import { addEntry, removeEntry, changeEntry, changeToVP, initAction} from '../actions/index';
import Entry from '../../../Components/CanvasEditor/EntryRep';
import uuidv1 from 'uuid/v1';

describe('addEntry', () => {
  it('should create an action to create a new entry', () => {
    const entryID = uuidv1();
    const e = {_id: entryID};
    const block_uuid = uuidv1();
    const canvas_uuid = uuidv1();
    const expectedAction = {
      type: 'ADD_ENTRY_ACTION',
      entry: e,
      block_uuid: block_uuid,
      canvas_uuid: canvas_uuid,
      changed: 'canvases.'+canvas_uuid+'.buildingBlocks.'+block_uuid+'.entries'
    }
    expect(addEntry(e,block_uuid, canvas_uuid)).toEqual(expectedAction)
  })
})

describe('changeEntry', () => {
  it('should create an action to change an entry by id', () => {
    const entryID = uuidv1();
    const e = {_id: entryID};
    const block_uuid = uuidv1();
    const canvas_uuid = uuidv1();
    const expectedAction = {
      type: 'CHANGE_ENTRY_ACTION',
      entry: e,
      block_uuid: block_uuid,
      canvas_uuid: canvas_uuid,
      changed: 'canvases.'+canvas_uuid+'.buildingBlocks.'+block_uuid+'.entries.'+e._id+'.content'
    }
    expect(changeEntry(e, block_uuid, canvas_uuid)).toEqual(expectedAction)
  })
})

describe('removeEntry', () => {
  it('should create an action to remove an entry by id', () => {
    const entryID = uuidv1();
    const e = {_id: entryID};
    const block_uuid = uuidv1();
    const canvas_uuid = uuidv1();
    const expectedAction = {
      type: 'REMOVE_ENTRY_ACTION',
      entry: e,
      block_uuid: block_uuid,
      canvas_uuid: canvas_uuid,
      changed: ['canvases.'+canvas_uuid+'.buildingBlocks.'+block_uuid+'.entries.'+e._id]
    }
    expect(removeEntry(e,block_uuid, canvas_uuid)).toEqual(expectedAction)
  })
})

describe('initAction', () => {
  it('should create an action to initialize a new state', () => {
    const state = {value1 : 1, value2 : 2}
    const expectedAction = {
      type: 'INIT_ACTION',
      state
    }
    expect(initAction(state)).toEqual(expectedAction)
  })
})

describe('changeToVP', () => {
  it('should create an action to change to a VP by entry data', () => {
    const entryID = uuidv1();
    const e = {_id: entryID};
    const canvas_uuid = uuidv1();
    const expectedAction = {
      type: 'CHANGE_TO_VALUE_PROPOSITION',
      entry: e
    }
    expect(changeToVP(e)).toEqual(expectedAction)
  })
})
