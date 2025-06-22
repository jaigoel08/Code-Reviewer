const aiService = require("../service/geminiService")


module.exports.getReview = async (req, res) => {
    const code = req.body.code;
    if (!code) {
        return res.status(400).send("Prompt is required");
    }
    const response = await aiService.generateContent(code);
    res.send(response);
};

module.exports.generateCode = async (req, res) => {
    const prompt = req.body.prompt;
    if (!prompt) {
        return res.status(400).send("Prompt is required");
    }
    const response = await aiService.generateCodeFromPrompt(prompt);
    res.send(response);
};

module.exports.getOutput = async (req, res) => {
    const code = req.body.code;
    if (!code) {
        return res.status(400).send("Code is required");
    }
    const response = await aiService.getOutput(code);
    res.send(response);
};