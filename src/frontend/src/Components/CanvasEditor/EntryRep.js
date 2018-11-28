/**
 * @class the internal representation of an entry
 */
export default class EntryRep{
  content = {
    text : "[empty]",       //displayed text
    reference : "[empty]",  //reference to other canvas
    target : "[empty]",     //reference to other entry
    title : "default"       //not displayed title
  }
  _id = "[empty]";  //unique id
  type = "plain";   //type: plain/target/link
  index = 0;        //index in view (only sometimes used)
}
