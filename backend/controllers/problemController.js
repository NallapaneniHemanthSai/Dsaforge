const Problem = require('../models/Problem');
const catalog = require('../../frontend/src/data/problems/catalog.json');

const defaultStarterCode = {
  java: 'class Solution {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}',
  python: 'def solve():\n    # Write your code here\n    pass\n\nif __name__ == "__main__":\n    solve()',
  cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}',
};

const normalizeCatalogProblem = (problem) => ({
  ...problem,
  _id: problem.id,
  externalLink: problem.externalLink || problem.link || '',
  description: problem.description || `Practice ${problem.title} from the ${problem.sheet} sheet. Use the external link for the full original statement when needed.`,
  constraints: problem.constraints || [],
  examples: problem.examples || [],
  starterCode: problem.starterCode || defaultStarterCode,
  testCases: problem.testCases || [],
  isActive: true,
  source: 'catalog',
});

const catalogProblems = (catalog.problems || []).map(normalizeCatalogProblem);

const findCatalogProblem = (id) => catalogProblems.find((problem) => problem.id === id);

// @desc    Get all active problems
// @route   GET /api/problems
// @access  Public
exports.getProblems = async (req, res, next) => {
  try {
    const problems = await Problem.find({ isActive: true })
      .select('-testCases -hiddenTestCases -createdBy -updatedBy')
      .sort({ sheet: 1, section: 1, id: 1 });

    if (!problems.length) {
      return res.json({
        success: true,
        count: catalogProblems.length,
        data: catalogProblems,
        source: 'catalog-fallback'
      });
    }

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
    let problem = await Problem.findOne({ 
      $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { id: req.params.id }],
      isActive: true
    }).select('-hiddenTestCases -createdBy -updatedBy');

    if (!problem) {
      problem = findCatalogProblem(req.params.id);
    }

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
