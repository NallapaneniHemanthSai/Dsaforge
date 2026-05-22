const Program = require('../models/Program');

// Get all programs for the logged-in user
exports.getPrograms = async (req, res, next) => {
  try {
    const programs = await Program.find({ user: req.user.id }).sort({ updatedAt: -1 });
    res.json({
      success: true,
      count: programs.length,
      data: programs
    });
  } catch (error) {
    next(error);
  }
};

// Get a single program by ID
exports.getProgram = async (req, res, next) => {
  try {
    const program = await Program.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }

    res.json({ success: true, data: program });
  } catch (error) {
    next(error);
  }
};

// Create a new program
exports.createProgram = async (req, res, next) => {
  try {
    const { title, language, code } = req.body;
    
    if (!title || !language || !code) {
      return res.status(400).json({ success: false, message: 'Please provide title, language, and code' });
    }

    const program = await Program.create({
      title,
      language,
      code,
      user: req.user.id
    });

    res.status(201).json({ success: true, data: program });
  } catch (error) {
    next(error);
  }
};

// Update an existing program
exports.updateProgram = async (req, res, next) => {
  try {
    const { title, language, code } = req.body;

    let program = await Program.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }

    program.title = title || program.title;
    program.language = language || program.language;
    program.code = code || program.code;

    await program.save();

    res.json({ success: true, data: program });
  } catch (error) {
    next(error);
  }
};

// Delete a program
exports.deleteProgram = async (req, res, next) => {
  try {
    const program = await Program.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }

    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
