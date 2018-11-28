'use strict';


// Import other modules
import {manager} from '../../../project_manager/manager';
import {connection} from '../../../project_manager/database';


//------Helpers-------

/**
 * @param {object} statusCode 
 * @param {*} res 
 * 
 * @returns {bool} if an error occurred
 */
function handleError(statusCode, res){
    if(statusCode == undefined)
        return false;
    if(statusCode.status === 200)
        return false;

    try{
        res.status(statusCode.status).send({"message": statusCode.message});
        return true;
    }catch(err){
        res.status(statusCode.status).send({"message": "No project found with this id"});
        return true;
    }
}

/**
 * Returns the BuildingBlockTitle according to a BuildingBlockType (Specified by the REST API)
 * 
 * @param {string} buildingBlockType 
 * @returns {string} the buildingBlockTitle according to the input, if unknown this function returns `undefined`
 */
function translateBuildingBlockType(buildingBlockType){
    let dictionary = {
        // BusinessModelCanvas-Section
        KeyPartners: 'Key Partners',
        KeyActivities: 'Key Activities',
        KeyResources: 'Key Resources',
        CustomerRelation: 'Customer Relationships',
        Channels: 'Channels',
        CustomerSegments: 'Customer Segments',
        CostStructure: 'Cost Structure',
        RevenueStreams: 'Revenue Streams',
        ValueProposition: 'Value Propositions',

        // ValuePropositionCanvas-Section        
        ProductsAndServices: 'Products & Services',
        GainCreators: 'Gain Creators',
        PainRelievers: 'Pain Relievers',
        Gains: 'Gains',
        Pains: 'Pains',
        CustomerJobs: 'Customer Job(s)',

        // LeanCanvas-Section
        Problem: 'Problem',
        Solution: 'Solution',
        KeyMetrics: 'Key Metrics',
        UniqueValueProposition: 'Unique Value Proposition',
        UnfairAdvantages: 'Unfair Advantage',
        Channels: 'Channels',
        CustomerSegments: 'Customer Segment',
        CostStructure: 'Cost Structure',
        RevenueStreams: 'Revenue Streams',

        // CustomerJourneyCanvas-Section
        Advertisement: 'Advertisement',
        PreSocialMedia: '(Pre-) Social Media',
        PreWordOfMouth: '(Pre-) Word-of-Mouth',
        Expectations: 'Expactations',
        PastExperiences: 'Past Experiences',
        ServiceJourney: 'Service Journey',
        Experiences: 'Experiences',
        RelationshipMenage: 'Relationship Management',
        PostSocialMedia: '(Post-) Social Media',
        PostWordOfMouth: '(Post-) Word-of-Mouth',
        DisSatisfaction: '(Dis)Satisfaction'
    };

    return dictionary[buildingBlockType]; // <---- returns `undefined` if buildingBlockType is not in the dictionary
}



//
// ─── CONTROLLERS ────────────────────────────────────────────────────────────────
//
// See swagger file!

function createEntry(req, res){
    let projectID;
    let canvasID;
    let buildingBlockType;
    let data;
    
    try { // If params cant be accessed
        projectID = req.swagger.params.projectID.value;
        canvasID = req.swagger.params.canvasID.value;
        projectID = req.swagger.params.projectID.value;
        buildingBlockType = req.swagger.params.buildingBlockType.value;
        data = req.swagger.params.data.value;
    }catch(err){
        return res.status(500).send({"message": "An error occurred"});
    }
    
    let buildingBlockTitle = translateBuildingBlockType(buildingBlockType);
    if(buildingBlockTitle === undefined)
        return res.status(400).send({"message": 'Invalid buildingBlockType'});
    
    let userID = req.user._id.toString();
    
    connection.checkEditAccess(projectID, userID,(accessError) => {
        if( handleError(accessError, res))
            return;
        manager.getProject(projectID, (managerError, projectManager) => {
            projectManager.createEntry( canvasID, buildingBlockTitle,
                data, (statusCode, savedProject) => {
        
                if( handleError(statusCode, res))
                    return;
        
                res.json(savedProject);
            })
        })
    })
            
}

function readEntry(req, res){

    let projectID;
    let canvasID;
    let buildingBlockType;
    let entryID;
    
    try { // If params cant be accessed
        projectID = req.swagger.params.projectID.value;
        canvasID = req.swagger.params.canvasID.value;
        projectID = req.swagger.params.projectID.value;
        buildingBlockType = req.swagger.params.buildingBlockType.value;
        entryID = req.swagger.params.entryID.value;
    }catch(err){
        return res.status(500).send({"message": "An error occurred"});
    }
    
    let buildingBlockTitle = translateBuildingBlockType(buildingBlockType);
    if(buildingBlockTitle === undefined)
        return res.status(400).send({"message": 'Invalid buildingBlockType'});
    
    let userID = req.user._id.toString();
    
    connection.checkReadAccess(projectID, userID,(accessError) => {
        if( handleError(accessError, res))
            return;
        manager.getProject(projectID, (managerError, projectManager) => {
            projectManager.readEntry(canvasID, buildingBlockTitle,
                entryID, (statusCode, entry) => {
        
                if( handleError(statusCode, res))
                    return;
        
                res.json(entry);
            })
        });
    })
}

function updateEntry(req,res){
    let projectID;
    let canvasID;
    let buildingBlockType;
    let entryID;
    let data;
    
    try { // If params cant be accessed
        projectID = req.swagger.params.projectID.value;
        canvasID = req.swagger.params.canvasID.value;
        projectID = req.swagger.params.projectID.value;
        buildingBlockType = req.swagger.params.buildingBlockType.value;
        entryID = req.swagger.params.entryID.value;
        data = req.swagger.params.data.value;
    }catch(err){
        return res.status(500).send({"message": "An error occurred"});
    }
    
    let buildingBlockTitle = translateBuildingBlockType(buildingBlockType);
    if(buildingBlockTitle === undefined)
        return res.status(400).send({"message": 'Invalid buildingBlockType'});


    let userID = req.user._id.toString();
    
    connection.checkEditAccess(projectID, userID,(accessError) => {
        if( handleError(accessError, res))
            return;
        manager.getProject(projectID, (managerError, projectManager) => {


            projectManager.updateEntry(canvasID, buildingBlockTitle, entryID, data, (statusCode, entry) => {
                if( handleError(statusCode, res))
                    return;

                res.json(entry);
            })
        })
    })
}

function deleteEntry(req,res){
    let projectID;
    let canvasID;
    let buildingBlockType;
    let entryID;
    
    try { // If params cant be accessed
        projectID = req.swagger.params.projectID.value;
        canvasID = req.swagger.params.canvasID.value;
        projectID = req.swagger.params.projectID.value;
        buildingBlockType = req.swagger.params.buildingBlockType.value;
        entryID = req.swagger.params.entryID.value;
    }catch(err){
        return res.status(500).send({"message": "An error occurred"});
    }
    
    let buildingBlockTitle = translateBuildingBlockType(buildingBlockType);
    if(buildingBlockTitle === undefined)
        return res.status(400).send({"message": 'Invalid buildingBlockType'});


    let userID = req.user._id.toString();
    
    connection.checkEditAccess(projectID, userID,(accessError) => {
        if( handleError(accessError, res))
            return;
        manager.getProject(projectID, (managerError, projectManager) => {

            projectManager.deleteEntry(canvasID, buildingBlockTitle, entryID, (statusCode, entry) => {
                if( handleError(statusCode, res))
                    return;

                res.status(200).send();
            })
        })
    })
}

module.exports = {
    createEntry,
    readEntry,
    updateEntry,
    deleteEntry
}