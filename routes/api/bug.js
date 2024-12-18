import express from 'express';
import { ObjectId } from 'mongodb';
import Joi from 'joi';
import bcrypt from 'bcrypt';
import {isLoggedIn, hasPermission} from '@merlin4/express-auth';

const router = express.Router();


import debug from 'debug';
const debugBugs = debug('app:Bug');

import { connect } from '../../database.js'

import {validBody} from "../../middleware/validBody.js"

import jwt from 'jsonwebtoken';

const bugSchema = Joi.object({
  title: Joi.string().required().messages({
    'any.required': '"title" is required'
  }),
  description: Joi.string().required().messages({
    'any.required': '"description" is required'
  }),
  classification: Joi.string().required().messages({
    'any.required': '"classification" is required'
  }),
  status: Joi.string().required().messages({
    'any.required': '"status" is required'
  }),
});

const updateBugSchema = Joi.object({
  title: Joi.string().optional(),
  description: Joi.string().optional(),
  // stepsToReproduce: Joi.string().optional(),
  classification: Joi.string().optional(),
  assignedTo: Joi.string().optional(),
  status: Joi.string().optional(),
  comments: Joi.string().optional(),
});

const validClassifications = ['bug'];

const classifySchema = Joi.object({
  classification: Joi.string().valid(...validClassifications).required(),
});

const closeSchema = Joi.object({
  closed: Joi.boolean().required(),
});

const commentSchema = Joi.object({
  comment: Joi.string().min(1).required(),
  author: Joi.string().optional(), 
});

const testSchema = Joi.object({
  description: Joi.string().required().messages({
    'any.required': 'Test description is required.',
  }),
  status: Joi.string().valid('passed', 'failed').required().messages({
    'any.only': 'Test status must be either "passed" or "failed".',
    'any.required': 'Test status is required.',
  }),
  testedBy: Joi.string().required().messages({
    'any.required': 'Tester name is required.',
  }),
  testedOn: Joi.date().optional(),
});

const patchTestSchema = Joi.object({
  description: Joi.string().optional(),
  status: Joi.string().valid('passed', 'failed').optional().messages({
    'any.only': 'Test status must be either "passed" or "failed".',
  }),
  testedBy: Joi.string().optional(),
}).min(1).messages({
  'object.min': 'At least one field must be updated.',
});


const validateObjectId = (id) => ObjectId.isValid(id);

async function issueAuthToken(user){ 
  const authPayload = { _id: bug._id, description: bug.description, title: bug.title, steps: bug.steps, status: bug.status };
  const permissions = mergePermissions(user, roles);
  authPayload.permissions = permissions;
  //debugUser(permissions);
  const token = jwt.sign(authPayload, process.env.JWT_SECRET, {expiresIn: '1h'});
  debugBugs(token);
  return token;
}

async function issueAuthCookie(res, token){
  const cookieOptions = {httpOnly: true, maxAge: 1000*60*60, sameSite:'strict', secure:true};
  res.cookie('authToken', token, cookieOptions);
}

// Get all bugs
router.get('/', async (req, res) => {
  if (!req.auth || !req.auth.permissions.includes('canViewData')) {
    return res.status(401).json({ error: 'Unauthorized: You must be logged in and have permission to access this resource.' });
  }

  try {
    const db = await connect();
    const bugs = await db.collection('Bugs').find().toArray(); 

    if (bugs.length === 0) {
      return res.status(404).json({ message: 'No bugs found.' });
    }

    debugBugs('Fetched all bugs successfully');
    res.status(200).json(bugs); 
  } catch (error) {
    debugUser(`Error fetching bugs: ${error.message}`); 
    res.status(500).json({ message: 'Error retrieving bugs.' });
  }
});

