const request = require("supertest");
const express = require("express");
const dashboardRoutes = require("../../backend/routes/dashboardRoutes");
const { getDashboardData } = require("../../backend/logic/dashboardLogic");
const auth = require("../../backend/middleware/auth.middleware");

jest.mock("../../backend/logic/dashboardLogic");
jest.mock("../../backend/middleware/auth.middleware", () => (req, res, next) => {
  req.user = { _id: "IAM_FAKE" };
  next();
});

const app = express();
app.use(express.json());
app.use("/api", dashboardRoutes);

describe("Dashboard API Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/dashboard", () => {
    it("should return dashboard data for an authenticated user", async () => {
      const mockDashboardData = {
        todaySpending: 100,
        recentTransactions: [{ amount: 20, name: "Coffee", category: "Food" }],
        balance: 500,
        monthlySpending: [],
        transactions: [],
      };

      getDashboardData.mockResolvedValue(mockDashboardData);

      const response = await request(app)
        .get("/api/dashboard")
        .set("Authorization", "Bearer mocktoken");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockDashboardData);
      expect(getDashboardData).toHaveBeenCalledWith("IAM_FAKE", "Bearer mocktoken");
    });

    it("should return 404 if user data is not found", async () => {
      getDashboardData.mockResolvedValue({ error: "User not found" });

      const response = await request(app)
        .get("/api/dashboard")
        .set("Authorization", "Bearer mocktoken");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "User not found" });
    });

    it("should return 500 if an error occurs", async () => {
      getDashboardData.mockRejectedValue(new Error("Database failure"));

      const response = await request(app)
        .get("/api/dashboard")
        .set("Authorization", "Bearer mocktoken");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: "Database failure" });
    });
  });
});
