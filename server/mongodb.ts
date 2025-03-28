import { MongoClient, Db, Collection, Document, WithId } from 'mongodb';
import { users, type User, type InsertUser, ngos, type NGO, type InsertNGO, opportunities, type Opportunity, type InsertOpportunity, applications, type Application, type InsertApplication, suggestions, type Suggestion, type InsertSuggestion } from "@shared/schema";
import { IStorage } from './storage';

// Helper type for MongoDB document conversion
type MongoDoc<T> = Omit<T, 'id'> & { _id?: any };
import session from 'express-session';
import MongoStore from 'connect-mongo';

export class MongoDBStorage implements IStorage {
  private client: MongoClient;
  private db: Db | null = null;
  sessionStore: session.Store;

  private usersCollection: Collection | null = null;
  private ngosCollection: Collection | null = null;
  private opportunitiesCollection: Collection | null = null;
  private applicationsCollection: Collection | null = null;
  private suggestionsCollection: Collection | null = null;

  constructor(mongoUri: string) {
    // Create MongoDB client
    this.client = new MongoClient(mongoUri);
    
    // Create session store
    this.sessionStore = MongoStore.create({
      mongoUrl: mongoUri,
      collectionName: 'sessions',
      ttl: 86400 // 1 day
    });
    
    // Note: we don't automatically connect here, the caller needs to call connect()
  }