router.get('/list', async (req, res) => {
  const {
    keywords,
    classification,
    maxAge,
    minAge,
    closed,
    sortBy,
    pageSize = 9,
    pageNumber = 1,
  } = req.query;

  const query = {};
  const sort = {};

  if (keywords) {
    query.$text = { $search: keywords };
  }

  if (classification) {
    query.classification = classification;
  }

  if (minAge || maxAge) {
    const today = new Date();

    if (maxAge) {
      const pastMaximumDaysOld = new Date(today);
      pastMaximumDaysOld.setDate(today.getDate() - parseInt(maxAge));
      query.createdOn = { ...query.createdOn, $gte: pastMaximumDaysOld };
    }

    if (minAge) {
      const pastMinimumDaysOld = new Date(today);
      pastMinimumDaysOld.setDate(today.getDate() - parseInt(minAge));
      query.createdOn = { ...query.createdOn, $lte: pastMinimumDaysOld };
    }
  }

  if (closed === 'true') {
    query.closed = true;
  } else if (closed === 'false') {
    query.closed = false;
  }

  switch (sortBy) {
    case 'newest':
      sort.createdOn = -1;
      break;
    case 'oldest':
      sort.createdOn = 1;
      break;
    case 'title':
      sort.title = 1;
      sort.createdOn = -1;
      break;
    case 'classification':
      sort.classification = 1;
      sort.createdOn = -1;
      break;
    case 'assignedTo':
      sort.assignedTo = 1;
      sort.createdOn = -1;
      break;
    case 'createdBy':
      sort.createdBy = 1;
      sort.createdOn = -1;
      break;
    default:
      sort.createdOn = -1;
  }

  const skip = (Number(pageNumber) - 1) * Number(pageSize);
  const limit = Number(pageSize);

  try {
    const db = await connect();
    const bugsCollection = db.collection('Bugs');

    const bugs = await bugsCollection
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    res.status(200).json({
      message: 'Bugs retrieved successfully',
      bugs,
      pageNumber: Number(pageNumber),
      pageSize: Number(pageSize),
    });
  } catch (error) {
    debugBugs(`Error fetching bugs: ${error.message}`);
    res.status(500).json({ error: 'An error has occurred while fetching the bug list' });
  }
});




router.get('/:bugId', async (req, res) => {
  // if (!req.user) {
  //   return res.status(401).json({ error: 'Unauthorized: You must be logged in to view this information.' });
  // }

  const { bugId } = req.params;

  if (!ObjectId.isValid(bugId)) {
    return res.status(400).json({ error: `Invalid bugId: ${bugId}` });
  }

  try {
    const db = await connect();
    
    const bug = await db.collection('Bugs').findOne({ _id: new ObjectId(bugId) });

    if (!bug) {
      return res.status(404).json({ error: `Bug with bugId ${bugId} not found.` });
    }

    const { password, ...bugProfile } = bug;
    res.status(200).json({
      message: 'Bug profile retrieved successfully',
      profile: bugProfile,
    });
  } catch (error) {
    debugBugs(`Error fetching bug profile: ${error.message}`);
    res.status(500).json({ error: 'An error occurred while retrieving the bug profile.' });
  }
});

router.post('/report', isLoggedIn(), validBody(bugSchema), async (req, res) => {
  if (!req.auth) {
    return res.status(401).json({ error: 'Unauthorized: You must be logged in to create a new bug.' });
  }

  try {
    const { title, description, priority, classification } = req.body;

    const initialComment = {
      author: req.auth.username, 
      comment: "Initial report",
      date: new Date()
    };

    const newBug = {
      _id: new ObjectId(),
      title,
      description,
      priority,
      status: 'Open',
      createdOn: new Date(),
      createdBy: req.auth.userId,
      classification: classification || 'unclassified',
      closed: false,
      comments: [initialComment]  
    };

    const db = await connect();
    const insertResult = await db.collection('Bugs').insertOne(newBug);

    if (insertResult.acknowledged) {
      const editRecord = {
        timestamp: new Date(),
        col: "Bugs",
        op: "insert",
        target: { bugId: insertResult.insertedId },
        update: newBug,
        auth: req.auth
      };
      await db.collection('edits').insertOne(editRecord);

      res.status(201).json({ message: 'Bug created successfully', bug: newBug });
    } else {
      return res.status(500).json({ error: 'Error creating bug' });
    }
  } catch (error) {
    console.error(`Error creating bug: ${error.message}`);
    res.status(500).json({ error: 'Internal server error while creating bug.' });
  }
});




