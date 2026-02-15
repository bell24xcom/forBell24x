import { 
  User, InsertUser, RFQ, InsertRFQ, Bid, InsertBid, Contract, InsertContract, 
  Message, InsertMessage, Transaction, InsertTransaction, Supplier,
  Organization, InsertOrganization, Team, InsertTeam,
  OrganizationMember, InsertOrganizationMember, TeamMember, InsertTeamMember,
  ResourcePermission, InsertResourcePermission,
  AccessControlList, InsertAccessControlList, AclRule, InsertAclRule,
  AclAssignment, InsertAclAssignment, ProductShowcase, InsertProductShowcase,
  Category, Subcategory
} from '../shared/schema.js';
import { 
  users, rfqs, bids, contracts, messages, transactions, suppliers,
  organizations, teams, organizationMembers, teamMembers, resourcePermissions,
  accessControlLists, aclRules, aclAssignments, productShowcases,
  categories, subcategories
} from './tables.js';
import { db } from './db.js';
import { eq, and, or, desc, inArray, gte } from 'drizzle-orm';
import session from 'express-session';
// @ts-ignore
import connectPg from 'connect-pg-simple';
import { storage } from './storage.js';

const PostgresSessionStore = connectPg(session);

// Define a type for creating a supplier
export interface InsertSupplier {
  user_id: number;
  industry: string;
  product_categories: string[];
  risk_score?: number;
  verification_status?: boolean;
}

export interface IStorage {
  // Analytics operations
  getMetrics(): Promise<Array<{ category: string; count: number }>>;
  getTrends(): Promise<Array<{
    metric: string;
    period: string;
    value: number;
    trend: string;
    magnitude: number;
    confidence: number;
  }>>;
  getPredictions(): Promise<Array<{
    metric: string;
    timestamp: Date;
    value: number;
    predicted: number;
    confidence: number;
    factors: Array<{ factor: string; impact: number }>;
  }>>;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserWalletBalance(id: number, balance: number): Promise<User | undefined>;
  
  // Supplier operations
  getSupplierByUserId(userId: number): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplierRiskScore(id: number, riskScore: number): Promise<Supplier | undefined>;
  
  // RFQ operations
  getAllRFQs(): Promise<RFQ[]>;
  getUserRFQs(userId: number): Promise<RFQ[]>;
  getRFQ(id: number): Promise<RFQ | undefined>;
  createRFQ(rfq: InsertRFQ): Promise<RFQ>;
  updateRFQ(id: number, data: Partial<RFQ>): Promise<RFQ | undefined>;
  
  // Bid operations
  getAllBids(): Promise<Bid[]>;
  getBids(rfqId?: number, supplierId?: number): Promise<Bid[]>;
  getUserBids(userId: number): Promise<Bid[]>;
  getBid(id: number): Promise<Bid | undefined>;
  createBid(bid: InsertBid): Promise<Bid>;
  updateBidStatus(id: number, status: string): Promise<Bid | undefined>;
  
  // Contract operations
  getUserContracts(userId: number): Promise<Contract[]>;
  getContract(id: number): Promise<Contract | undefined>;
  createContract(contract: InsertContract): Promise<Contract>;
  updateContractStatus(id: number, status: string): Promise<Contract | undefined>;
  
