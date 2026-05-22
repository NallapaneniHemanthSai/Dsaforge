const Problem = require('../models/Problem');

// @desc    Get all problems (admin view)
// @route   GET /api/admin/problems
// @access  Private/Admin
exports.getAdminProblems = async (req, res, next) => {
  try {
    const problems = await Problem.find({}).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: problems.length,
      data: problems
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single problem
// @route   GET /api/admin/problems/:id
// @access  Private/Admin
exports.getAdminProblem = async (req, res, next) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }
    res.json({ success: true, data: problem });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new problem
// @route   POST /api/admin/problems
// @access  Private/Admin
exports.createProblem = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    const problem = await Problem.create(req.body);
    res.status(201).json({ success: true, data: problem });
  } catch (error) {
    next(error);
  }
};

// @desc    Update problem
// @route   PATCH /api/admin/problems/:id
// @access  Private/Admin
exports.updateProblem = async (req, res, next) => {
  try {
    req.body.updatedBy = req.user.id;
    const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    res.json({ success: true, data: problem });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete/Soft-delete problem
// @route   DELETE /api/admin/problems/:id
// @access  Private/Admin
exports.deleteProblem = async (req, res, next) => {
  try {
    const problem = await Problem.findById(req.params.id);
    
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    // Soft delete by setting isActive to false
    problem.isActive = false;
    await problem.save();

    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk import problems
// @route   POST /api/admin/problems/import
// @access  Private/Admin
exports.importProblems = async (req, res, next) => {
  try {
    const problemsData = req.body.problems;
    
    if (!Array.isArray(problemsData)) {
      return res.status(400).json({ success: false, message: 'Please provide an array of problems' });
    }

    const problemsToInsert = problemsData.map(p => ({
      ...p,
      createdBy: req.user.id
    }));

    const result = await Problem.insertMany(problemsToInsert, { ordered: false });
    
    res.status(201).json({
      success: true,
      count: result.length,
      message: 'Problems imported successfully'
    });
  } catch (error) {
    // If it's a bulk write error, still return what succeeded
    if (error.code === 11000) {
      return res.status(207).json({ 
        success: true, 
        message: 'Some problems imported, but duplicates were skipped',
        error: error.message
      });
    }
    next(error);
  }
};
