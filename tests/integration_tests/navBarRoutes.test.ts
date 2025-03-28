// Import Jest types
import { describe, it, expect } from '@jest/globals';
const request1 = require("supertest");
const express1 = require("express");
const navBarRoutes = require('../../backend/routes/navBarRoutes');

const app1 = express1();
app1.use(express1.json());
app1.use("/api", navBarRoutes);

describe("NavBar API Integration Tests", () => {
  describe("GET /api/dashboard", () => {
    it("should return the dashboard page", async () => {
      const response = await request1(app1).get("/api/dashboard");
      expect(response.status).toBe(200);
    });
  });

  describe("GET /api/transactions", () => {
    it("should return the transactions page", async () => {
      const response = await request1(app1).get("/api/transactions");
      expect(response.status).toBe(200);
    });
  });

  describe("GET /api/analytics", () => {
    it("should return the analytics page", async () => {
      const response = await request1(app1).get("/api/analytics");
      expect(response.status).toBe(200);
      expect(response.text).toBe("/analytics");
    });
  });

  describe("GET /api/goals", () => {
    it("should return the goals page", async () => {
      const response = await request1(app1).get("/api/goals");
      expect(response.status).toBe(200);
      expect(response.text).toBe("/goals");
    });
  });

  describe("GET /api/settings", () => {
    it("should return the settings page", async () => {
      const response = await request1(app1).get("/api/settings");
      expect(response.status).toBe(200);
      expect(response.text).toBe("/settings");
    });
  });

  describe("GET /api/profile", () => {
    it("should return the profile page", async () => {
      const response = await request1(app1).get("/api/profile");
      expect(response.status).toBe(200);
      expect(response.text).toBe("/profile");
    });
  });
});
