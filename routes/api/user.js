import express from 'express';
import { GetAllUsers } from '../../database.js';
import { ObjectId } from 'mongodb';
import Joi from 'joi';
import bcrypt from 'bcrypt';
import {isLoggedIn, hasPermission, hasRole, hasAnyRole} from '@merlin4/express-auth';

const router = express.Router();

import debug from 'debug';
const debugUser = debug('app:User');

import { connect } from '../../database.js'

import {validBody} from "../../middleware/validBody.js"

import {registerUser, getUserByEmail, findRoleByName, getPermissionsByRoles} from '../../database.js'

import jwt from 'jsonwebtoken';

import {fetchRoles, mergePermissions} from '@merlin4/express-auth';

const roles = ['Business Analyst', 'Developer', 'Quality Analyst', 'Product Manager', 'Technical Manager'];

const userSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Invalid email format',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required',
  }),
  givenName: Joi.string().required().messages({
    'any.required': 'Given name is required',
  }),
  familyName: Joi.string().required().messages({
    'any.required': 'Family name is required',
  }),
  role: Joi.string().valid(...roles).required().messages({
    'any.only': `Role must be one of the following: ${roles.join(', ')}`,
    'any.required': 'Role is required',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Invalid email format',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required',
  }),
});


const updateUserSchema = Joi.object({
  email: Joi.string().email().optional(),
  givenName: Joi.string().optional(),
  familyName: Joi.string().optional(),
  password: Joi.string().min(8).optional(),
  role: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
});

async function issueAuthToken(user) { 
  const roles = await fetchRoles(user, role => findRoleByName(role)); 
  const permissions = mergePermissions(user, roles);
  const token = jwt.sign(
    { _id: user._id, email: user.email, role: user.role, permissions: permissions },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  debugUser(token);
  return token;
}

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Unauthorized: Token has expired.' });
      }
      console.error('JWT Verification Error:', err.message);
      return res.status(401).json({ error: 'Unauthorized: Invalid token.' });
    }

    req.auth = decoded; // Attach decoded token to request
    next();
  });
}



async function issueAuthCookie(res, token){
  const cookieOptions = {httpOnly: true, maxAge: 1000*60*60, sameSite:'strict', secure:true};
  res.cookie('authToken', token, cookieOptions);
}

//You must list the static routes before listing the dynamic routes

router.get('/list', async (req, res) => {
  try {
    const { keywords, role, sortBy, minAge, maxAge, active } = req.query;
    const match = {};

    if (keywords) {
      match.$text = { $search: keywords };
    }

    if (role) {
      match.role = role;
    }

    if (minAge || maxAge) {
      const today = new Date();
      if (maxAge) {
        const pastMaximumDaysOld = new Date(today);
        pastMaximumDaysOld.setDate(today.getDate() - parseInt(maxAge));
        match.createdOn = { ...match.createdOn, $gte: pastMaximumDaysOld };
      }
      if (minAge) {
        const pastMinimumDaysOld = new Date(today);
        pastMinimumDaysOld.setDate(today.getDate() - parseInt(minAge));
        match.createdOn = { ...match.createdOn, $lte: pastMinimumDaysOld };
      }
    }

    if (active === 'true') {
      match.active = true;
    } else if (active === 'false') {
      match.active = false;
    }

    const sortMapping = {
      'givenName': { 'givenName': 1 },
      'familyName': { 'familyName': 1 },
      'role': { 'role': 1 },
      'newest': { 'createdOn': -1 },
      'oldest': { 'createdOn': 1 }
    };

    let sort = sortMapping[sortBy] || { 'givenName': 1 }; 

    const db = await connect();
    const pipeline = [{ $match: match }, { $sort: sort }];
    const users = await db.collection('User').aggregate(pipeline).toArray();

    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    console.log('Fetched users:', users);
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({ message: 'Error retrieving users' });
  }
});


