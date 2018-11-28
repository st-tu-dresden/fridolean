import {composeReducersByType,typedPendingReducer,createReducerTypeMapping} from '../../../common/reducers'
import {typedEditorReducer} from './EditorReducer';
import {typedInitReducer} from './RootReducer';

/**
 * bundle defined reducers to one usable unit
 * apply websocket pending to state change
 */
const typedStorePendingReducer=createReducerTypeMapping(typedPendingReducer.reducer,"store",...(typedPendingReducer.types));
const allReducers = composeReducersByType(undefined,false,typedEditorReducer,typedStorePendingReducer,typedInitReducer);

export default allReducers;
