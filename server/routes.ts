import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertApplicationSchema, insertSuggestionSchema, insertOpportunitySchema, insertNgoSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes (/api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);

  // NGO routes
  app.get("/api/ngos", async (req, res) => {
    try {
      const ngos = await storage.getNgos();
      res.json(ngos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch NGOs" });
    }
  });

  app.get("/api/ngos/:id", async (req, res) => {
    try {
      const ngoId = parseInt(req.params.id);
      
      if (isNaN(ngoId)) {
        return res.status(400).json({ message: "Invalid NGO ID" });
      }
      
      const ngo = await storage.getNgo(ngoId);
      
      if (!ngo) {
        return res.status(404).json({ message: "NGO not found" });
      }
      
      res.json(ngo);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch NGO" });
    }
  });

  app.post("/api/ngos", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.userType !== "recruiter") {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const parsedData = insertNgoSchema.parse(req.body);
      const ngo = await storage.createNgo(parsedData);
      
      // Update the user with the NGO ID
      await storage.updateUser(req.user.id, { ngoId: ngo.id });
      
      res.status(201).json(ngo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create NGO" });
    }
  });

  // Opportunity routes
  app.get("/api/opportunities", async (req, res) => {
    try {
      let opportunities;
      
      if (req.query.ngoId) {
        const ngoId = parseInt(req.query.ngoId as string);
        opportunities = await storage.getOpportunitiesByNgo(ngoId);
      } else if (req.query.cause) {
        const cause = req.query.cause as string;
        opportunities = await storage.getOpportunitiesByCause(cause);
      } else {
        opportunities = await storage.getOpportunities();
      }
      
      // Filter out deleted opportunities
      opportunities = opportunities.filter(opp => !opp.deleted);
      
      res.json(opportunities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch opportunities" });
    }
  });

  app.get("/api/opportunities/:id", async (req, res) => {
    try {
      const opportunityId = parseInt(req.params.id);
      
      if (isNaN(opportunityId)) {
        return res.status(400).json({ message: "Invalid opportunity ID" });
      }
      
      const opportunity = await storage.getOpportunity(opportunityId);
      
      if (!opportunity) {
        return res.status(404).json({ message: "Opportunity not found" });
      }
      
      // Check if the opportunity is deleted
      if (opportunity.deleted) {
        return res.status(404).json({ message: "Opportunity not found or has been deleted" });
      }
      
      res.json(opportunity);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch opportunity" });
    }
  });

  app.post("/api/opportunities", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.userType !== "recruiter") {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      if (!req.user.ngoId) {
        return res.status(400).json({ message: "Recruiter must be associated with an NGO" });
      }
      
      // Process date strings to Date objects before validation
      const requestData = { ...req.body, ngoId: req.user.ngoId };
      
      // Convert date strings to Date objects if they are provided
      if (requestData.startDate && typeof requestData.startDate === 'string') {
        requestData.startDate = new Date(requestData.startDate);
      }
      
      if (requestData.endDate && typeof requestData.endDate === 'string') {
        requestData.endDate = new Date(requestData.endDate);
      }
      
      // Now parse with schema
      const parsedData = insertOpportunitySchema.parse(requestData);
      
      // Log parsed data for debugging
      console.log("Parsed opportunity data:", parsedData);
      
      const opportunity = await storage.createOpportunity(parsedData);
      res.status(201).json(opportunity);
    } catch (error) {
      console.error("Error creating opportunity:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create opportunity" });
    }
  });
  
  // Delete an opportunity
  app.delete("/api/opportunities/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.userType !== "recruiter") {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const opportunityId = parseInt(req.params.id);
      
      if (isNaN(opportunityId)) {
        return res.status(400).json({ message: "Invalid opportunity ID" });
      }
      
      const opportunity = await storage.getOpportunity(opportunityId);
      
      if (!opportunity) {
        return res.status(404).json({ message: "Opportunity not found" });
      }
      
      // Check if the recruiter is associated with the NGO that owns this opportunity
      if (!req.user.ngoId || opportunity.ngoId !== req.user.ngoId) {
        return res.status(403).json({ message: "Not authorized to delete this opportunity" });
      }
      
      // In our current MemStorage there's no delete method, so we'll update the opportunity to mark it as deleted
      await storage.updateOpportunity(opportunityId, { deleted: true });
      
      res.json({ message: "Opportunity deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete opportunity" });
    }
  });

  // Application routes
  app.get("/api/applications", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      let applications;
      
      if (req.user.userType === "volunteer") {
        applications = await storage.getApplicationsByVolunteer(req.user.id);
      } else if (req.user.userType === "recruiter") {
        if (!req.user.ngoId) {
          return res.status(400).json({ message: "Recruiter must be associated with an NGO" });
        }
        applications = await storage.getApplicationsByNgo(req.user.ngoId);
      } else {
        return res.status(403).json({ message: "Invalid user type" });
      }
      
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.post("/api/applications", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.userType !== "volunteer") {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const opportunityId = parseInt(req.body.opportunityId);
      const opportunity = await storage.getOpportunity(opportunityId);
      
      if (!opportunity) {
        return res.status(404).json({ message: "Opportunity not found" });
      }
      
      // Check if the opportunity is deleted
      if (opportunity.deleted) {
        return res.status(404).json({ message: "Opportunity not found or has been deleted" });
      }
      
      // Check if the volunteer has already applied for this opportunity
      const existingApplications = await storage.getApplicationsByVolunteer(req.user.id);
      const alreadyApplied = existingApplications.some(app => app.opportunityId === opportunityId);
      
      if (alreadyApplied) {
        return res.status(400).json({ message: "You have already applied for this opportunity" });
      }
      
      const parsedData = insertApplicationSchema.parse({
        volunteerId: req.user.id,
        opportunityId,
        ngoId: opportunity.ngoId,
        message: req.body.message || "",
        resume: req.body.resume || null,
        status: "pending"
      });
      
      const application = await storage.createApplication(parsedData);
      res.status(201).json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  app.patch("/api/applications/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.userType !== "recruiter") {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const applicationId = parseInt(req.params.id);
      
      if (isNaN(applicationId)) {
        return res.status(400).json({ message: "Invalid application ID" });
      }
      
      const application = await storage.getApplication(applicationId);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      if (!req.user.ngoId || application.ngoId !== req.user.ngoId) {
        return res.status(403).json({ message: "Not authorized to update this application" });
      }
      
      const status = req.body.status;
      if (!status || !["pending", "accepted", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updatedApplication = await storage.updateApplication(applicationId, { status });
      res.json(updatedApplication);
    } catch (error) {
      res.status(500).json({ message: "Failed to update application" });
    }
  });

  // Suggestion routes
  app.get("/api/suggestions", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      let suggestions;
      
      if (req.user.userType === "volunteer") {
        suggestions = await storage.getSuggestionsByVolunteer(req.user.id);
      } else if (req.user.userType === "recruiter") {
        if (!req.user.ngoId) {
          return res.status(400).json({ message: "Recruiter must be associated with an NGO" });
        }
        suggestions = await storage.getSuggestionsByNgo(req.user.ngoId);
      } else {
        return res.status(403).json({ message: "Invalid user type" });
      }
      
      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch suggestions" });
    }
  });

  app.post("/api/suggestions", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.userType !== "volunteer") {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const ngoId = parseInt(req.body.ngoId);
      const ngo = await storage.getNgo(ngoId);
      
      if (!ngo) {
        return res.status(404).json({ message: "NGO not found" });
      }
      
      const parsedData = insertSuggestionSchema.parse({
        volunteerId: req.user.id,
        ngoId,
        content: req.body.content
      });
      
      const suggestion = await storage.createSuggestion(parsedData);
      res.status(201).json(suggestion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create suggestion" });
    }
  });

  // User profile route
  app.get("/api/profile", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      res.json(req.user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });
  
  // Debug endpoint to check all users - for development only
  app.get("/api/debug/users", async (req, res) => {
    try {
      // Get users from storage instead of accessing the map directly
      const volunteers = await storage.getVolunteers();
      const recruiters = await storage.getRecruiters();
      const users = [...volunteers, ...recruiters].map(user => {
        // Return a sanitized version without password
        const { password, ...userInfo } = user as any;
        return { ...userInfo, hasPassword: !!password };
      });
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users data" });
    }
  });

  app.patch("/api/profile", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Exclude sensitive or immutable fields
      const { password, id, username, email, userType, ...updateData } = req.body;
      
      const updatedUser = await storage.updateUser(req.user.id, updateData);
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
