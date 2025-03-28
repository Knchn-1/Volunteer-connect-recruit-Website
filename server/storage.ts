import { users, type User, type InsertUser, ngos, type NGO, type InsertNGO, opportunities, type Opportunity, type InsertOpportunity, applications, type Application, type InsertApplication, suggestions, type Suggestion, type InsertSuggestion } from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  getVolunteers(): Promise<User[]>;
  getRecruiters(): Promise<User[]>;
  
  // NGO operations
  getNgo(id: number): Promise<NGO | undefined>;
  getNgos(): Promise<NGO[]>;
  getNgosByCause(cause: string): Promise<NGO[]>;
  createNgo(ngo: InsertNGO): Promise<NGO>;
  updateNgo(id: number, ngo: Partial<NGO>): Promise<NGO | undefined>;
  
  // Opportunity operations
  getOpportunity(id: number): Promise<Opportunity | undefined>;
  getOpportunities(): Promise<Opportunity[]>;
  getOpportunitiesByNgo(ngoId: number): Promise<Opportunity[]>;
  getOpportunitiesByCause(cause: string): Promise<Opportunity[]>;
  createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity>;
  updateOpportunity(id: number, opportunity: Partial<Opportunity>): Promise<Opportunity | undefined>;
  
  // Application operations
  getApplication(id: number): Promise<Application | undefined>;
  getApplicationsByVolunteer(volunteerId: number): Promise<Application[]>;
  getApplicationsByNgo(ngoId: number): Promise<Application[]>;
  getApplicationsByOpportunity(opportunityId: number): Promise<Application[]>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: number, application: Partial<Application>): Promise<Application | undefined>;
  
  // Suggestion operations
  getSuggestion(id: number): Promise<Suggestion | undefined>;
  getSuggestionsByNgo(ngoId: number): Promise<Suggestion[]>;
  getSuggestionsByVolunteer(volunteerId: number): Promise<Suggestion[]>;
  createSuggestion(suggestion: InsertSuggestion): Promise<Suggestion>;
  
  // Session store
  sessionStore: session.Store;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  // Make usersMap public for debug purposes
  usersMap: Map<number, User>;
  private ngosMap: Map<number, NGO>;
  private opportunitiesMap: Map<number, Opportunity>;
  private applicationsMap: Map<number, Application>;
  private suggestionsMap: Map<number, Suggestion>;
  
  userCurrentId: number;
  ngoCurrentId: number;
  opportunityCurrentId: number;
  applicationCurrentId: number;
  suggestionCurrentId: number;
  
  sessionStore: session.Store;
  
  constructor() {
    this.usersMap = new Map();
    this.ngosMap = new Map();
    this.opportunitiesMap = new Map();
    this.applicationsMap = new Map();
    this.suggestionsMap = new Map();
    
    this.userCurrentId = 1;
    this.ngoCurrentId = 1;
    this.opportunityCurrentId = 1;
    this.applicationCurrentId = 1;
    this.suggestionCurrentId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // One day
    });
    
    // Add some demo data
    this.seedData();
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.usersMap.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.usersMap.set(id, updatedUser);
    return updatedUser;
  }
  
  async getVolunteers(): Promise<User[]> {
    return Array.from(this.usersMap.values()).filter(
      (user) => user.userType === 'volunteer'
    );
  }
  
  async getRecruiters(): Promise<User[]> {
    return Array.from(this.usersMap.values()).filter(
      (user) => user.userType === 'recruiter'
    );
  }
  
  // NGO operations
  async getNgo(id: number): Promise<NGO | undefined> {
    return this.ngosMap.get(id);
  }
  
  async getNgos(): Promise<NGO[]> {
    return Array.from(this.ngosMap.values());
  }
  
  async getNgosByCause(cause: string): Promise<NGO[]> {
    return Array.from(this.ngosMap.values()).filter(
      (ngo) => ngo.cause.toLowerCase() === cause.toLowerCase()
    );
  }
  
  async createNgo(insertNgo: InsertNGO): Promise<NGO> {
    const id = this.ngoCurrentId++;
    const ngo: NGO = { ...insertNgo, id };
    this.ngosMap.set(id, ngo);
    return ngo;
  }
  
  async updateNgo(id: number, ngoData: Partial<NGO>): Promise<NGO | undefined> {
    const ngo = await this.getNgo(id);
    if (!ngo) return undefined;
    
    const updatedNgo = { ...ngo, ...ngoData };
    this.ngosMap.set(id, updatedNgo);
    return updatedNgo;
  }
  
  // Opportunity operations
  async getOpportunity(id: number): Promise<Opportunity | undefined> {
    return this.opportunitiesMap.get(id);
  }
  
  async getOpportunities(): Promise<Opportunity[]> {
    return Array.from(this.opportunitiesMap.values());
  }
  
  async getOpportunitiesByNgo(ngoId: number): Promise<Opportunity[]> {
    return Array.from(this.opportunitiesMap.values()).filter(
      (opportunity) => opportunity.ngoId === ngoId
    );
  }
  
  async getOpportunitiesByCause(cause: string): Promise<Opportunity[]> {
    const ngosWithCause = await this.getNgosByCause(cause);
    const ngoIds = ngosWithCause.map(ngo => ngo.id);
    
    return Array.from(this.opportunitiesMap.values()).filter(
      (opportunity) => ngoIds.includes(opportunity.ngoId)
    );
  }
  
  async createOpportunity(insertOpportunity: InsertOpportunity): Promise<Opportunity> {
    const id = this.opportunityCurrentId++;
    const opportunity: Opportunity = { 
      ...insertOpportunity, 
      id, 
      createdAt: new Date() 
    };
    this.opportunitiesMap.set(id, opportunity);
    return opportunity;
  }
  
  async updateOpportunity(id: number, opportunityData: Partial<Opportunity>): Promise<Opportunity | undefined> {
    const opportunity = await this.getOpportunity(id);
    if (!opportunity) return undefined;
    
    const updatedOpportunity = { ...opportunity, ...opportunityData };
    this.opportunitiesMap.set(id, updatedOpportunity);
    return updatedOpportunity;
  }
  
  // Application operations
  async getApplication(id: number): Promise<Application | undefined> {
    return this.applicationsMap.get(id);
  }
  
  async getApplicationsByVolunteer(volunteerId: number): Promise<Application[]> {
    return Array.from(this.applicationsMap.values()).filter(
      (application) => application.volunteerId === volunteerId
    );
  }
  
  async getApplicationsByNgo(ngoId: number): Promise<Application[]> {
    return Array.from(this.applicationsMap.values()).filter(
      (application) => application.ngoId === ngoId
    );
  }
  
  async getApplicationsByOpportunity(opportunityId: number): Promise<Application[]> {
    return Array.from(this.applicationsMap.values()).filter(
      (application) => application.opportunityId === opportunityId
    );
  }
  
  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const id = this.applicationCurrentId++;
    const application: Application = { 
      ...insertApplication, 
      id, 
      createdAt: new Date() 
    };
    this.applicationsMap.set(id, application);
    return application;
  }
  
  async updateApplication(id: number, applicationData: Partial<Application>): Promise<Application | undefined> {
    const application = await this.getApplication(id);
    if (!application) return undefined;
    
    const updatedApplication = { ...application, ...applicationData };
    this.applicationsMap.set(id, updatedApplication);
    return updatedApplication;
  }
  
  // Suggestion operations
  async getSuggestion(id: number): Promise<Suggestion | undefined> {
    return this.suggestionsMap.get(id);
  }
  
  async getSuggestionsByNgo(ngoId: number): Promise<Suggestion[]> {
    return Array.from(this.suggestionsMap.values()).filter(
      (suggestion) => suggestion.ngoId === ngoId
    );
  }
  
  async getSuggestionsByVolunteer(volunteerId: number): Promise<Suggestion[]> {
    return Array.from(this.suggestionsMap.values()).filter(
      (suggestion) => suggestion.volunteerId === volunteerId
    );
  }
  
  async createSuggestion(insertSuggestion: InsertSuggestion): Promise<Suggestion> {
    const id = this.suggestionCurrentId++;
    const suggestion: Suggestion = { 
      ...insertSuggestion, 
      id, 
      createdAt: new Date() 
    };
    this.suggestionsMap.set(id, suggestion);
    return suggestion;
  }
  
  // Seed some initial data for demo purposes
  private async seedData() {
    // Seed NGOs
    const ngo1 = await this.createNgo({
      name: "Education for All",
      description: "Working to provide quality education to underprivileged children.",
      cause: "Education",
      location: "New York, USA",
      email: "info@educationforall.org",
      phoneNumber: "+1234567890",
      website: "www.educationforall.org",
      logo: "https://via.placeholder.com/150"
    });
    
    const ngo2 = await this.createNgo({
      name: "Green Earth Initiative",
      description: "Focused on environmental conservation and sustainability.",
      cause: "Environment",
      location: "San Francisco, USA",
      email: "info@greenearthinitiative.org",
      phoneNumber: "+1987654321",
      website: "www.greenearthinitiative.org",
      logo: "https://via.placeholder.com/150"
    });
    
    const ngo3 = await this.createNgo({
      name: "Healthcare Access",
      description: "Providing healthcare services to underserved communities.",
      cause: "Healthcare",
      location: "Chicago, USA",
      email: "info@healthcareaccess.org",
      phoneNumber: "+1122334455",
      website: "www.healthcareaccess.org",
      logo: "https://via.placeholder.com/150"
    });
    
    // Seed opportunities
    await this.createOpportunity({
      title: "Teaching Assistant",
      description: "Help teachers in classrooms with underprivileged children.",
      ngoId: ngo1.id,
      location: "New York, USA",
      remote: false,
      skills: ["Teaching", "Patience", "Communication"],
      commitment: "10 hours/week",
      startDate: new Date("2023-09-01"),
      endDate: new Date("2023-12-31"),
      openings: 5
    });
    
    await this.createOpportunity({
      title: "Environmental Cleanup Organizer",
      description: "Organize beach and park cleanup events.",
      ngoId: ngo2.id,
      location: "San Francisco, USA",
      remote: false,
      skills: ["Organization", "Leadership", "Environmental Knowledge"],
      commitment: "5 hours/week",
      startDate: new Date("2023-08-15"),
      endDate: new Date("2023-11-15"),
      openings: 3
    });
    
    await this.createOpportunity({
      title: "Medical Camp Assistant",
      description: "Assist doctors in medical camps for underserved communities.",
      ngoId: ngo3.id,
      location: "Chicago, USA",
      remote: false,
      skills: ["First Aid", "Empathy", "Organization"],
      commitment: "8 hours/week",
      startDate: new Date("2023-10-01"),
      endDate: new Date("2023-12-15"),
      openings: 10
    });
  }
}

// Export a singleton instance
export const storage = new MemStorage();