/*router.get('/list', async (req, res) => {
  const { keywords, role, maxAge, minAge, sortBy = 'givenName', pageSize = 5, pageNumber = 1 } = req.query;

  let query = {};
  let sort = {};
  
  const limit = parseInt(pageSize);
  const skip = (parseInt(pageNumber) - 1) * limit;

  try {
    const db = await connect();
    const usersCollection = db.collection('User');

    if (keywords) {
      query.$text = { $search: keywords };
    }

    if (role) {
      query.role = role;
    }

    const now = new Date();
    
    if (maxAge) {
      const maxDate = new Date(now);
      maxDate.setDate(now.getDate() - parseInt(maxAge));
      query.createdDate = { ...query.createdDate, $gte: maxDate };
    }

    if (minAge) {
      const minDate = new Date(now);
      minDate.setDate(now.getDate() - parseInt(minAge));
      query.createdDate = { ...query.createdDate, $lt: minDate };
    }

    switch (sortBy) {
      case 'familyName':
        sort = { familyName: 1, givenName: 1, createdDate: 1 };
        break;
      case 'role':
        sort = { role: 1, givenName: 1, familyName: 1, createdDate: 1 };
        break;
      case 'newest':
        sort = { createdDate: -1 };
        break;
      case 'oldest':
        sort = { createdDate: 1 };
        break;
      default:
        sort = { givenName: 1, familyName: 1, createdDate: 1 };
    }

    const users = await usersCollection.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    res.status(200).json({
      message: 'User list retrieved successfully.',
      users,
      pagination: {
        pageNumber: parseInt(pageNumber),
        pageSize: parseInt(pageSize),
        totalCount: await usersCollection.countDocuments(query),
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching the user list.' });
  }
});*/

router.get('/me', verifyToken, async (req, res) => {
  try {
    const userId = req.auth.userId;
    const db = await connect();
    const user = await db.collection('Users').findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    const { password, ...userProfile } = user; // Remove sensitive data like password from the profile
    res.status(200).json({
      message: 'User profile retrieved successfully',
      profile: userProfile,
    });
  } catch (error) {
    console.error(`Error fetching user profile: ${error.message}`);
    res.status(500).json({ error: 'An error occurred while retrieving the user profile.' });
  }
});



router.get('/:userId', async (req, res) => {
  if (!req.auth) {
    return res.status(401).json({ error: 'Unauthorized: You must be logged in to view this information.' });
  }

  const { userId } = req.params;

  if (!ObjectId.isValid(userId)) {
    return res.status(400).json({ error: `Invalid userId: ${userId}` });
  }

  try {
    const db = await connect();
    
    const user = await db.collection('User').findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ error: `User with userId ${userId} not found.` });
    }

    const { password, ...userProfile } = user;
    res.status(200).json({
      message: 'User profile retrieved successfully',
      profile: userProfile,
    });
  } catch (error) {
    debugUser(`Error fetching user profile: ${error.message}`);
    res.status(500).json({ error: 'An error occurred while retrieving the user profile.' });
  }
});

router.post('/register', validBody(userSchema), async (req, res) => {
  const user = req.body;

  let existingUser = null;

  try {
    user.createdOn = new Date();
    existingUser = await getUserByEmail(user.email);
  } catch (error) {
    debugUser(error);
    res.status(500).json({ message: 'Error registering user' });
  }

  if (existingUser) {
    return res.status(400).json({ message: 'User\'s email already exists' });
  } else {
    try {
      user.password = await bcrypt.hash(user.password, 10);
      user.role = [user.role];

      const insertUserResult = await registerUser(user);

      if (insertUserResult.acknowledged) {
        const db = await connect(); 
        const editRecord = {
          timestamp: new Date(),
          col: "user",
          op: "insert",
          target: { userId: insertUserResult.insertedId },
          update: user
        };
        await db.collection('edits').insertOne(editRecord);

        const jwtToken = await issueAuthToken(user);
        await issueAuthCookie(res, jwtToken);

        res.status(201).json({ message: 'User registered correctly', role: user.role, email: user.email });
      } else {
        return res.status(500).json({ message: 'Error registering user' });
      }
    } catch (error) {
      debugUser(`Error during user registration process: ${error.message}`);
      res.status(500).json({ message: 'Error registering user' });
    }
  }
});


