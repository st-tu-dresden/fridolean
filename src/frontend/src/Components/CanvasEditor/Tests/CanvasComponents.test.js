import React from 'react';
import renderer from 'react-test-renderer';

import LinkIt from '../LinkIt';
import PostIt from '../PostIt';
import TargIt from '../TargIt';

// mock for matchMedia from https://stackoverflow.com/questions/39830580/jest-test-fails-typeerror-window-matchmedia-is-not-a-function
window.matchMedia = window.matchMedia || function() {
  return {
    matches : false,
    addListener : function() {},
    removeListener: function() {}
  };
};


test('PostIt should display the expected state', () => {
    let entry = {
        _id: 'id',
        title: 'title',
        content : {
            text : 'text'
        }
    }
    let editable = true;

    let component = renderer.create(
      <PostIt 
        title = {entry.title}
        text = {entry.content.text}
        entyID = {entry._id} 
        model = {entry} 
        callback =  {undefined} 
        editable= {editable}
        >
      </PostIt>,
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    editable = false;
    component = renderer.create(
        <PostIt 
          title = {entry.title}
          text = {entry.content.text}
          entyID = {entry._id} 
          model = {entry} 
          callback =  {undefined} 
          editable= {editable}
          >
        </PostIt>,
    );

    tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    entry.content.text = 'other text';

    editable = false;
    component = renderer.create(
        <PostIt 
          title = {entry.title}
          text = {entry.content.text}
          entyID = {entry._id} 
          model = {entry} 
          callback =  {undefined} 
          editable= {editable}
          >
        </PostIt>,
    );

    tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});

test('TargIt should display the expected state', () => {
    let entry = {
        _id: 'id',
        title: 'title',
        content : {
            text : 'text'
        }
    }
    let editable = true;
    let color = '#ffcc66';

    let component = renderer.create(
      <TargIt 
        title = {entry.title}
        text = {entry.content.text}
        entyID = {entry._id} 
        model = {entry} 
        callback =  {undefined} 
        editable= {editable}
        color= {color}
        >
      </TargIt>,
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    editable = false;
    color = '#ffaaaa';

    component = renderer.create(
        <TargIt 
          title = {entry.title}
          text = {entry.content.text}
          entyID = {entry._id} 
          model = {entry} 
          callback =  {undefined} 
          editable= {editable}
          color= {color}
          >
        </TargIt>,
    );

    tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    entry.content.text = 'other text';
    editable = true;
    color = '#00ff4a';

    component = renderer.create(
        <TargIt 
          title = {entry.title}
          text = {entry.content.text}
          entyID = {entry._id} 
          model = {entry} 
          callback =  {undefined} 
          editable= {editable}
          color= {color}
          >
        </TargIt>,
    );

    tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});
