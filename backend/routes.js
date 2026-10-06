const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const {
  User,
  Investigation
} = require("./models");

const {
  protect,
  adminOnly,
  calculateRisk
} = require("./middleware");

const router = express.Router();

// ======================================================
// REAL AIRCRAFT + ATMOSPHERIC DATA
// ======================================================

// GET LIVE AIRCRAFT DATA FROM OPENSKY
router.get(
  "/external/aircraft",
  protect,
  async (req, res) => {
    try {
      const {
        lat,
        lon,
        radius = 1
      } = req.query;

      if (!lat || !lon) {
        return res.status(400).json({
          message: "Latitude and longitude are required"
        });
      }

      const latitude = Number(lat);
      const longitude = Number(lon);
      const r = Number(radius);

      if (
        Number.isNaN(latitude) ||
        Number.isNaN(longitude) ||
        Number.isNaN(r)
      ) {
        return res.status(400).json({
          message: "Latitude, longitude and radius must be numbers"
        });
      }

      const lamin = latitude - r;
      const lamax = latitude + r;
      const lomin = longitude - r;
      const lomax = longitude + r;

      const url =
        `https://opensky-network.org/api/states/all` +
        `?lamin=${lamin}` +
        `&lomin=${lomin}` +
        `&lamax=${lamax}` +
        `&lomax=${lomax}`;

      const response = await fetch(url);

      if (!response.ok) {
        return res.status(response.status).json({
          message: "OpenSky aircraft data could not be loaded"
        });
      }

      const data = await response.json();

      const aircraft = (data.states || [])
        .filter((item) => item[5] !== null && item[6] !== null)
        .slice(0, 20)
        .map((item) => ({
          icao24: item[0],
          callsign: item[1]?.trim() || "Unknown",
          originCountry: item[2] || "Unknown",

          longitude: item[5],
          latitude: item[6],

          barometricAltitude: item[7],
          onGround: item[8],

          velocity: item[9],
          heading: item[10],
          verticalRate: item[11],

          geometricAltitude: item[13],

          squawk: item[14],
          category: item[17]
        }));

      res.json({
        source: "OpenSky Network",
        retrievedAt: new Date().toISOString(),
        count: aircraft.length,
        aircraft
      });

    } catch (error) {
      console.error(
        "OpenSky error:",
        error.message
      );

      res.status(500).json({
        message: "Could not fetch aircraft data",
        error: error.message
      });
    }
  }
);


