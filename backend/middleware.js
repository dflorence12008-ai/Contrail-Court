const jwt = require("jsonwebtoken");

// ================= AUTHENTICATION =================

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};

// ================= ADMIN ONLY =================

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required"
    });
  }

  next();
};

// ================= RISK CALCULATION =================

const calculateRisk = (data) => {
  let score = 0;

  const atmosphere = data.atmosphericConditions || {};
  const contrail = data.contrailObservation || {};

  // Contrail observed
  if (contrail.observed) {
    score += 30;
  }

  // Temperature
  if (atmosphere.temperature <= -40) {
    score += 25;
  } else if (atmosphere.temperature <= -20) {
    score += 15;
  }

  // Humidity
  if (atmosphere.humidity >= 80) {
    score += 25;
  } else if (atmosphere.humidity >= 60) {
    score += 15;
  }

  // Altitude
  if (Number(data.altitude) >= 30000) {
    score += 10;
  }

  // Persistence
  if (
    String(contrail.persistence || "")
      .toLowerCase()
      .includes("persistent")
  ) {
    score += 15;
  }

  let level = "Low";

  if (score >= 60) {
    level = "High";
  } else if (score >= 30) {
    level = "Medium";
  }

  return {
    riskScore: score,
    riskLevel: level
  };
};

module.exports = {
  protect,
  adminOnly,
  calculateRisk
};