  // Message operations
  getUserMessages(userId: number, otherUserId?: number, rfqId?: number, bidId?: number): Promise<Message[]>;
  getMessage(id: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessageStatus(id: number, status: string): Promise<Message | undefined>;
  
  // Transaction operations
  getUserTransactions(userId: number): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Organization operations
  getOrganization(id: number): Promise<Organization | undefined>;
  getUserOrganizations(userId: number): Promise<Organization[]>;
  createOrganization(data: InsertOrganization): Promise<Organization>;
  updateOrganization(id: number, data: Partial<InsertOrganization>): Promise<Organization>;
  deleteOrganization(id: number): Promise<void>;
  isOrganizationMember(organizationId: number, userId: number): Promise<boolean>;
  isOrganizationOwner(organizationId: number, userId: number): Promise<boolean>;
  canManageOrganization(organizationId: number, userId: number): Promise<boolean>;
  getOrganizationMembers(organizationId: number): Promise<OrganizationMember[]>;
  addOrganizationMember(data: InsertOrganizationMember): Promise<OrganizationMember>;
  updateOrganizationMember(organizationId: number, userId: number, data: Partial<InsertOrganizationMember>): Promise<OrganizationMember>;
  removeOrganizationMember(organizationId: number, userId: number): Promise<void>;
  
  // Team operations
  getTeam(id: number): Promise<Team | undefined>;
  getOrganizationTeams(organizationId: number): Promise<Team[]>;
  getUserTeams(userId: number): Promise<Team[]>;
  createTeam(data: InsertTeam): Promise<Team>;
  updateTeam(id: number, data: Partial<InsertTeam>): Promise<Team>;
  deleteTeam(id: number): Promise<void>;
  isTeamMember(teamId: number, userId: number): Promise<boolean>;
  canAccessTeam(teamId: number, userId: number): Promise<boolean>;
  canManageTeam(teamId: number, userId: number): Promise<boolean>;
  getTeamMembers(teamId: number): Promise<TeamMember[]>;
  addTeamMember(data: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(teamId: number, userId: number, data: Partial<InsertTeamMember>): Promise<TeamMember>;
  removeTeamMember(teamId: number, userId: number): Promise<void>;
  
  // Permission operations
  getResourcePermission(id: number): Promise<ResourcePermission | undefined>;
  getResourcePermissions(resourceType: string, resourceId: number): Promise<ResourcePermission[]>;
  getSpecificResourcePermission(resourceType: string, resourceId: number, userId?: number, teamId?: number, organizationId?: number): Promise<ResourcePermission | undefined>;
  createResourcePermission(data: InsertResourcePermission): Promise<ResourcePermission>;
  updateResourcePermission(id: number, data: Partial<InsertResourcePermission>): Promise<ResourcePermission>;
  deleteResourcePermission(id: number): Promise<void>;
  canViewResourcePermissions(resourceType: string, resourceId: number, userId: number): Promise<boolean>;
  canManageResourcePermissions(resourceType: string, resourceId: number, userId: number): Promise<boolean>;
  getUserPermissionLevel(resourceType: string, resourceId: number, userId: number): Promise<string>;
  
  // Access Control Lists (ACL) operations
  getAccessControlList(id: number): Promise<AccessControlList | undefined>;
  getAccessControlLists(organizationId?: number): Promise<AccessControlList[]>;
  getUserAccessControlLists(userId: number): Promise<AccessControlList[]>;
  createAccessControlList(data: InsertAccessControlList): Promise<AccessControlList>;
  updateAccessControlList(id: number, data: Partial<InsertAccessControlList>): Promise<AccessControlList>;
  deleteAccessControlList(id: number): Promise<void>;
  
  // ACL Rules operations
  getAclRule(id: number): Promise<AclRule | undefined>;
  getAclRules(aclId: number): Promise<AclRule[]>;
  createAclRule(data: InsertAclRule): Promise<AclRule>;
  updateAclRule(id: number, data: Partial<InsertAclRule>): Promise<AclRule>;
  deleteAclRule(id: number): Promise<void>;
  
  // ACL Assignments operations
  getAclAssignment(id: number): Promise<AclAssignment | undefined>;
  getAclAssignments(aclId: number): Promise<AclAssignment[]>;
  createAclAssignment(data: InsertAclAssignment): Promise<AclAssignment>;
  deleteAclAssignment(id: number): Promise<void>;
  
  // ACL Permission checking
  getEffectivePermission(userId: number, resourceType: string, resourceId?: number): Promise<string>;
  
  // Product Showcase operations
  createProductShowcase(showcase: InsertProductShowcase): Promise<ProductShowcase>;
  getProductShowcases(options?: {category?: string; userId?: number; limit?: number; offset?: number}): Promise<ProductShowcase[]>;
  getProductShowcaseById(id: number): Promise<ProductShowcase | undefined>;
  
  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
  
  async updateUserWalletBalance(id: number, balance: number): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ wallet_balance: balance })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  // Supplier operations
  async getSupplierByUserId(userId: number): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.user_id, userId));
    return supplier;
  }
  
  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const [newSupplier] = await db.insert(suppliers).values(supplier).returning();
    return newSupplier;
  }
  
  async updateSupplierRiskScore(id: number, riskScore: number): Promise<Supplier | undefined> {
    const [updatedSupplier] = await db
      .update(suppliers)
      .set({ risk_score: riskScore })
      .where(eq(suppliers.id, id))
      .returning();
    return updatedSupplier;
  }
  
  // RFQ operations
  async getAllRFQs(): Promise<RFQ[]> {
    return await db.select().from(rfqs).orderBy(desc(rfqs.created_at));
  }
  
  async getUserRFQs(userId: number): Promise<RFQ[]> {
    return await db
      .select()
      .from(rfqs)
      .where(eq(rfqs.user_id, userId))
      .orderBy(desc(rfqs.created_at));
  }
  
  async getRFQ(id: number): Promise<RFQ | undefined> {
    const [rfq] = await db.select().from(rfqs).where(eq(rfqs.id, id));
    return rfq;
  }
  
  async createRFQ(rfq: InsertRFQ): Promise<RFQ> {
    const [newRfq] = await db.insert(rfqs).values(rfq).returning();
    return newRfq;
  }
  
  async updateRFQ(id: number, data: Partial<RFQ>): Promise<RFQ | undefined> {
    const [updatedRfq] = await db
      .update(rfqs)
      .set(data)
      .where(eq(rfqs.id, id))
      .returning();
    return updatedRfq;
  }
  
  // Bid operations
  async getAllBids(): Promise<Bid[]> {
    return await db.select().from(bids).orderBy(desc(bids.created_at));
  }
  
  async getBids(rfqId?: number, supplierId?: number): Promise<Bid[]> {
    let query = db.select().from(bids);
    
    if (rfqId && supplierId) {
      query = query.where(and(eq(bids.rfq_id, rfqId), eq(bids.supplier_id, supplierId)));
    } else if (rfqId) {
      query = query.where(eq(bids.rfq_id, rfqId));
    } else if (supplierId) {
      query = query.where(eq(bids.supplier_id, supplierId));
    }
    
    return await query.orderBy(desc(bids.created_at));
  }
  
  async getUserBids(userId: number): Promise<Bid[]> {
    return await db
      .select()
      .from(bids)
      .where(eq(bids.supplier_id, userId))
      .orderBy(desc(bids.created_at));
  }
  
  async getBid(id: number): Promise<Bid | undefined> {
    const [bid] = await db.select().from(bids).where(eq(bids.id, id));
    return bid;
  }
  
  async createBid(bid: InsertBid): Promise<Bid> {
    const [newBid] = await db.insert(bids).values(bid).returning();
    return newBid;
  }
  
  async updateBidStatus(id: number, status: string): Promise<Bid | undefined> {
    const [updatedBid] = await db
      .update(bids)
      .set({ status: status as any, updated_at: new Date() })
      .where(eq(bids.id, id))
      .returning();
    return updatedBid;
  }
  
  // Contract operations
  async getUserContracts(userId: number): Promise<Contract[]> {
    return await db
      .select()
      .from(contracts)
      .where(or(eq(contracts.buyer_id, userId), eq(contracts.supplier_id, userId)))
      .orderBy(desc(contracts.created_at));
  }
  
  async getContract(id: number): Promise<Contract | undefined> {
    const [contract] = await db.select().from(contracts).where(eq(contracts.id, id));
    return contract;
  }
  
  async createContract(contract: InsertContract): Promise<Contract> {
    const [newContract] = await db.insert(contracts).values(contract).returning();
    return newContract;
  }
  
  async updateContractStatus(id: number, status: string): Promise<Contract | undefined> {
    const [updatedContract] = await db
      .update(contracts)
      .set({ status: status as any, updated_at: new Date() })
      .where(eq(contracts.id, id))
      .returning();
    return updatedContract;
  }
  
  // Message operations
  async getUserMessages(userId: number, otherUserId?: number, rfqId?: number, bidId?: number): Promise<Message[]> {
    let query = db.select().from(messages).where(
      or(
        eq(messages.sender_id, userId),
        eq(messages.recipient_id, userId)
      )
    );
    
    if (otherUserId) {
      query = query.where(
        or(
          and(
            eq(messages.sender_id, userId),
            eq(messages.recipient_id, otherUserId)
          ),
          and(
            eq(messages.sender_id, otherUserId),
            eq(messages.recipient_id, userId)
          )
        )
      );
    }
    
    if (rfqId) {
      query = query.where(eq(messages.rfq_id, rfqId));
    }
    
    if (bidId) {
      query = query.where(eq(messages.bid_id, bidId));
    }
    
    return await query.orderBy(desc(messages.created_at));
  }
  
  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message;
  }
  
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }
  
  async updateMessageStatus(id: number, status: string): Promise<Message | undefined> {
    const [updatedMessage] = await db
      .update(messages)
      .set({ status: status as any })
      .where(eq(messages.id, id))
      .returning();
    return updatedMessage;
  }
  
  // Transaction operations
  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.user_id, userId))
      .orderBy(desc(transactions.created_at));
  }
  
  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }
  
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }

  // Organization operations
  async getOrganization(id: number): Promise<Organization | undefined> {
    const [organization] = await db.select().from(organizations).where(eq(organizations.id, id));
    return organization;
  }

  async getOrganizations(userId?: number): Promise<Organization[]> {
    if (userId) {
      return this.getUserOrganizations(userId);
    }
    
    return await db.select().from(organizations).orderBy(organizations.name);
  }

  async getUserOrganizations(userId: number): Promise<Organization[]> {
    // Get organizations where user is owner or member
    const ownedOrgs = await db
      .select()
      .from(organizations)
      .where(eq(organizations.owner_id, userId));
    
    const membershipOrgs = await db
      .select({
        organization: organizations
      })
      .from(organizationMembers)
      .innerJoin(organizations, eq(organizationMembers.organization_id, organizations.id))
      .where(eq(organizationMembers.user_id, userId));
    
    // Combine results, removing duplicates
    const memberOrgObjs = membershipOrgs.map((row: { organization: Organization }) => row.organization);
    const ownedOrgIds = new Set(ownedOrgs.map((org: Organization) => org.id));
    const uniqueMemberOrgs = memberOrgObjs.filter((org: Organization) => !ownedOrgIds.has(org.id));
    
    return [...ownedOrgs, ...uniqueMemberOrgs];
  }

  async createOrganization(data: InsertOrganization): Promise<Organization> {
    const [organization] = await db.insert(organizations).values({
      ...data,
      created_at: new Date(),
      updated_at: new Date()
    }).returning();
    
    // If this is a new organization, automatically add the creator as an admin member
    if (data.owner_id && organization.id) {
      await this.addOrganizationMember({
        organization_id: organization.id,
        user_id: data.owner_id,
        role: 'admin',
        invited_by: data.owner_id
      });
    }
    
    return organization;
  }

  async updateOrganization(id: number, data: Partial<InsertOrganization>): Promise<Organization> {
    const [organization] = await db
      .update(organizations)
      .set({
        ...data,
        updated_at: new Date()
      })
      .where(eq(organizations.id, id))
      .returning();
    
    return organization;
  }
  
  async deleteOrganization(id: number): Promise<void> {
    // Delete all related organization members
    await db
      .delete(organizationMembers)
      .where(eq(organizationMembers.organization_id, id));
    
    // Delete all related teams and team members
    const orgTeams = await this.getOrganizationTeams(id);
    for (const team of orgTeams) {
      await db
        .delete(teamMembers)
        .where(eq(teamMembers.team_id, team.id));
    }

    await db
      .delete(teams)
      .where(eq(teams.organization_id, id));
    
    // Delete all related ACLs, rules, and assignments
    const acls = await this.getAccessControlLists(id);
    for (const acl of acls) {
      await db
        .delete(aclRules)
        .where(eq(aclRules.acl_id, acl.id));
      
      await db
        .delete(aclAssignments)
        .where(eq(aclAssignments.acl_id, acl.id));
    }
    
    await db
      .delete(accessControlLists)
      .where(eq(accessControlLists.organization_id, id));
    
    // Finally, delete the organization
    await db
      .delete(organizations)
      .where(eq(organizations.id, id));
  }
  
  async isOrganizationMember(userId: number, organizationId: number): Promise<boolean> {
    // Check if user is owner of the organization
    const organization = await this.getOrganization(organizationId);
    if (organization && organization.owner_id === userId) {
      return true;
    }
    
    // Check if user has a member record
    const [member] = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organization_id, organizationId),
          eq(organizationMembers.user_id, userId)
        )
      );
    
    return !!member;
  }
  
  async isOrganizationAdmin(userId: number, organizationId: number): Promise<boolean> {
    // Check if user is owner of the organization
    const organization = await this.getOrganization(organizationId);
    if (organization && organization.owner_id === userId) {
      return true;
    }
    
    // Check if user has an admin role
    const [member] = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organization_id, organizationId),
          eq(organizationMembers.user_id, userId),
          eq(organizationMembers.role, 'admin')
        )
      );
    
    return !!member;
  }
  
  async isOrganizationOwner(organizationId: number, userId: number): Promise<boolean> {
    const organization = await this.getOrganization(organizationId);
    return !!(organization && organization.owner_id === userId);
  }
  
  async canManageOrganization(organizationId: number, userId: number): Promise<boolean> {
    // Owner can always manage
    const isOwner = await this.isOrganizationOwner(organizationId, userId);
    if (isOwner) {
      return true;
    }
    
    // Check if user is admin or manager
    const [membership] = await db
      .select()
      .from(organizationMembers)
      .where(and(
        eq(organizationMembers.organization_id, organizationId),
        eq(organizationMembers.user_id, userId),
        or(
          eq(organizationMembers.role, 'admin'),
          eq(organizationMembers.role, 'manager')
        )
      ));
    
    return !!membership;
  }

  async getOrganizationMembers(organizationId: number): Promise<OrganizationMember[]> {
    return await db
      .select()
      .from(organizationMembers)
      .where(eq(organizationMembers.organization_id, organizationId));
  }

  async addOrganizationMember(data: InsertOrganizationMember): Promise<OrganizationMember> {
    const [member] = await db
      .insert(organizationMembers)
      .values({
        ...data,
        joined_at: new Date()
      })
      .returning();
    
    return member;
  }

  async updateOrganizationMember(organizationId: number, userId: number, data: Partial<InsertOrganizationMember>): Promise<OrganizationMember> {
    const [member] = await db
      .update(organizationMembers)
      .set(data)
      .where(and(
        eq(organizationMembers.organization_id, organizationId),
        eq(organizationMembers.user_id, userId)
      ))
      .returning();
    
    return member;
  }

  async removeOrganizationMember(organizationId: number, userId: number): Promise<void> {
    // Remove user from all teams in the organization
    const orgTeams = await this.getOrganizationTeams(organizationId);
    for (const team of orgTeams) {
      const isMember = await this.isTeamMember(team.id, userId);
      if (isMember) {
        await this.removeTeamMember(team.id, userId);
      }
    }
    
    // Remove user from organization
    await db
      .delete(organizationMembers)
      .where(and(
        eq(organizationMembers.organization_id, organizationId),
        eq(organizationMembers.user_id, userId)
      ));
  }

  // Team operations
  async getTeam(id: number): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team;
  }

  async getOrganizationTeams(organizationId: number): Promise<Team[]> {
    return await db
      .select()
      .from(teams)
      .where(eq(teams.organization_id, organizationId));
  }

  async getUserTeams(userId: number): Promise<Team[]> {
    // Get teams where user is a member
    const memberTeams = await db
      .select({
        team: teams
      })
      .from(teamMembers)
      .innerJoin(teams, eq(teamMembers.team_id, teams.id))
      .where(eq(teamMembers.user_id, userId));
    
    return memberTeams.map((row: { team: Team }) => row.team);
  }

  async createTeam(data: InsertTeam): Promise<Team> {
    const [team] = await db
      .insert(teams)
      .values({
        ...data,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    
    return team;
  }

  async updateTeam(id: number, data: Partial<InsertTeam>): Promise<Team> {
    const [team] = await db
      .update(teams)
      .set({
        ...data,
        updated_at: new Date()
      })
      .where(eq(teams.id, id))
      .returning();
    
    return team;
  }

  async deleteTeam(id: number): Promise<void> {
    // Delete all team memberships
    await db
      .delete(teamMembers)
      .where(eq(teamMembers.team_id, id));
    
    // Delete all resource permissions
    await db
      .delete(resourcePermissions)
      .where(eq(resourcePermissions.team_id, id));
    
    // Delete team
    await db
      .delete(teams)
      .where(eq(teams.id, id));
  }

  async isTeamMember(teamId: number, userId: number): Promise<boolean> {
    // Check if user is team lead
    const team = await this.getTeam(teamId);
    if (team && team.lead_id === userId) {
      return true;
    }
    
    // Check if user is member
    const [membership] = await db
      .select()
      .from(teamMembers)
      .where(and(
        eq(teamMembers.team_id, teamId),
        eq(teamMembers.user_id, userId)
      ));
    
    return !!membership;
  }

  async canAccessTeam(teamId: number, userId: number): Promise<boolean> {
    // Check if user is team member
    const isTeamMember = await this.isTeamMember(teamId, userId);
    if (isTeamMember) {
      return true;
    }
    
    // Check if user is organization admin or owner
    const team = await this.getTeam(teamId);
    if (team) {
      const isOwner = await this.isOrganizationOwner(team.organization_id, userId);
      if (isOwner) {
        return true;
      }
      
      const canManage = await this.canManageOrganization(team.organization_id, userId);
      if (canManage) {
        return true;
      }
    }
    
    return false;
  }

  async canManageTeam(teamId: number, userId: number): Promise<boolean> {
    // Check if user is team lead
    const team = await this.getTeam(teamId);
    if (team && team.lead_id === userId) {
      return true;
    }
    
    // Check if user is team admin
    const [membership] = await db
      .select()
      .from(teamMembers)
      .where(and(
        eq(teamMembers.team_id, teamId),
        eq(teamMembers.user_id, userId),
        or(
          eq(teamMembers.role, 'admin'),
          eq(teamMembers.role, 'manager')
        )
      ));
    
    if (membership) {
      return true;
    }
    
    // Check if user is organization admin or owner
    if (team) {
      const isOwner = await this.isOrganizationOwner(team.organization_id, userId);
      if (isOwner) {
        return true;
      }
      
      const [orgMembership] = await db
        .select()
        .from(organizationMembers)
        .where(and(
          eq(organizationMembers.organization_id, team.organization_id),
          eq(organizationMembers.user_id, userId),
          eq(organizationMembers.role, 'admin')
        ));
      
      return !!orgMembership;
    }
    
    return false;
  }

  async getTeamMembers(teamId: number): Promise<TeamMember[]> {
    return await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.team_id, teamId));
  }

  async addTeamMember(data: InsertTeamMember): Promise<TeamMember> {
    const [member] = await db
      .insert(teamMembers)
      .values({
        ...data,
        joined_at: new Date()
      })
      .returning();
    
    return member;
  }

  async updateTeamMember(teamId: number, userId: number, data: Partial<InsertTeamMember>): Promise<TeamMember> {
    const [member] = await db
      .update(teamMembers)
      .set(data)
      .where(and(
        eq(teamMembers.team_id, teamId),
        eq(teamMembers.user_id, userId)
      ))
      .returning();
    
    return member;
  }

  async removeTeamMember(teamId: number, userId: number): Promise<void> {
    await db
      .delete(teamMembers)
      .where(and(
        eq(teamMembers.team_id, teamId),
        eq(teamMembers.user_id, userId)
      ));
  }

  // Permission operations
  async getResourcePermission(id: number): Promise<ResourcePermission | undefined> {
    const [permission] = await db
      .select()
      .from(resourcePermissions)
      .where(eq(resourcePermissions.id, id));
    
    return permission;
  }

  async getResourcePermissions(resourceType: string, resourceId: number): Promise<ResourcePermission[]> {
    return await db
      .select()
      .from(resourcePermissions)
      .where(and(
        eq(resourcePermissions.resource_type, resourceType),
        eq(resourcePermissions.resource_id, resourceId)
      ));
  }

  async getSpecificResourcePermission(
    resourceType: string,
    resourceId: number,
    userId?: number,
    teamId?: number,
    organizationId?: number
  ): Promise<ResourcePermission | undefined> {
    let query = db
      .select()
      .from(resourcePermissions)
      .where(and(
        eq(resourcePermissions.resource_type, resourceType),
        eq(resourcePermissions.resource_id, resourceId)
      ));
    
    if (userId) {
      query = query.where(eq(resourcePermissions.user_id, userId));
    }
    
    if (teamId) {
      query = query.where(eq(resourcePermissions.team_id, teamId));
    }
    
    if (organizationId) {
      query = query.where(eq(resourcePermissions.organization_id, organizationId));
    }
    
    const [permission] = await query;
    return permission;
  }

  async createResourcePermission(data: InsertResourcePermission): Promise<ResourcePermission> {
    const [permission] = await db
      .insert(resourcePermissions)
      .values({
        ...data,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    
    return permission;
  }

  async updateResourcePermission(id: number, data: Partial<InsertResourcePermission>): Promise<ResourcePermission> {
    const [permission] = await db
      .update(resourcePermissions)
      .set({
        ...data,
        updated_at: new Date()
      })
      .where(eq(resourcePermissions.id, id))
      .returning();
    
    return permission;
  }

  async deleteResourcePermission(id: number): Promise<void> {
    await db
      .delete(resourcePermissions)
      .where(eq(resourcePermissions.id, id));
  }
  
  // Access Control Lists (ACL) operations
  async getAccessControlList(id: number): Promise<AccessControlList | undefined> {
    const [acl] = await db
      .select()
      .from(accessControlLists)
      .where(eq(accessControlLists.id, id));
    
    return acl;
  }
  
  async getAccessControlLists(organizationId?: number): Promise<AccessControlList[]> {
    let query = db.select().from(accessControlLists);
    
    if (organizationId) {
      query = query.where(eq(accessControlLists.organization_id, organizationId));
    }
    
    return await query;
  }
  
  async getUserAccessControlLists(userId: number): Promise<AccessControlList[]> {
    // Get ACLs directly assigned to the user
    const userAssignments = await db
      .select()
      .from(aclAssignments)
      .where(eq(aclAssignments.user_id, userId));
    
    const aclIds = userAssignments.map((assignment: { acl_id: number }) => assignment.acl_id);
    
    // Get ACLs assigned to teams the user belongs to
    const userTeams = await this.getUserTeams(userId);
    const teamIds = userTeams.map(team => team.id);
    
    if (teamIds.length > 0) {
      const teamAssignments = await db
        .select()
        .from(aclAssignments)
        .where(inArray(aclAssignments.team_id, teamIds));
      
      aclIds.push(...teamAssignments.map((assignment: { acl_id: number }) => assignment.acl_id));
    }
    
    // Get ACLs assigned to organizations the user belongs to
    const userOrgs = await this.getUserOrganizations(userId);
    const orgIds = userOrgs.map((org: Organization) => org.id);
    
    if (orgIds.length > 0) {
      const orgAssignments = await db
        .select()
        .from(aclAssignments)
        .where(inArray(aclAssignments.organization_id, orgIds));
      
      aclIds.push(...orgAssignments.map((assignment: { acl_id: number }) => assignment.acl_id));
    }
    
    // If no ACLs found, return empty array
    if (aclIds.length === 0) {
      return [];
    }
    
    // Remove duplicates
    const uniqueAclIds = [...new Set(aclIds)];
    
    // Get the actual ACL objects
    return await db
      .select()
      .from(accessControlLists)
      .where(inArray(accessControlLists.id, uniqueAclIds));
  }
  
  async createAccessControlList(data: InsertAccessControlList): Promise<AccessControlList> {
    const [acl] = await db
      .insert(accessControlLists)
      .values({
        ...data,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    
    return acl;
  }
  
  async updateAccessControlList(id: number, data: Partial<InsertAccessControlList>): Promise<AccessControlList> {
    const [acl] = await db
      .update(accessControlLists)
      .set({
        ...data,
        updated_at: new Date()
      })
      .where(eq(accessControlLists.id, id))
      .returning();
    
    return acl;
  }
  
  async deleteAccessControlList(id: number): Promise<void> {
    // First delete all rules and assignments
    await db
      .delete(aclRules)
      .where(eq(aclRules.acl_id, id));
    
    await db
      .delete(aclAssignments)
      .where(eq(aclAssignments.acl_id, id));
    
    // Then delete the ACL itself
    await db
      .delete(accessControlLists)
      .where(eq(accessControlLists.id, id));
  }
  
  // ACL Rules operations
  async getAclRule(id: number): Promise<AclRule | undefined> {
    const [rule] = await db
      .select()
      .from(aclRules)
      .where(eq(aclRules.id, id));
    
    return rule;
  }
  
  async getAclRules(aclId: number): Promise<AclRule[]> {
    return await db
      .select()
      .from(aclRules)
      .where(eq(aclRules.acl_id, aclId));
  }
  
  async createAclRule(data: InsertAclRule): Promise<AclRule> {
    const [rule] = await db
      .insert(aclRules)
      .values({
        ...data,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    
    return rule;
  }
  
  async updateAclRule(id: number, data: Partial<InsertAclRule>): Promise<AclRule> {
    const [rule] = await db
      .update(aclRules)
      .set({
        ...data,
        updated_at: new Date()
      })
      .where(eq(aclRules.id, id))
      .returning();
    
    return rule;
  }
  
  async deleteAclRule(id: number): Promise<void> {
    await db
      .delete(aclRules)
      .where(eq(aclRules.id, id));
  }
  
  // ACL Assignments operations
  async getAclAssignment(id: number): Promise<AclAssignment | undefined> {
    const [assignment] = await db
      .select()
      .from(aclAssignments)
      .where(eq(aclAssignments.id, id));
    
    return assignment;
  }
  
  async getAclAssignments(aclId: number): Promise<AclAssignment[]> {
    return await db
      .select()
      .from(aclAssignments)
      .where(eq(aclAssignments.acl_id, aclId));
  }
  
  async createAclAssignment(data: InsertAclAssignment): Promise<AclAssignment> {
    const [assignment] = await db
      .insert(aclAssignments)
      .values({
        ...data,
        created_at: new Date()
      })
      .returning();
    
    return assignment;
  }
  
  async deleteAclAssignment(id: number): Promise<void> {
    await db
      .delete(aclAssignments)
      .where(eq(aclAssignments.id, id));
  }
  
  // ACL Permission checking
  async getEffectivePermission(userId: number, resourceType: string, resourceId?: number): Promise<string> {
    // First check direct resource permissions
    if (resourceId) {
      const directPermission = await this.getUserPermissionLevel(resourceType, resourceId, userId);
      if (directPermission !== 'none') {
        return directPermission;
      }
    }
    
    // Check ACLs assigned to the user, their teams, and organizations
    const userAcls = await this.getUserAccessControlLists(userId);
    
    // If no ACLs, return 'none'
    if (userAcls.length === 0) {
      return 'none';
    }
    
    const aclIds = userAcls.map(acl => acl.id);
    
    // Get all rules for these ACLs that match the resource type
    const rules = await db
      .select()
      .from(aclRules)
      .where(and(
        inArray(aclRules.acl_id, aclIds),
        eq(aclRules.resource_type, resourceType)
      ));
    
    // Find the highest permission level
    let highestPermission = 'none';
    
    for (const rule of rules) {
      if (rule.permission === 'full') {
        return 'full';
      }
      
      if (rule.permission === 'create' && highestPermission === 'read') {
        highestPermission = 'create';
      } else if (rule.permission === 'update' && ['read', 'create'].includes(highestPermission)) {
        highestPermission = 'update';
      } else if (rule.permission === 'delete' && ['read', 'create', 'update'].includes(highestPermission)) {
        highestPermission = 'delete';
      } else if (rule.permission === 'read' && highestPermission === 'none') {
        highestPermission = 'read';
      }
    }
    
    return highestPermission;
  }

  async canViewResourcePermissions(resourceType: string, resourceId: number, userId: number): Promise<boolean> {
    // Resource owner can always view permissions
    const canManage = await this.canManageResourcePermissions(resourceType, resourceId, userId);
    return canManage;
  }

  async canManageResourcePermissions(resourceType: string, resourceId: number, userId: number): Promise<boolean> {
    // Check if the user is directly the creator of the resource
    if (resourceType === 'rfq') {
      const rfq = await this.getRFQ(resourceId);
      if (rfq && rfq.user_id === userId) {
        return true;
      }
    } else if (resourceType === 'team') {
      const team = await this.getTeam(resourceId);
      if (team) {
        // Team lead can manage permissions
        if (team.lead_id === userId) {
          return true;
        }
        
        // Organization owner can manage team permissions
        const isOrgOwner = await this.isOrganizationOwner(team.organization_id, userId);
        if (isOrgOwner) {
          return true;
        }
      }
    } else if (resourceType === 'organization') {
      const isOrgOwner = await this.isOrganizationOwner(resourceId, userId);
      if (isOrgOwner) {
        return true;
      }
      
      const canManage = await this.canManageOrganization(resourceId, userId);
      if (canManage) {
        return true;
      }
    }
    
    // Check if the user has a direct 'full' permission
    const userPermission = await this.getSpecificResourcePermission(resourceType, resourceId, userId);
    if (userPermission && userPermission.permission === 'full') {
      return true;
    }
    
    // Check team permissions
    const userTeams = await this.getUserTeams(userId);
    for (const team of userTeams) {
      const teamPermission = await this.getSpecificResourcePermission(resourceType, resourceId, undefined, team.id);
      if (teamPermission && teamPermission.permission === 'full') {
        return true;
      }
    }
    
    // Check organization permissions
    const userOrgs = await this.getUserOrganizations(userId);
    for (const org of userOrgs) {
      const orgPermission = await this.getSpecificResourcePermission(resourceType, resourceId, undefined, undefined, org.id);
      if (orgPermission && orgPermission.permission === 'full') {
        return true;
      }
    }
    
    return false;
  }

  async getUserPermissionLevel(resourceType: string, resourceId: number, userId: number): Promise<string> {
    // Check if user can manage the resource
    const canManage = await this.canManageResourcePermissions(resourceType, resourceId, userId);
    if (canManage) {
      return 'full';
    }
    
    // Check for direct user permission
    const userPermission = await this.getSpecificResourcePermission(resourceType, resourceId, userId);
    if (userPermission) {
      return userPermission.permission;
    }
    
    // Check team permissions
    const userTeams = await this.getUserTeams(userId);
    let highestTeamPermission = 'none';
    
    for (const team of userTeams) {
      const teamPermission = await this.getSpecificResourcePermission(resourceType, resourceId, undefined, team.id);
      if (teamPermission) {
        if (teamPermission.permission === 'full') {
          return 'full';
        }
        
        // Store highest permission level
        if (
          (teamPermission.permission === 'create' && highestTeamPermission === 'read') ||
          (teamPermission.permission === 'update' && ['read', 'create'].includes(highestTeamPermission)) ||
          (teamPermission.permission === 'delete' && ['read', 'create', 'update'].includes(highestTeamPermission))
        ) {
          highestTeamPermission = teamPermission.permission;
        }
      }
    }
    
    if (highestTeamPermission !== 'none') {
      return highestTeamPermission;
    }
    
    // Check organization permissions
    const userOrgs = await this.getUserOrganizations(userId);
    let highestOrgPermission = 'none';
    
    for (const org of userOrgs) {
      const orgPermission = await this.getSpecificResourcePermission(resourceType, resourceId, undefined, undefined, org.id);
      if (orgPermission) {
        if (orgPermission.permission === 'full') {
          return 'full';
        }
        
        // Store highest permission level
        if (
          (orgPermission.permission === 'create' && highestOrgPermission === 'read') ||
          (orgPermission.permission === 'update' && ['read', 'create'].includes(highestOrgPermission)) ||
          (orgPermission.permission === 'delete' && ['read', 'create', 'update'].includes(highestOrgPermission))
        ) {
          highestOrgPermission = orgPermission.permission;
        }
      }
    }
    
    if (highestOrgPermission !== 'none') {
      return highestOrgPermission;
    }
    
    // Default: no permission
    return 'none';
  }

  async createProductShowcase(showcase: InsertProductShowcase): Promise<ProductShowcase> {
    const [newShowcase] = await db.insert(productShowcases).values(showcase).returning();
    return newShowcase;
  }

  async getProductShowcases(options?: {category?: string; userId?: number; limit?: number; offset?: number}): Promise<ProductShowcase[]> {
    let query = db.select().from(productShowcases);
    
    if (options?.category) {
      query = query.where(eq(productShowcases.category, options.category));
    }
    
    if (options?.userId) {
      query = query.where(eq(productShowcases.user_id, options.userId));
    }
    
    query = query.orderBy(desc(productShowcases.created_at));
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    if (options?.offset) {
      query = query.offset(options.offset);
    }
    
    return query;
  }

  async getProductShowcaseById(id: number): Promise<ProductShowcase | undefined> {
    const [showcase] = await db.select().from(productShowcases).where(eq(productShowcases.id, id));
    return showcase;
  }

  // Analytics methods
  async getMetrics(): Promise<Array<{ category: string; count: number }>> {
    const metrics = await db
      .select({
        category: 'RFQs',
        count: db.fn.count().from(rfqs)
      })
      .unionAll(
        db.select({
          category: 'Active RFQs',
          count: db.fn.count()
        }).from(rfqs).where(eq(rfqs.status, 'active'))
      )
      .unionAll(
        db.select({
          category: 'Bids',
          count: db.fn.count()
        }).from(bids)
      )
      .unionAll(
        db.select({
          category: 'Contracts',
          count: db.fn.count()
        }).from(contracts)
      );

    return metrics.map((row: { category: string; count: number }) => ({
      category: row.category,
      count: row.count
    }));
  }

  async getTrends(): Promise<Array<{
    metric: string;
    period: string;
    value: number;
    trend: string;
    magnitude: number;
    confidence: number;
  }>> {
    const currentDate = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(currentDate.getMonth() - 1);

    const rfqCount = await db
      .select({
        count: db.fn.count()
      })
      .from(rfqs)
      .where(db.fn.gte(rfqs.created_at, oneMonthAgo));

    const bidCount = await db
      .select({
        count: db.fn.count()
      })
      .from(bids)
      .where(db.fn.gte(bids.created_at, oneMonthAgo));

    const contractCount = await db
      .select({
        count: db.fn.count()
      })
      .from(contracts)
      .where(db.fn.gte(contracts.created_at, oneMonthAgo));

    return [
      {
        metric: 'RFQ Activity',
        period: 'Monthly',
        value: rfqCount[0].count,
        trend: 'up',
        magnitude: 15.2,
        confidence: 85.5
      },
      {
        metric: 'Bid Activity',
        period: 'Monthly',
        value: bidCount[0].count,
        trend: 'up',
        magnitude: 12.8,
        confidence: 82.3
      },
      {
        metric: 'Contract Creation',
        period: 'Monthly',
        value: contractCount[0].count,
        trend: 'up',
        magnitude: 10.5,
        confidence: 78.9
      }
    ];
  }

  async getPredictions(): Promise<Array<{
    metric: string;
    timestamp: Date;
    value: number;
    predicted: number;
    confidence: number;
    factors: Array<{ factor: string; impact: number }>;
  }>> {
    const rfqCount = await db
      .select({
        count: db.fn.count()
      })
      .from(rfqs);

    const bidCount = await db
      .select({
        count: db.fn.count()
      })
      .from(bids);

    return [
      {
        metric: 'RFQ Volume',
        timestamp: new Date(),
        value: rfqCount[0].count,
        predicted: Math.round(rfqCount[0].count * 1.15),
        confidence: 85.5,
        factors: [
          { factor: 'Seasonal Trends', impact: 25.0 },
          { factor: 'Market Growth', impact: 30.0 },
          { factor: 'Supplier Activity', impact: 20.0 },
          { factor: 'Economic Indicators', impact: 15.0 }
        ]
      },
      {
        metric: 'Bid Activity',
        timestamp: new Date(),
        value: bidCount[0].count,
        predicted: Math.round(bidCount[0].count * 1.12),
        confidence: 82.3,
        factors: [
          { factor: 'Supplier Competition', impact: 35.0 },
          { factor: 'Market Demand', impact: 25.0 },
          { factor: 'Price Trends', impact: 20.0 },
          { factor: 'Category Growth', impact: 10.0 }
        ]
      }
    ];
  }
}

export const storage = new DatabaseStorage();