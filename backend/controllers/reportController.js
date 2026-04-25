const Report = require("../models/Report");

const getReports = async (req, res) => {
  try {
    const filter = {};
    if (req.query.shelter) {
      // Return reports for the specific shelter OR any report marked as global
      filter.$or = [
        { shelter: req.query.shelter },
        { isGlobal: true }
      ];
    }
    if (req.query.reporterEmail) {
      filter.reporterEmail = req.query.reporterEmail;
    }
    const reports = await Report.find(filter).sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reports" });
  }
};

const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch report" });
  }
};

const createReport = async (req, res) => {
  try {
    const { title, description, location, dogId, reporterName, reporterPhone, reporterEmail, shelter, priority, dogCondition } = req.body;
    
    if (!title || !description || !location) {
      return res.status(400).json({ message: "Title, description, and location are required" });
    }

    const report = await Report.create({
      title,
      description,
      location,
      dogId,
      reporterName,
      reporterPhone,
      reporterEmail,
      shelter: shelter || "", 
      isGlobal: !shelter, // If no shelter provided, it's a global report
      priority: priority || "Medium",
      dogCondition,
      status: "New"
    });
    res.status(201).json(report);
  } catch (error) {
    console.error("Create report error:", error);
    res.status(500).json({ message: "Failed to create report" });
  }
};

const updateReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: "Failed to update report" });
  }
};

const deleteReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    res.status(200).json({ message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete report" });
  }
};

module.exports = {
  getReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
};
