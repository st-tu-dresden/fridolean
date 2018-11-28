import React from 'react';
import renderer from 'react-test-renderer';
import 'babel-polyfill';

import BuildBlock from '../BuildBlock';

// mock for matchMedia from https://stackoverflow.com/questions/39830580/jest-test-fails-typeerror-window-matchmedia-is-not-a-function
window.matchMedia = window.matchMedia || function() {
  return {
    matches : false,
    addListener : function() {},
    removeListener: function() {}
  };
};

const entry1 = {_id: 'e1', buildingBlockType: 'data', content: {text: 'eergresf'}};
const entry2 = {_id: 'e2', buildingBlockType: 'data', content: {text: 'frgersdg'}};
const entry3 = {_id: 'e3', buildingBlockType: 'data', content: {text: undefined }};
const entry4 = {_id: 'e4', buildingBlockType: 'link', content: {text: undefined, target: 'e5', reference: 'somecanvasid'}};
const entry5 = {_id: 'e5', buildingBlockType: 'target', content: {text: 'fgergs'}};

const b0 = {_id: 'b0', title: 'Key Partners', buildingBlockType: 'data', layoutEntry:{}, entries:{e1: entry1}};
const b1 = {_id: 'b1', title: 'Key Activities', buildingBlockType: 'data', layoutEntry:{}, entries:{e1: entry1, e2: entry2}};
const b2 = {_id: 'b2', title: 'Key Resources', buildingBlockType: 'data', layoutEntry:{}, entries:{}};
const b3 = {_id: 'b3', title: 'Customer Relationships', buildingBlockType: 'data', layoutEntry:{}, entries:{e1: entry1, e2: entry2, e3: entry3}};
const b4 = {_id: 'b4', title: 'Channels', buildingBlockType: 'data', layoutEntry:{}, entries:{}};
const b5 = {_id: 'b5', title: 'Customer Segments', buildingBlockType: 'target', layoutEntry:{}, entries:{e5: entry5}};

const blockDef1 = {
    block: b0,
    buildingBlockType: "data",
    lockings: [],
    editable: true,
    project_id: 'pid1',
    actions: {onChangeEntry : () => {}}
}

const blockDef2 = {
    block: b3,
    buildingBlockType: "data",
    lockings: [],
    editable: true,
    project_id: 'pid1',
    actions: {onChangeEntry : () => {}}
}

const blockDef3 = {
    block: b5,
    buildingBlockType: "target",
    lockings: [],
    editable: true,
    project_id: 'pid1',
    actions: {onChangeEntry : () => {}}
}

test('BuildBlock should display the expected state', () => {

    let component = renderer.create(
      <BuildBlock
        block={blockDef1.block}
        lockings={blockDef1.lockings}
        editable={blockDef1.editable}
        project_id={blockDef1.project_id}
        actions={blockDef1.actions}>
        >
      </BuildBlock>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    component = renderer.create(
        <BuildBlock
          block={blockDef2.block}
          lockings={blockDef2.lockings}
          editable={blockDef2.editable}
          project_id={blockDef2.project_id}
          actions={blockDef2.actions}>
          >
        </BuildBlock>
      );

      tree = component.toJSON();
      expect(tree).toMatchSnapshot();

      component = renderer.create(
        <BuildBlock
          block={blockDef3.block}
          lockings={blockDef3.lockings}
          editable={blockDef3.editable}
          project_id={blockDef3.project_id}
          actions={blockDef3.actions}>
          >
        </BuildBlock>
      );

      tree = component.toJSON();
      expect(tree).toMatchSnapshot();
});