  public async connect() {
    try {
      await this.client.connect();
      console.log('Connected to MongoDB');
      
      // Get database, either from URI or default to 'volunteerconnect'
      const dbName = process.env.MONGODB_DB || 'volunteerconnect';
      this.db = this.client.db(dbName);
      
      // Initialize collections
      this.usersCollection = this.db.collection('users');
      this.ngosCollection = this.db.collection('ngos');
      this.opportunitiesCollection = this.db.collection('opportunities');
      this.applicationsCollection = this.db.collection('applications');
      this.suggestionsCollection = this.db.collection('suggestions');
      
      // Create indexes
      await this.usersCollection.createIndex({ username: 1 }, { unique: true });
      await this.usersCollection.createIndex({ email: 1 }, { unique: true });
      await this.ngosCollection.createIndex({ name: 1 });
      await this.opportunitiesCollection.createIndex({ ngoId: 1 });
      await this.applicationsCollection.createIndex({ volunteerId: 1 });
      await this.applicationsCollection.createIndex({ ngoId: 1 });
      await this.suggestionsCollection.createIndex({ ngoId: 1 });
      
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    if (!this.usersCollection) throw new Error('Database not connected');
    const user = await this.usersCollection.findOne({ id }) as unknown as User;
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!this.usersCollection) throw new Error('Database not connected');
    const user = await this.usersCollection.findOne({ 
      username: { $regex: new RegExp(`^${username}$`, 'i') } 
    }) as unknown as User;
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!this.usersCollection) throw new Error('Database not connected');
    const user = await this.usersCollection.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') } 
    }) as unknown as User;
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    if (!this.usersCollection) throw new Error('Database not connected');
    
    // Get the next ID
    const latestUser = await this.usersCollection.findOne({}, { sort: { id: -1 } }) as unknown as User;
    const id = latestUser ? latestUser.id + 1 : 1;
    
    // Set default values for nullable fields
    const newUser: User = {
      id,
      username: user.username,
      password: user.password,
      email: user.email,
      fullName: user.fullName,
      userType: user.userType,
      phoneNumber: user.phoneNumber || null,
      location: user.location || null,
      bio: user.bio || null,
      interests: user.interests || null,
      ngoId: user.ngoId || null
    };
    
    await this.usersCollection.insertOne(newUser);
    return newUser;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    if (!this.usersCollection) throw new Error('Database not connected');
    
    const result = await this.usersCollection.findOneAndUpdate(
      { id }, 
      { $set: userData },
      { returnDocument: 'after' }
    ) as unknown as User;
    
    return result || undefined;
  }

  async getVolunteers(): Promise<User[]> {
    if (!this.usersCollection) throw new Error('Database not connected');
    return this.usersCollection.find({ userType: 'volunteer' }).toArray() as unknown as User[];
  }

  async getRecruiters(): Promise<User[]> {
    if (!this.usersCollection) throw new Error('Database not connected');
    return this.usersCollection.find({ userType: 'recruiter' }).toArray() as unknown as User[];
  }

  // NGO operations
  async getNgo(id: number): Promise<NGO | undefined> {
    if (!this.ngosCollection) throw new Error('Database not connected');
    const ngo = await this.ngosCollection.findOne({ id }) as unknown as NGO;
    return ngo || undefined;
  }

  async getNgos(): Promise<NGO[]> {
    if (!this.ngosCollection) throw new Error('Database not connected');
    return this.ngosCollection.find().toArray() as unknown as NGO[];
  }

  async getNgosByCause(cause: string): Promise<NGO[]> {
    if (!this.ngosCollection) throw new Error('Database not connected');
    return this.ngosCollection.find({ 
      cause: { $regex: new RegExp(cause, 'i') } 
    }).toArray() as unknown as NGO[];
  }

  async createNgo(ngo: InsertNGO): Promise<NGO> {
    if (!this.ngosCollection) throw new Error('Database not connected');
    
    // Get the next ID
    const latestNgo = await this.ngosCollection.findOne({}, { sort: { id: -1 } }) as unknown as NGO;
    const id = latestNgo ? latestNgo.id + 1 : 1;
    
    // Set default values for nullable fields
    const newNgo: NGO = {
      id,
      name: ngo.name,
      email: ngo.email,
      description: ngo.description,
      cause: ngo.cause,
      location: ngo.location,
      phoneNumber: ngo.phoneNumber || null,
      website: ngo.website || null,
      logo: ngo.logo || null
    };
    
    await this.ngosCollection.insertOne(newNgo);
    return newNgo;
  }

  async updateNgo(id: number, ngoData: Partial<NGO>): Promise<NGO | undefined> {
    if (!this.ngosCollection) throw new Error('Database not connected');
    
    const result = await this.ngosCollection.findOneAndUpdate(
      { id }, 
      { $set: ngoData },
      { returnDocument: 'after' }
    ) as unknown as NGO;
    
    return result || undefined;
  }

  // Opportunity operations
  async getOpportunity(id: number): Promise<Opportunity | undefined> {
    if (!this.opportunitiesCollection) throw new Error('Database not connected');
    const opportunity = await this.opportunitiesCollection.findOne({ id }) as unknown as Opportunity;
    return opportunity || undefined;
  }

  async getOpportunities(): Promise<Opportunity[]> {
    if (!this.opportunitiesCollection) throw new Error('Database not connected');
    return this.opportunitiesCollection.find().toArray() as unknown as Opportunity[];
  }

  async getOpportunitiesByNgo(ngoId: number): Promise<Opportunity[]> {
    if (!this.opportunitiesCollection) throw new Error('Database not connected');
    return this.opportunitiesCollection.find({ ngoId }).toArray() as unknown as Opportunity[];
  }

  async getOpportunitiesByCause(cause: string): Promise<Opportunity[]> {
    if (!this.opportunitiesCollection || !this.ngosCollection) throw new Error('Database not connected');
    
    // Find NGOs with the given cause
    const ngosWithCause = await this.getNgosByCause(cause);
    const ngoIds = ngosWithCause.map(ngo => ngo.id);
    
    // Find opportunities for those NGOs
    return this.opportunitiesCollection.find({ ngoId: { $in: ngoIds } }).toArray() as unknown as Opportunity[];
  }

  async createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity> {
    if (!this.opportunitiesCollection) throw new Error('Database not connected');
    
    // Get the next ID
    const latestOpportunity = await this.opportunitiesCollection.findOne({}, { sort: { id: -1 } }) as unknown as Opportunity;
    const id = latestOpportunity ? latestOpportunity.id + 1 : 1;
    
    // Set default values for nullable fields
    const newOpportunity: Opportunity = {
      id,
      title: opportunity.title,
      description: opportunity.description,
      location: opportunity.location,
      ngoId: opportunity.ngoId,
      commitment: opportunity.commitment,
      remote: opportunity.remote ?? null,
      skills: opportunity.skills ?? null,
      startDate: opportunity.startDate ?? null,
      endDate: opportunity.endDate ?? null,
      openings: opportunity.openings ?? null,
      createdAt: new Date()
    };
    
    await this.opportunitiesCollection.insertOne(newOpportunity);
    return newOpportunity;
  }

  async updateOpportunity(id: number, opportunityData: Partial<Opportunity>): Promise<Opportunity | undefined> {
    if (!this.opportunitiesCollection) throw new Error('Database not connected');
    
    const result = await this.opportunitiesCollection.findOneAndUpdate(
      { id }, 
      { $set: opportunityData },
      { returnDocument: 'after' }
    ) as unknown as Opportunity;
    
    return result || undefined;
  }

  // Application operations
  async getApplication(id: number): Promise<Application | undefined> {
    if (!this.applicationsCollection) throw new Error('Database not connected');
    const application = await this.applicationsCollection.findOne({ id }) as unknown as Application;
    return application || undefined;
  }

  async getApplicationsByVolunteer(volunteerId: number): Promise<Application[]> {
    if (!this.applicationsCollection) throw new Error('Database not connected');
    return this.applicationsCollection.find({ volunteerId }).toArray() as unknown as Application[];
  }

  async getApplicationsByNgo(ngoId: number): Promise<Application[]> {
    if (!this.applicationsCollection) throw new Error('Database not connected');
    return this.applicationsCollection.find({ ngoId }).toArray() as unknown as Application[];
  }

  async getApplicationsByOpportunity(opportunityId: number): Promise<Application[]> {
    if (!this.applicationsCollection) throw new Error('Database not connected');
    return this.applicationsCollection.find({ opportunityId }).toArray() as unknown as Application[];
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    if (!this.applicationsCollection) throw new Error('Database not connected');
    
    // Get the next ID
    const latestApplication = await this.applicationsCollection.findOne({}, { sort: { id: -1 } }) as unknown as Application;
    const id = latestApplication ? latestApplication.id + 1 : 1;
    
    // Set default values for nullable fields
    const newApplication: Application = {
      id,
      ngoId: application.ngoId,
      volunteerId: application.volunteerId,
      opportunityId: application.opportunityId,
      status: application.status || 'pending',
      message: application.message || null,
      resume: application.resume || null,
      createdAt: new Date()
    };
    
    await this.applicationsCollection.insertOne(newApplication);
    return newApplication;
  }

  async updateApplication(id: number, applicationData: Partial<Application>): Promise<Application | undefined> {
    if (!this.applicationsCollection) throw new Error('Database not connected');
    
    const result = await this.applicationsCollection.findOneAndUpdate(
      { id }, 
      { $set: applicationData },
      { returnDocument: 'after' }
    ) as unknown as Application;
    
    return result || undefined;
  }

  // Suggestion operations
  async getSuggestion(id: number): Promise<Suggestion | undefined> {
    if (!this.suggestionsCollection) throw new Error('Database not connected');
    const suggestion = await this.suggestionsCollection.findOne({ id }) as unknown as Suggestion;
    return suggestion || undefined;
  }

  async getSuggestionsByNgo(ngoId: number): Promise<Suggestion[]> {
    if (!this.suggestionsCollection) throw new Error('Database not connected');
    return this.suggestionsCollection.find({ ngoId }).toArray() as unknown as Suggestion[];
  }

  async getSuggestionsByVolunteer(volunteerId: number): Promise<Suggestion[]> {
    if (!this.suggestionsCollection) throw new Error('Database not connected');
    return this.suggestionsCollection.find({ volunteerId }).toArray() as unknown as Suggestion[];
  }

  async createSuggestion(suggestion: InsertSuggestion): Promise<Suggestion> {
    if (!this.suggestionsCollection) throw new Error('Database not connected');
    
    // Get the next ID
    const latestSuggestion = await this.suggestionsCollection.findOne({}, { sort: { id: -1 } }) as unknown as Suggestion;
    const id = latestSuggestion ? latestSuggestion.id + 1 : 1;
    
    // Set default values for nullable fields
    const newSuggestion: Suggestion = {
      id,
      ngoId: suggestion.ngoId,
      volunteerId: suggestion.volunteerId,
      content: suggestion.content,
      createdAt: new Date()
    };
    
    await this.suggestionsCollection.insertOne(newSuggestion);
    return newSuggestion;
  }

  // Method to seed initial data if needed
  async seedInitialData() {
    if (!this.usersCollection || !this.ngosCollection || !this.opportunitiesCollection) {
      throw new Error('Database not connected');
    }

    // Check if we already have data
    const userCount = await this.usersCollection.countDocuments();
    const ngoCount = await this.ngosCollection.countDocuments();
    
    if (userCount > 0 || ngoCount > 0) {
      console.log('Database already has data, skipping seed');
      return;
    }
    
    console.log('Seeding initial data...');
    
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
    
    console.log('Initial data seeded successfully');
  }
}