router.post('/login', validBody(loginSchema), async (req, res) => {
  const user = req.body;

  try {
    const existingUser = await getUserByEmail(user.email);
    if (!existingUser) {
      return res.status(200).json({ message: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(user.password, existingUser.password);
    if (!passwordMatch) {
      return res.status(200).json({ message: 'Invalid email or password' });
    }

    console.log("Existing user object:", existingUser);

    const roles = existingUser.role ? existingUser.role : [];
    
    const permissions = roles.length > 0 ? await getPermissionsByRoles(roles) : {};

    const authPayload = {
      userId: existingUser._id,
      email: existingUser.email,
      roles,
      permissions,
    };

    const jwtToken = await issueAuthToken(authPayload);
    await issueAuthCookie(res, jwtToken);

    res.status(200).json({ message: 'User logged in successfully', token: jwtToken });
  } catch (e) {
    debugUser(e);
    res.status(500).json({ message: 'Error logging in user' });
  }
});


router.patch('/:userId', validBody(updateUserSchema), async (req, res) => {
  if (!req.auth) {
    return res.status(401).json({ error: 'Unauthorized: You must be logged in to update user profiles.' });
  }

  const userIdToUpdate = req.params.userId;

  const { error, value } = updateUserSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ error: error.details.map(detail => detail.message) });
  }

  try {
    const db = await connect();
    const userCollection = db.collection('User');

    const targetUser = await userCollection.findOne({ _id: new ObjectId(userIdToUpdate) });
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const updateFields = { ...value, lastUpdatedOn: new Date(), lastUpdatedBy: req.auth.userId };

    if (updateFields.password) {
      updateFields.password = await bcrypt.hash(updateFields.password, 10);
    }

    await userCollection.updateOne(
      { _id: new ObjectId(userIdToUpdate) },
      { $set: updateFields }
    );

    const editRecord = {
      timestamp: new Date(),
      col: "user",
      op: "update",
      target: { userId: userIdToUpdate },
      update: updateFields,
      auth: req.auth
    };
    await db.collection('edits').insertOne(editRecord);

    if (req.auth.userId === userIdToUpdate) {
      const jwtToken = await issueAuthToken(updateFields);
      await issueAuthCookie(res, jwtToken);
    }

    res.status(200).json({
      message: 'User profile updated successfully.',
      updatedProfile: {
        email: updateFields.email || targetUser.email,
        givenName: updateFields.givenName || targetUser.givenName,
        familyName: updateFields.familyName || targetUser.familyName,
        role: updateFields.role || targetUser.role,
        lastUpdatedOn: updateFields.lastUpdatedOn,
      },
    });
  } catch (error) {
    console.error(`Error updating user profile: ${error.message}`);
    res.status(500).json({ error: 'An error occurred while updating the user profile.' });
  }
});


router.delete('/:userId', async (req, res) => {
  if (!req.auth) {
    return res.status(401).json({ error: 'Unauthorized: You must be logged in to delete a user.' });
  }

  const db = await connect();
  const { userId } = req.params;

  if (!ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  try {
    const user = await db.collection('User').findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const result = await db.collection('User').deleteOne({ _id: new ObjectId(userId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const editRecord = {
      timestamp: new Date(),
      col: "user",
      op: "delete",
      target: { userId },
      auth: req.auth
    };
    await db.collection('edits').insertOne(editRecord);

    res.status(200).json({ message: 'User deleted successfully', userId });
  } catch (err) {
    console.error(`Error deleting user: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});



router.put('/me', async (req, res) => {
  if (!req.auth) {
    return res.status(401).json({ error: 'Unauthorized: You must be logged in to update your profile.' });
  }

  const { error, value } = updateUserSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ error: error.details.map(detail => detail.message) });
  }

  try {
    const db = await connect();
    const usersCollection = db.collection('User'); 

    const userId = req.user._id; 
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ error: 'User no found.' });
    }

    const updateFields = { ...value };

    if (updateFields.role) {
      return res.status(403).json({ error: 'You cannot change your own role.' });
    }

    if (updateFields.password) {
      const hashedPassword = await bcrypt.hash(updateFields.password, 10);
      updateFields.password = hashedPassword;
    }

    updateFields.lastUpdatedOn = new Date();
    updateFields.lastUpdatedBy = {
      id: req.user._id, 
      email: req.user.email,
      role: req.user.role,
    };

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateFields }
    );

    res.status(200).json({ message: 'User profile updated successfully.' });
  } catch (error) {
    console.error(`Error updating user profile: ${error.message}`);
    res.status(500).json({ error: 'An error occurred while updating the user profile.' });
  }
});

export {router as userRouter}