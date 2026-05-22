const axios = require('axios');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const Progress = require('../models/Progress');
const { env } = require('../config/env');

const LANGUAGES = {
  java: { id: 62 },
  python: { id: 71 },
  cpp: { id: 54 }
};

const executeCodeOnJudge0 = async (source_code, language_id, stdin) => {
  const apiKey = env.judge0ApiKey;
  if (!apiKey) {
    throw new Error('Judge0 API key is missing on the server.');
  }

  const options = {
    method: 'POST',
    url: `${env.judge0ApiUrl}/submissions`,
    params: { base64_encoded: 'false', fields: '*' },
    headers: {
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': env.judge0ApiHost
    },
    data: {
      language_id,
      source_code,
      stdin: stdin || ''
    }
  };

  const response = await axios.request(options);
  const token = response.data.token;

  let result = null;
  let attempts = 0;
  while (attempts < 15) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const res = await axios.get(`${env.judge0ApiUrl}/submissions/${token}?base64_encoded=false`, {
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': env.judge0ApiHost
      }
    });
    
    if (res.data.status.id > 2) { // > 2 means finished processing
      result = res.data;
      break;
    }
    attempts++;
  }

  if (!result) {
    throw new Error('Execution timed out in sandbox environment');
  }

  return result;
};

// Helper to normalize outputs for comparison
const normalizeOutput = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/\r\n/g, '\n').trimEnd();
};

const runTestCases = async (code, language, testCases) => {
  const results = [];
  let totalRuntime = 0;
  let maxMemory = 0;
  let allPassed = true;
  let globalStatus = 'accepted';

  for (const tc of testCases) {
    try {
      const result = await executeCodeOnJudge0(code, LANGUAGES[language].id, tc.input);
      
      const compileError = result.status.id === 6;
      const runtimeError = result.status.id >= 7 && result.status.id <= 12;
      const timeLimit = result.status.id === 5;
      
      let passed = false;
      let actualOutput = normalizeOutput(result.stdout);
      const expectedOutput = normalizeOutput(tc.output);
      
      if (result.status.id === 3 && actualOutput === expectedOutput) {
        passed = true;
      } else if (result.status.id === 3) {
        globalStatus = 'wrong_answer';
      } else if (compileError) {
        globalStatus = 'compile_error';
      } else if (runtimeError) {
        globalStatus = 'runtime_error';
      } else if (timeLimit) {
        globalStatus = 'time_limit_exceeded';
      } else {
        globalStatus = 'error';
      }
      
      if (!passed) allPassed = false;
      
      const runtime = parseFloat(result.time) || 0;
      totalRuntime += runtime;
      maxMemory = Math.max(maxMemory, result.memory || 0);

      results.push({
        passed,
        input: tc.input,
        expectedOutput,
        actualOutput,
        status: result.status.description,
        runtime: result.time,
        memory: result.memory,
        errorOutput: result.compile_output || result.stderr || ''
      });
      
      // Short-circuit if compile error since it applies to all
      if (compileError) break;

    } catch (err) {
      allPassed = false;
      globalStatus = 'error';
      results.push({
        passed: false,
        input: tc.input,
        expectedOutput: normalizeOutput(tc.output),
        actualOutput: '',
        status: 'Server Error',
        runtime: '0',
        memory: 0,
        errorOutput: err.message
      });
    }
  }

  return {
    allPassed,
    globalStatus,
    passedCount: results.filter(r => r.passed).length,
    totalCount: testCases.length,
    runtime: totalRuntime,
    memory: maxMemory,
    testResults: results
  };
};

// @desc    Run code against visible test cases only
// @route   POST /api/submissions/run
// @access  Private
exports.runCode = async (req, res, next) => {
  try {
    const { problemId, language, code } = req.body;
    
    if (!LANGUAGES[language]) {
      return res.status(400).json({ success: false, message: 'Invalid language' });
    }

    const problem = await Problem.findOne({ id: problemId });
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    // Only run visible test cases
    const executionResult = await runTestCases(code, language, problem.testCases);

    res.json({
      success: true,
      data: executionResult
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit code against all test cases
// @route   POST /api/submissions/submit
// @access  Private
exports.submitCode = async (req, res, next) => {
  try {
    const { problemId, language, code } = req.body;

    if (!LANGUAGES[language]) {
      return res.status(400).json({ success: false, message: 'Invalid language' });
    }

    const problem = await Problem.findOne({ id: problemId });
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    // Combine visible and hidden test cases
    const allTestCases = [...problem.testCases, ...problem.hiddenTestCases];
    
    if (allTestCases.length === 0) {
      return res.status(400).json({ success: false, message: 'No test cases defined for this problem' });
    }

    const executionResult = await runTestCases(code, language, allTestCases);

    // Save submission record
    const submission = await Submission.create({
      user: req.user.id,
      problem: problem._id,
      problemId: problem.id,
      language,
      code,
      mode: 'submit',
      status: executionResult.globalStatus,
      passedCount: executionResult.passedCount,
      totalCount: executionResult.totalCount,
      runtime: executionResult.runtime,
      memory: executionResult.memory,
      // For security, don't save expected/actual for hidden test cases, or obscure them
      testResults: executionResult.testResults.map((tr, idx) => {
        if (idx >= problem.testCases.length) {
          return {
            passed: tr.passed,
            status: tr.status,
            runtime: tr.runtime,
            memory: tr.memory,
            input: 'Hidden Test Case',
            expectedOutput: 'Hidden',
            actualOutput: tr.passed ? 'Matched Expected' : 'Did Not Match Expected',
            errorOutput: tr.errorOutput
          };
        }
        return tr;
      })
    });

    // Update Progress model
    let progress = await Progress.findOne({ userId: req.user.id });
    if (!progress) {
      progress = await Progress.create({ userId: req.user.id, problems: [] });
    }

    const problemIndex = progress.problems.findIndex(p => p.problemId === problemId);
    
    const isSolved = executionResult.allPassed;
    const newStatus = isSolved ? 'solved' : 'attempted';

    if (problemIndex > -1) {
      // Update existing progress but don't downgrade from solved to attempted
      if (progress.problems[problemIndex].status !== 'solved' || isSolved) {
        progress.problems[problemIndex].status = newStatus;
      }
      if (isSolved && !progress.problems[problemIndex].solvedAt) {
        progress.problems[problemIndex].solvedAt = new Date();
      }
      progress.problems[problemIndex].updatedAt = new Date();
    } else {
      progress.problems.push({
        problemId,
        status: newStatus,
        solvedAt: isSolved ? new Date() : null
      });
    }

    await progress.save();

    res.status(201).json({
      success: true,
      data: submission
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user submissions for a problem
// @route   GET /api/submissions/problem/:problemId
// @access  Private
exports.getProblemSubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find({ 
      user: req.user.id, 
      problemId: req.params.problemId,
      mode: 'submit' 
    })
    .select('-testResults') // Don't return full test results in the list view
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: submissions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single submission by ID
// @route   GET /api/submissions/:id
// @access  Private
exports.getSubmission = async (req, res, next) => {
  try {
    const submission = await Submission.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    res.json({
      success: true,
      data: submission
    });
  } catch (error) {
    next(error);
  }
};
