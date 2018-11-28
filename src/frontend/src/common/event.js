/**
 * The assignment network-event.
 * Fired when a change should be applied to the bound store.
 * The change is sent in the form of an assignment-list.
 * Can contain a callback to which any modifications after the assignment should be passed.
 * As an example, if the client locally modifies something, it might be relayed to the server via a this event.
 * The server might reject this assignment, in which case the callback will be invoked with the assignmentlist created from the values at the server.
 * If the server acceptes the assignment, the callback is invoked with the empty list.
 */
export const EVENT_ASSIGNMENT="assignment_event";
/**
 * The initialization network-event.
 * This event is sent from the server to the client with the complete state at the server,
 * so that the client can load it into his store.
 */
export const EVENT_INIT="init_event";
/**
 * Optional: The Lock-Request network-event.
 * This event can be fired by the client to preemptively request a lock.
 * The path of the requested lock is passed as data.
 * The success of the locking is returned to the client via a callback.
 * Note that this is optional, assignments will always lock the values they are writing to.
 */
export const EVENT_REQUESTLOCK="lock_request";
/**
 * The Query-Lock network-event.
 * This event can be fired by the client to check whether a lock is free.
 * The lock to test is passed as data.field and is optional. If it is not passed, all currently held locks will be returned as if they were queried individually, but ommiting the "free"-field.
 * If the lock is free, the server invokes the callback with {field:data.field, free:true}.
 * If the lock is set by the quering user, the server invokes the callback with {field:data.field, ownerID:userID, owner:username, free:true}
 * If the lock is set by another user, the server invokes the callback with {field:data.field, ownerID:userID, owner:username, free:false}
 */
export const EVENT_QUERYLOCK="lock_query";
/**
 * Optional: The event for releasing held locks early.
 * This event can be fired by the client to release a held lock before the timeout.
 * Note that this is entirely optional, as locks timeout after a fixed amount of time (probably around 2s).
 * Examples in which this makes sense would be: The user changing tabs, closing the application or even just selecting another component.
 */
export const EVENT_RELEASELOCK="lock_release";
/**
 * The event informing about a change in the lock-situation.
 * This event is fired <b>by the server</b> when one or multiple locks change (timeout or beeing locked)
 * and is broadcasted to the clients.
 * The callback is invoked with:
 *  - locks: a map-object where the fields are the keys and the owners are the values.
 *  - self: the user of this socket-connection.
 */
export const EVENT_LOCKINFO="lock_info";