// GET REAL ATMOSPHERIC DATA FROM OPEN-METEO
router.get(
  "/external/weather",
  protect,
  async (req, res) => {
    try {
      const {
        lat,
        lon
      } = req.query;

      if (!lat || !lon) {
        return res.status(400).json({
          message: "Latitude and longitude are required"
        });
      }

      const latitude = Number(lat);
      const longitude = Number(lon);

      if (
        Number.isNaN(latitude) ||
        Number.isNaN(longitude)
      ) {
        return res.status(400).json({
          message: "Latitude and longitude must be numbers"
        });
      }

      const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${encodeURIComponent(latitude)}` +
        `&longitude=${encodeURIComponent(longitude)}` +
        `&current=temperature_2m,relative_humidity_2m,pressure_msl,cloud_cover,wind_speed_10m,wind_direction_10m` +
        `&hourly=temperature_300hPa,relative_humidity_300hPa,cloud_cover_300hPa,wind_speed_300hPa,wind_direction_300hPa,geopotential_height_300hPa` +
        `&forecast_hours=1` +
        `&timezone=auto`;

      const response = await fetch(url);

      if (!response.ok) {
        return res.status(response.status).json({
          message: "Open-Meteo weather data could not be loaded"
        });
      }

      const data = await response.json();

      res.json({
        source: "Open-Meteo",

        retrievedAt: new Date().toISOString(),

        location: {
          latitude,
          longitude
        },

        current: {
          temperature:
            data.current?.temperature_2m,

          humidity:
            data.current?.relative_humidity_2m,

          pressure:
            data.current?.pressure_msl,

          cloudCover:
            data.current?.cloud_cover,

          windSpeed:
            data.current?.wind_speed_10m,

          windDirection:
            data.current?.wind_direction_10m
        },

        atmospheric: {
          pressureLevel: "300 hPa",

          temperature:
            data.hourly?.temperature_300hPa?.[0],

          humidity:
            data.hourly?.relative_humidity_300hPa?.[0],

          cloudCover:
            data.hourly?.cloud_cover_300hPa?.[0],

          windSpeed:
            data.hourly?.wind_speed_300hPa?.[0],

          windDirection:
            data.hourly?.wind_direction_300hPa?.[0],

          geopotentialHeight:
            data.hourly?.geopotential_height_300hPa?.[0]
        }
      });

    } catch (error) {
      console.error(
        "Open-Meteo error:",
        error.message
      );

      res.status(500).json({
        message: "Could not fetch atmospheric data",
        error: error.message
      });
    }
  }
);


// ======================================================
// AUTHENTICATION
// ======================================================

// REGISTER
router.post(
  "/auth/register",
  async (req, res) => {
    try {
      const {
        name,
        email,
        password,
        role
      } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          message:
            "Name, email and password are required"
        });
      }

      const existingUser =
        await User.findOne({
          email: email.toLowerCase()
        });

      if (existingUser) {
        return res.status(400).json({
          message: "User already exists"
        });
      }

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      const user =
        await User.create({
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
          role: role || "investigator"
        });

      res.status(201).json({
        message:
          "Registration successful",

        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });

    } catch (error) {
      res.status(500).json({
        message:
          "Registration failed",
        error: error.message
      });
    }
  }
);


// LOGIN
router.post(
  "/auth/login",
  async (req, res) => {
    try {
      const {
        email,
        password
      } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          message:
            "Email and password are required"
        });
      }

      const user =
        await User.findOne({
          email: email.toLowerCase()
        });

      if (!user) {
        return res.status(401).json({
          message:
            "Invalid email or password"
        });
      }

      const passwordMatch =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!passwordMatch) {
        return res.status(401).json({
          message:
            "Invalid email or password"
        });
      }

      const token =
        jwt.sign(
          {
            id: user._id,
            name: user.name,
            role: user.role
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "1d"
          }
        );

      res.json({
        message:
          "Login successful",

        token,

        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });

    } catch (error) {
      res.status(500).json({
        message:
          "Login failed",
        error: error.message
      });
    }
  }
);


// ======================================================
// DASHBOARD STATISTICS
// ======================================================

router.get(
  "/investigations/stats",
  protect,
  async (req, res) => {
    try {
      const [
        total,
        highRisk,
        mediumRisk,
        lowRisk,
        underInvestigation,
        completed,
        resolved,
        recent
      ] = await Promise.all([

        Investigation.countDocuments(),

        Investigation.countDocuments({
          riskLevel: "High"
        }),

        Investigation.countDocuments({
          riskLevel: "Medium"
        }),

        Investigation.countDocuments({
          riskLevel: "Low"
        }),

        Investigation.countDocuments({
          status: "Under Investigation"
        }),

        Investigation.countDocuments({
          status: "Completed"
        }),

        Investigation.countDocuments({
          status: "Resolved"
        }),

        Investigation.find()
          .sort({
            createdAt: -1
          })
          .limit(5)
      ]);

      res.json({
        total,
        highRisk,
        mediumRisk,
        lowRisk,
        underInvestigation,
        completed,
        resolved,
        recent
      });

    } catch (error) {
      res.status(500).json({
        message:
          "Could not load statistics",
        error: error.message
      });
    }
  }
);


// ======================================================
// GET ALL INVESTIGATIONS
// ======================================================

router.get(
  "/investigations",
  protect,
  async (req, res) => {
    try {
      const investigations =
        await Investigation.find()
          .sort({
            createdAt: -1
          });

      res.json(
        investigations
      );

    } catch (error) {
      res.status(500).json({
        message:
          "Could not load investigations",
        error: error.message
      });
    }
  }
);


// ======================================================
// GET SINGLE INVESTIGATION
// ======================================================

router.get(
  "/investigations/:id",
  protect,
  async (req, res) => {
    try {
      const investigation =
        await Investigation.findById(
          req.params.id
        );

      if (!investigation) {
        return res.status(404).json({
          message:
            "Investigation not found"
        });
      }

      res.json(
        investigation
      );

    } catch (error) {
      res.status(500).json({
        message:
          "Could not load investigation",
        error: error.message
      });
    }
  }
);


// ======================================================
// CREATE INVESTIGATION
// ======================================================

router.post(
  "/investigations",
  protect,
  async (req, res) => {
    try {
      const risk =
        calculateRisk(
          req.body
        );

      const investigation =
        await Investigation.create({
          ...req.body,

          riskScore:
            risk.riskScore,

          riskLevel:
            risk.riskLevel
        });

      res.status(201).json({
        message:
          "Investigation created successfully",

        investigation
      });

    } catch (error) {
      res.status(400).json({
        message:
          "Could not create investigation",

        error:
          error.message
      });
    }
  }
);


// ======================================================
// UPDATE INVESTIGATION
// ======================================================

router.put(
  "/investigations/:id",
  protect,
  async (req, res) => {
    try {
      const risk =
        calculateRisk(
          req.body
        );

      const investigation =
        await Investigation.findByIdAndUpdate(
          req.params.id,

          {
            ...req.body,

            riskScore:
              risk.riskScore,

            riskLevel:
              risk.riskLevel
          },

          {
            new: true,
            runValidators: true
          }
        );

      if (!investigation) {
        return res.status(404).json({
          message:
            "Investigation not found"
        });
      }

      res.json({
        message:
          "Investigation updated successfully",

        investigation
      });

    } catch (error) {
      res.status(400).json({
        message:
          "Could not update investigation",

        error:
          error.message
      });
    }
  }
);


// ======================================================
// DELETE INVESTIGATION
// ADMIN ONLY
// ======================================================

router.delete(
  "/investigations/:id",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const investigation =
        await Investigation.findByIdAndDelete(
          req.params.id
        );

      if (!investigation) {
        return res.status(404).json({
          message:
            "Investigation not found"
        });
      }

      res.json({
        message:
          "Investigation deleted successfully"
      });

    } catch (error) {
      res.status(500).json({
        message:
          "Could not delete investigation",

        error:
          error.message
      });
    }
  }
);


module.exports = router;