router.patch('/:bugId', isLoggedIn(), validBody(updateBugSchema), async (req, res) => {
  if (!req.auth) {
    return res.status(401).json({ error: 'Unauthorized: You must be logged in to edit a bug.' });
  }

  const bugIdToUpdate = req.params.bugId;

  const { error, value } = updateBugSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ error: error.details.map(detail => detail.message) });
  }

  try {
    const db = await connect();
    const bugCollection = db.collection('Bugs');

    const targetBug = await bugCollection.findOne({ _id: new ObjectId(bugIdToUpdate) });
    if (!targetBug) {
      return res.status(404).json({ error: 'Bug not found.' });
    }

    const updateFields = { ...value, lastUpdatedOn: new Date(), lastUpdatedBy: req.auth.userId };

    await bugCollection.updateOne(
      { _id: new ObjectId(bugIdToUpdate) },
      { $set: updateFields }
    );

    const editRecord = {
      timestamp: new Date(),
      col: "Bugs",
      op: "update",
      target: { bugId: bugIdToUpdate },
      update: updateFields,
      auth: req.auth
    };
    await db.collection('edits').insertOne(editRecord);

    res.status(200).json({
      message: 'Bug profile updated successfully.',
      updatedProfile: {
        ...updateFields,
        lastUpdatedOn: updateFields.lastUpdatedOn
      }
    });

  } catch (error) {
    console.error(`Error updating bug profile: ${error.message}`);
    res.status(500).json({ error: 'An error occurred while updating the bug profile.' });
  }
});


