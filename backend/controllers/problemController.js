const Problem = require('../models/Problem');

// @desc    Get all active problems
// @route   GET /api/problems
// @access  Public
exports.getProblems = async (req, res, next) => {
  try {
    const problems = await Problem.find({ isActive: true })
      .select('-testCases -hiddenTestCases -createdBy -updatedBy')
      .sort({ sheet: 1, section: 1, id: 1 });

    res.json({
      success: true,
      count: problems.length,
      data: problems
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single problem by ID or slug
// @route   GET /api/problems/:id
// @access  Public
exports.getProblem = async (req, res, next) => {
  try {
    const problem = await Problem.findOne({ 
      $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { id: req.params.id }],
      isActive: true
    }).select('-hiddenTestCases -createdBy -updatedBy');

    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found or inactive' });
    }

    res.json({
      success: true,
      data: problem
    });
  } catch (error) {
    next(error);
  }
};
