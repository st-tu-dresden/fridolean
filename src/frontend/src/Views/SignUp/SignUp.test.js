import * as actions from './actions'
import * as constants from './constants'

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import fetchMock from 'fetch-mock';

import {backendLocation} from '../../api';

// Action tests
describe('signup actions', () => {
    it('creates CHANGE_INPUT action to change the input', () => {
        const event = {};
        const data = {
            name: "email",
            value: "email@mail.com"
        }
        const expectedAction = {
            type: constants.CHANGE_INPUT,
            payload: {
                field: data.name,
                value: data.value
            }
        }
        expect(actions.changeInput(event, data)).toEqual(expectedAction);
    })
}) 

const middleware = [thunk];
const mockStore = configureMockStore(middleware);

// async action creators
describe('async signup actions', () => {
    afterEach(() => {
        fetchMock.reset();
        fetchMock.restore();
    })

    it('creates SIGNUP_SUCCESS action when signup has been done.', () => {
        fetchMock
            .postOnce(backendLocation + '/auth/signup',
                { 
                    body: {
                        email: "email@mail.com",
                        password: "password",
                        passwordRepeat: "password",
                        termsAndConditions: true
                    },
                    headers: {
                        'content-type': 'application/json'
                    },                    
                }
            );


        const expectedActions = [
            { type: constants.SIGNUP_START},
            { type: constants.SIGNUP_SUCCESS},
            {
              "type": "@@router/CALL_HISTORY_METHOD",
              "payload": {
                "args": [
                  "/sign-in",
                ],
                "method": "push",
              },
            },
        ];

        const store = mockStore({ signup: {user: {}}});
        const fakeEvent = {
            preventDefault: () => false
        };

        return store.dispatch(actions.processForm(fakeEvent)).then(() => {
            // return of async actions
            expect(store.getActions()).toEqual(expectedActions);
        });
    })
}) 


// reducer tests
import * as reducers from './reducers';

describe('signup reducers', () => {
    
    it('should return the initial state', () => {
        expect(reducers.signupReducer(undefined, {})).toEqual(
            reducers.initialState
        )
    })

    it('should handle CHANGE_INPUT', () => {
        expect(
            reducers.signupReducer(reducers.initialState, {
                type: constants.CHANGE_INPUT,
                payload: {
                    field: "email",
                    value: "mail@mail.com"
                }

            })
        ).toEqual({
            errors: {},
            loading: false,    
            user: {
                email: 'mail@mail.com',
                password: '',
                passwordRepeat: '',
                termsAndConditions: false
            }
        })
        
    })

    it('should handle SIGNUP_START', () => {
        expect(
            reducers.signupReducer(
                {
                    ...reducers.initialState
                }, 
                {
                    type: constants.SIGNUP_START,
                    payload: {
                        
                    }

                }
            )
        ).toEqual({
            ...reducers.initialState,
            loading: true
        })
        
    })

    it('should handle SIGNUP_SUCCESS', () => {
        expect(
            reducers.signupReducer(
                {
                    ...reducers.initialState,
                }, 
                {
                    type: constants.SIGNUP_SUCCESS,
                    payload: {
                        
                    }

                }
            )
        ).toEqual({
            ...reducers.initialState,
            loading: false
        })
        
    })

    it('should handle SIGNUP_ERROR', () => {
        expect(
            reducers.signupReducer(
                {
                    ...reducers.initialState,
                }, 
                {
                    type: constants.SIGNUP_ERROR,
                    errors: {
                        message: "error"
                    }

                }
            )
        ).toEqual({
            ...reducers.initialState,
            errors: {
                message: "error"
            }
        })
        
    })

 
})