router.put('/:bugId/classify', isLoggedIn(), async (req, res) => {
  if (!req.auth) {
    return res.status(401).json({ error: 'Unauthorized: You must be logged in to classify this bug.' });
  }

  const { bugId } = req.params;

  if (!ObjectId.isValid(bugId)) {
    return res.status(400).json({ error: `Invalid bugId: ${bugId}` });
  }

  const { classification } = req.body;

  if (!classification) {
    return res.status(400).json({ message: "Classification field is required." });
  }

  try {
    const bug = await bug.findById(bugId);

    if (!bug) {
      return res.status(404).json({ message: "Bug not found" });
    }

    const canClassifyAnyBug = req.auth.permissions.includes('canClassifyAnyBug');
    const canEditIfAssigned = req.auth.permissions.includes('canEditIfAssignedTo') && bug.assignedTo === req.auth.userId;
    const canEditMyBug = req.auth.permissions.includes('canEditMyBug') && bug.createdBy === req.auth.userId;

    if (!canClassifyAnyBug && !canEditIfAssigned && !canEditMyBug) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to classify this bug.' });
    }

    const classificationUpdates = {
      classification,
      classifiedOn: new Date(),
      classifiedBy: req.auth.userId, 
    };

    const classifiedBug = await bug.findByIdAndUpdate(
      bugId,
      { $set: classificationUpdates },
      { new: true }
    );

    if (!classifiedBug) {
      return res.status(404).json({ message: "Bug not found after update." });
    }

    const editRecord = new Edit({
      timestamp: new Date(),
      col: "Bugs",
      op: "update",
      target: { bugId },
      update: classificationUpdates,
      auth: req.auth
    });

    await editRecord.save();

    res.status(200).json({ message: "Bug classified successfully", bug: classifiedBug });
  } catch (error) {
    console.error("Error classifying bug:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


router.put('/:bugId/assign', isLoggedIn(), async (req, res) => {
  if (!req.auth) {
    return res.status(401).json({ error: 'Unauthorized: You must be logged in to assign this bug.' });
  }

  const { bugId } = req.params;

  if (!ObjectId.isValid(bugId)) {
    return res.status(400).json({ error: `Invalid bugId: ${bugId}` });
  }

  const { assignedTo } = req.body;

  if (!assignedTo) {
    return res.status(400).json({ message: "assignedTo field is required." });
  }

  try {
    const bug = await Bug.findById(bugId);

    if (!bug) {
      return res.status(404).json({ message: "Bug not found" });
    }

    const canReassignAnyBug = req.auth.permissions.includes('canReassignAnyBug');
    const canReassignIfAssigned = req.auth.permissions.includes('canReassignIfAssignedTo') && bug.assignedTo === req.auth.user.givenName;
    const canEditMyBug = req.auth.permissions.includes('canEditMyBug') && bug.createdBy === req.auth.user.givenName;

    if (!canReassignAnyBug && !canReassignIfAssigned && !canEditMyBug) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to assign this bug.' });
    }

    const assignmentUpdates = {
      assignedTo,
      assignedOn: new Date(),
      assignedBy: req.auth.userId, 
    };

    const assignedBug = await Bug.findByIdAndUpdate(
      bugId,
      { $set: assignmentUpdates },
      { new: true }
    );

    if (!assignedBug) {
      return res.status(404).json({ message: "Bug not found after update." });
    }

    const editRecord = new Edit({
      timestamp: new Date(),
      col: "bug",
      op: "update",
      target: { bugId },
      update: assignmentUpdates,
      auth: req.auth
    });

    await editRecord.save();

    res.status(200).json({ message: "Bug assigned successfully", bug: assignedBug });
  } catch (error) {
    console.error("Error assigning bug:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


router.put('/:bugId/close', async (req, res) => {
  if (!req.auth) {
    return res.status(401).json({ error: 'Unauthorized: You must be logged in to close this bug.' });
  }

  const { bugId } = req.params;

  if (!ObjectId.isValid(bugId)) {
    return res.status(400).json({ error: `Invalid bugId: ${bugId}` });
  }

  const { close } = req.body;

  if (typeof close !== 'boolean') {
    return res.status(400).json({ error: "The 'close' field must be a boolean." });
  }

  try {
    if (!req.auth.permissions.includes('canCloseAnyBug')) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to close this bug.' });
    }

    const closeUpdates = close
      ? {
          closedOn: new Date(),
          closedBy: req.auth.userId,
        }
      : {
          closedOn: null,
          closedBy: null,
        };

    const updatedBug = await Bug.findByIdAndUpdate(bugId, closeUpdates, { new: true });

    if (!updatedBug) {
      return res.status(404).json({ message: "Bug not found" });
    }

    const editRecord = new Edit({
      timestamp: new Date(),
      col: "bug",
      op: "update",
      target: { bugId },
      update: closeUpdates,
      auth: req.auth,
    });

    await editRecord.save();

    res.status(200).json({ message: close ? "Bug closed successfully" : "Bug reopened successfully", bug: updatedBug });
  } catch (error) {
    console.error("Error updating bug close status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:bugId/comments", isLoggedIn(), async (req, res) => {
  const { bugId } = req.params;

  try {
    const comments = await Comment.find({ bug: bugId })
      .sort({ createdAt: 1 })
      .populate("createdBy", "username");

    res.status(200).json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get('/:bugId/comments/:commentId', isLoggedIn(), async (req, res) => {
  if (!req.auth.permissions.includes('viewBugs', 'viewBugsById')) {
    return res.status(403).json({ error: 'Forbidden: You do not have permission to view comments.' });
  }

  const { bugId, commentId } = req.params;

  try {
    const bug = await bug.findById(bugId).select('comments');

    if (!bug) {
      return res.status(404).json({ message: "Bug not found" });
    }

    const comment = bug.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.status(200).json(comment);
  } catch (error) {
    console.error("Error retrieving specific bug comment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post('/:bugId/comments', isLoggedIn(), async (req, res) => {
  if (!req.auth) {
    return res.status(401).json({ error: 'Unauthorized: You must be logged in to post a comment.' });
  }

  const { bugId } = req.params;
  const { comments } = req.body;

  if (!comments) {
    return res.status(400).json({ message: "Comment text is required" });
  }

  const newComment = {
    comments,
    postedBy: req.auth.userId,
    postedOn: new Date(),
  };

  try {
    const updatedBug = await bug.findByIdAndUpdate(
      bugId,
      { $push: { comments: newComment } },
      { new: true }  // Option to return the updated document
    );

    if (!updatedBug) {
      return res.status(404).json({ message: "Bug not found" });
    }

    res.status(201).json({ message: "Comment added successfully", bug: updatedBug });
  } catch (error) {
    console.error("Error adding new comment to bug:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


router.get('/:bugId/test/list', async (req, res) => {
  try {
      const { bugId } = req.params;

      const bug = await bug.findById(bugId).populate('tests'); 

      if (!bug) {
          return res.status(404).json({ message: "Bug not found" });
      }

      res.status(200).json(bug.tests);
  } catch (error) {
      console.error("Error retrieving tests for bug:", error);
      res.status(500).json({ message: "Internal server error" });
  }
});

router.get('/:bugId/tests', async (req, res) => {
  if (!req.auth.permissions.includes('canViewData')) {
    return res.status(403).json({ error: 'Forbidden: You do not have permission to view tests.' });
  }

  const { bugId } = req.params;

  try {
    const bug = await bug.findById(bugId).select('testCases');

    if (!bug) {
      return res.status(404).json({ message: "Bug not found" });
    }

    res.status(200).json(bug.testCases);
  } catch (error) {
    console.error("Error retrieving tests for bug:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get('/:bugId/tests/:testId', isLoggedIn(), async (req, res) => {
  // if (!req.auth.permissions.includes('canViewData')) {
  //   return res.status(403).json({ error: 'Forbidden: You do not have permission to view tests.' });
  // }

  const { bugId, testId } = req.params;

  try {
    const bug = await bug.findById(bugId).select('testCases');

    if (!bug) {
      return res.status(404).json({ message: "Bug not found" });
    }

    const test = bug.testCases.id(testId);

    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    res.status(200).json(test);
  } catch (error) {
    console.error("Error retrieving specific test for bug:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post('/:bugId/tests', isLoggedIn(), async (req, res) => {
  if (!req.auth.permissions.includes('canAddTestCase')) {
    return res.status(403).json({ error: 'Forbidden: You do not have permission to add test cases.' });
  }

  const { bugId } = req.params;

  if (!ObjectId.isValid(bugId)) {
    return res.status(400).json({ error: `bugId ${bugId} is not a valid ObjectId.` });
  }

  const { error, value } = testSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({ error: error.details.map(detail => detail.message) });
  }

  const { description, status, testedOn } = value;
  const newTest = {
    description,
    status,
    createdOn: new Date(),
    createdBy: req.auth,
    testedOn: testedOn || new Date(),
  };

  try {
    const bug = await bug.findById(bugId);

    if (!bug) {
      return res.status(404).json({ error: `Bug ${bugId} not found.` });
    }

    bug.testCases.push(newTest);
    await bug.save();

    const editRecord = {
      timestamp: new Date(),
      col: "bug",
      op: "insert",
      target: { bugId },
      update: newTest,
      auth: req.auth,
    };

    await Edit.create(editRecord);

    res.status(201).json({
      message: 'Test case added successfully!',
      test: newTest,
    });
  } catch (error) {
    console.error("Error adding test to bug:", error);
    res.status(500).json({ error: 'An error occurred while adding the test case.' });
  }
});

router.patch('/:bugId/tests/:testId', isLoggedIn(), async (req, res) => {
  if (!req.auth.permissions.includes('canEditTestCase')) {
    return res.status(403).json({ error: 'Forbidden: You do not have permission to edit test cases.' });
  }

  const { bugId, testId } = req.params;
  const { updateData } = req.body;

  try {
    const bug = await bug.findById(bugId);
    if (!bug) {
      return res.status(404).json({ message: "Bug not found" });
    }

    const testIndex = bug.testCases.findIndex(test => test._id.toString() === testId);
    if (testIndex === -1) {
      return res.status(404).json({ message: "Test case not found" });
    }

    const updatedTest = {
      ...bug.testCases[testIndex]._doc,
      ...updateData,
      lastUpdatedOn: new Date(),
      lastUpdatedBy: req.auth,
    };

    bug.testCases[testIndex] = updatedTest;
    await bug.save();

    const editRecord = {
      timestamp: new Date(),
      col: "bug",
      op: "update",
      target: { bugId, testId },
      update: updatedTest,
      auth: req.auth,
    };

    await Edit.create(editRecord);

    res.status(200).json(updatedTest);
  } catch (error) {
    console.error("Error updating test case for bug:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete('/:bugId/tests/:testId', isLoggedIn(), async (req, res) => {
  if (!req.auth.permissions.includes('canDeleteTestCase')) {
    return res.status(403).json({ error: 'Forbidden: You do not have permission to delete test cases.' });
  }

  const { bugId, testId } = req.params;

  try {
    const bug = await bug.findById(bugId);
    if (!bug) {
      return res.status(404).json({ message: "Bug not found" });
    }

    const testIndex = bug.testCases.findIndex(test => test._id.toString() === testId);
    if (testIndex === -1) {
      return res.status(404).json({ message: "Test case not found" });
    }

    const deletedTest = bug.testCases.splice(testIndex, 1)[0];
    await bug.save();

    const editRecord = {
      timestamp: new Date(),
      col: "bug",
      op: "delete",
      target: { bugId, testId },
      update: deletedTest,
      auth: req.auth,
    };

    await Edit.create(editRecord);

    res.status(200).json({ message: "Test case deleted successfully", deletedTest });
  } catch (error) {
    console.error("Error deleting test case for bug:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// router.post('/report', validBody(bugSchema), (req, res) => {
//   const { title, description, priority, classification, status = 'Open' } = req.body; 

//   const bugId = new Date().getTime().toString(); 

//   const newBug = {
//     _id: bugId,
//     title,
//     description,
//     priority,
//     classification,
//     status,
//   };

//   bugs[bugId] = newBug;

//   res.status(201).json({ message: 'Bug reported successfully', bug: newBug });
// });

export { router as bugRouter };