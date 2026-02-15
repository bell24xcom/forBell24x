import axios, { AxiosInstance } from 'axios';

export interface CRMContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company: string;
  position?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  tags: string[];
  source: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CRMOpportunity {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  probability: number;
  expectedCloseDate: Date;
  contactId: string;
  assignedTo?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CRMActivity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'task' | 'note';
  subject: string;
  description: string;
  contactId?: string;
  opportunityId?: string;
  assignedTo?: string;
  dueDate?: Date;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ERPProduct {
  id: string;
  name: string;
  sku: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  cost: number;
  stockQuantity: number;
  minStockLevel: number;
  supplierId?: string;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ERPOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  status: 'draft' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  orderDate: Date;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IntegrationConfig {
  provider: 'zoho' | 'salesforce' | 'hubspot' | 'pipedrive';
  apiKey: string;
  apiSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  baseUrl: string;
  isActive: boolean;
  syncSettings: {
    contacts: boolean;
    opportunities: boolean;
    activities: boolean;
    products: boolean;
    orders: boolean;
  };
}

class CRMIntegrationService {
  private integrations: Map<string, IntegrationConfig> = new Map();
  private axiosInstances: Map<string, AxiosInstance> = new Map();

  constructor() {
    this.initializeIntegrations();
  }

  // Integration Management
  async addIntegration(config: IntegrationConfig): Promise<void> {
    const integrationId = this.generateIntegrationId();
    this.integrations.set(integrationId, config);

    // Initialize API client
    const axiosInstance = axios.create({
      baseURL: config.baseUrl,
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    this.axiosInstances.set(integrationId, axiosInstance);

    // Test connection
    await this.testConnection(integrationId);
  }

  async removeIntegration(integrationId: string): Promise<void> {
    this.integrations.delete(integrationId);
    this.axiosInstances.delete(integrationId);
  }

  async testConnection(integrationId: string): Promise<boolean> {
    const config = this.integrations.get(integrationId);
    const axiosInstance = this.axiosInstances.get(integrationId);

    if (!config || !axiosInstance) {
      throw new Error('Integration not found');
    }

    try {
      switch (config.provider) {
        case 'zoho':
          await axiosInstance.get('/crm/v3/users');
          break;
        case 'salesforce':
          await axiosInstance.get('/services/data/v58.0/sobjects');
          break;
        case 'hubspot':
          await axiosInstance.get('/crm/v3/objects/contacts');
          break;
        case 'pipedrive':
          await axiosInstance.get('/v1/users/me');
          break;
      }
      return true;
    } catch (error) {
      console.error(`Connection test failed for ${config.provider}:`, error);
      return false;
    }
  }

  // Contact Management
  async syncContacts(integrationId: string): Promise<CRMContact[]> {
    const config = this.integrations.get(integrationId);
    const axiosInstance = this.axiosInstances.get(integrationId);

    if (!config || !axiosInstance) {
      throw new Error('Integration not found');
    }

    try {
      let contacts: CRMContact[] = [];

      switch (config.provider) {
        case 'zoho':
          contacts = await this.syncZohoContacts(axiosInstance);
          break;
        case 'salesforce':
          contacts = await this.syncSalesforceContacts(axiosInstance);
          break;
        case 'hubspot':
          contacts = await this.syncHubspotContacts(axiosInstance);
          break;
        case 'pipedrive':
          contacts = await this.syncPipedriveContacts(axiosInstance);
          break;
      }

      return contacts;
    } catch (error) {
      console.error(`Contact sync failed for ${config.provider}:`, error);
      throw error;
    }
  }

  async createContact(
    integrationId: string,
    contact: Omit<CRMContact, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CRMContact> {
    const config = this.integrations.get(integrationId);
    const axiosInstance = this.axiosInstances.get(integrationId);

    if (!config || !axiosInstance) {
      throw new Error('Integration not found');
    }

    try {
      let createdContact: CRMContact;

      switch (config.provider) {
        case 'zoho':
          createdContact = await this.createZohoContact(axiosInstance, contact);
          break;
        case 'salesforce':
          createdContact = await this.createSalesforceContact(axiosInstance, contact);
          break;
        case 'hubspot':
          createdContact = await this.createHubspotContact(axiosInstance, contact);
          break;
        case 'pipedrive':
          createdContact = await this.createPipedriveContact(axiosInstance, contact);
          break;
        default:
          throw new Error(`Unsupported provider: ${config.provider}`);
      }

      return createdContact;
    } catch (error) {
      console.error(`Contact creation failed for ${config.provider}:`, error);
      throw error;
    }
  }

  // Opportunity Management
  async syncOpportunities(integrationId: string): Promise<CRMOpportunity[]> {
    const config = this.integrations.get(integrationId);
    const axiosInstance = this.axiosInstances.get(integrationId);

    if (!config || !axiosInstance) {
      throw new Error('Integration not found');
    }

    try {
      let opportunities: CRMOpportunity[] = [];

      switch (config.provider) {
        case 'zoho':
          opportunities = await this.syncZohoOpportunities(axiosInstance);
          break;
        case 'salesforce':
          opportunities = await this.syncSalesforceOpportunities(axiosInstance);
          break;
        case 'hubspot':
          opportunities = await this.syncHubspotOpportunities(axiosInstance);
          break;
        case 'pipedrive':
          opportunities = await this.syncPipedriveDeals(axiosInstance);
          break;
      }

      return opportunities;
    } catch (error) {
      console.error(`Opportunity sync failed for ${config.provider}:`, error);
      throw error;
    }
  }

  async createOpportunity(
    integrationId: string,
    opportunity: Omit<CRMOpportunity, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CRMOpportunity> {
    const config = this.integrations.get(integrationId);
    const axiosInstance = this.axiosInstances.get(integrationId);

    if (!config || !axiosInstance) {
      throw new Error('Integration not found');
    }

    try {
      let createdOpportunity: CRMOpportunity;

      switch (config.provider) {
        case 'zoho':
          createdOpportunity = await this.createZohoOpportunity(axiosInstance, opportunity);
          break;
        case 'salesforce':
          createdOpportunity = await this.createSalesforceOpportunity(axiosInstance, opportunity);
          break;
        case 'hubspot':
          createdOpportunity = await this.createHubspotOpportunity(axiosInstance, opportunity);
          break;
        case 'pipedrive':
          createdOpportunity = await this.createPipedriveDeal(axiosInstance, opportunity);
          break;
        default:
          throw new Error(`Unsupported provider: ${config.provider}`);
      }

      return createdOpportunity;
    } catch (error) {
      console.error(`Opportunity creation failed for ${config.provider}:`, error);
      throw error;
    }
  }

  // Activity Management
  async syncActivities(integrationId: string): Promise<CRMActivity[]> {
    const config = this.integrations.get(integrationId);
    const axiosInstance = this.axiosInstances.get(integrationId);

    if (!config || !axiosInstance) {
      throw new Error('Integration not found');
    }

    try {
      let activities: CRMActivity[] = [];

      switch (config.provider) {
        case 'zoho':
          activities = await this.syncZohoActivities(axiosInstance);
          break;
        case 'salesforce':
          activities = await this.syncSalesforceActivities(axiosInstance);
          break;
        case 'hubspot':
          activities = await this.syncHubspotActivities(axiosInstance);
          break;
        case 'pipedrive':
          activities = await this.syncPipedriveActivities(axiosInstance);
          break;
      }

      return activities;
    } catch (error) {
      console.error(`Activity sync failed for ${config.provider}:`, error);
      throw error;
    }
  }

  // ERP Integration
  async syncProducts(integrationId: string): Promise<ERPProduct[]> {
    const config = this.integrations.get(integrationId);
    const axiosInstance = this.axiosInstances.get(integrationId);

    if (!config || !axiosInstance) {
      throw new Error('Integration not found');
    }

    try {
      let products: ERPProduct[] = [];

      switch (config.provider) {
        case 'zoho':
          products = await this.syncZohoProducts(axiosInstance);
          break;
        case 'salesforce':
          products = await this.syncSalesforceProducts(axiosInstance);
          break;
        default:
          throw new Error(`ERP integration not supported for ${config.provider}`);
      }

      return products;
    } catch (error) {
      console.error(`Product sync failed for ${config.provider}:`, error);
      throw error;
    }
  }

  async syncOrders(integrationId: string): Promise<ERPOrder[]> {
    const config = this.integrations.get(integrationId);
    const axiosInstance = this.axiosInstances.get(integrationId);

    if (!config || !axiosInstance) {
      throw new Error('Integration not found');
    }

    try {
      let orders: ERPOrder[] = [];

      switch (config.provider) {
        case 'zoho':
          orders = await this.syncZohoOrders(axiosInstance);
          break;
        case 'salesforce':
          orders = await this.syncSalesforceOrders(axiosInstance);
          break;
        default:
          throw new Error(`ERP integration not supported for ${config.provider}`);
      }

      return orders;
    } catch (error) {
      console.error(`Order sync failed for ${config.provider}:`, error);
      throw error;
    }
  }

  // Zoho CRM Integration
  private async syncZohoContacts(axiosInstance: AxiosInstance): Promise<CRMContact[]> {
    const response = await axiosInstance.get('/crm/v3/contacts');
    return response.data.data.map((contact: any) => ({
      id: contact.id,
      firstName: contact.first_name || '',
      lastName: contact.last_name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      company: contact.company_name || '',
      position: contact.title || '',
      address: contact.mailing_address
        ? {
            street: contact.mailing_address.street || '',
            city: contact.mailing_address.city || '',
            state: contact.mailing_address.state || '',
            country: contact.mailing_address.country || '',
            zipCode: contact.mailing_address.zip_code || '',
          }
        : undefined,
      tags: contact.tag_list || [],
      source: contact.source || 'zoho',
      createdAt: new Date(contact.created_time),
      updatedAt: new Date(contact.modified_time),
    }));
  }

  private async createZohoContact(
    axiosInstance: AxiosInstance,
    contact: Omit<CRMContact, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CRMContact> {
    const payload = {
      data: [
        {
          first_name: contact.firstName,
          last_name: contact.lastName,
          email: contact.email,
          phone: contact.phone,
          company_name: contact.company,
          title: contact.position,
          mailing_address: contact.address
            ? {
                street: contact.address.street,
                city: contact.address.city,
                state: contact.address.state,
                country: contact.address.country,
                zip_code: contact.address.zipCode,
              }
            : undefined,
          tag_list: contact.tags,
        },
      ],
    };

    const response = await axiosInstance.post('/crm/v3/contacts', payload);
    const createdContact = response.data.data[0];

    return {
      id: createdContact.details.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
      position: contact.position,
      address: contact.address,
      tags: contact.tags,
      source: 'zoho',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private async syncZohoOpportunities(axiosInstance: AxiosInstance): Promise<CRMOpportunity[]> {
    const response = await axiosInstance.get('/crm/v3/deals');
    return response.data.data.map((deal: any) => ({
      id: deal.id,
      title: deal.deal_name || '',
      description: deal.description || '',
      amount: deal.amount || 0,
      currency: deal.currency || 'USD',
      stage: this.mapZohoStage(deal.stage),
      probability: deal.probability || 0,
      expectedCloseDate: new Date(deal.closing_date),
      contactId: deal.contact_id || '',
      assignedTo: deal.owner?.id,
      tags: deal.tag_list || [],
      createdAt: new Date(deal.created_time),
      updatedAt: new Date(deal.modified_time),
    }));
  }

  private async createZohoOpportunity(
    axiosInstance: AxiosInstance,
    opportunity: Omit<CRMOpportunity, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CRMOpportunity> {
    const payload = {
      data: [
        {
          deal_name: opportunity.title,
          description: opportunity.description,
          amount: opportunity.amount,
          currency: opportunity.currency,
          stage: this.mapStageToZoho(opportunity.stage),
          probability: opportunity.probability,
          closing_date: opportunity.expectedCloseDate.toISOString(),
          contact_id: opportunity.contactId,
          tag_list: opportunity.tags,
        },
      ],
    };

    const response = await axiosInstance.post('/crm/v3/deals', payload);
    const createdDeal = response.data.data[0];

    return {
      id: createdDeal.details.id,
      title: opportunity.title,
      description: opportunity.description,
      amount: opportunity.amount,
      currency: opportunity.currency,
      stage: opportunity.stage,
      probability: opportunity.probability,
      expectedCloseDate: opportunity.expectedCloseDate,
      contactId: opportunity.contactId,
      assignedTo: opportunity.assignedTo,
      tags: opportunity.tags,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private async syncZohoActivities(axiosInstance: AxiosInstance): Promise<CRMActivity[]> {
    const response = await axiosInstance.get('/crm/v3/tasks');
    return response.data.data.map((task: any) => ({
      id: task.id,
      type: this.mapZohoActivityType(task.task_type),
      subject: task.subject || '',
      description: task.description || '',
      contactId: task.who_id || '',
      opportunityId: task.what_id || '',
      assignedTo: task.owner?.id,
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
      completed: task.status === 'Completed',
      createdAt: new Date(task.created_time),
      updatedAt: new Date(task.modified_time),
    }));
  }

  private async syncZohoProducts(axiosInstance: AxiosInstance): Promise<ERPProduct[]> {
    const response = await axiosInstance.get('/crm/v3/products');
    return response.data.data.map((product: any) => ({
      id: product.id,
      name: product.name || '',
      sku: product.product_code || '',
      description: product.description || '',
      category: product.product_category || '',
      price: product.unit_price || 0,
      currency: product.currency || 'USD',
      cost: product.cost || 0,
      stockQuantity: product.quantity_in_stock || 0,
      minStockLevel: product.reorder_level || 0,
      supplierId: product.vendor_id,
      tags: product.tag_list || [],
      isActive: product.active,
      createdAt: new Date(product.created_time),
      updatedAt: new Date(product.modified_time),
    }));
  }

  private async syncZohoOrders(axiosInstance: AxiosInstance): Promise<ERPOrder[]> {
    const response = await axiosInstance.get('/crm/v3/sales_orders');
    return response.data.data.map((order: any) => ({
      id: order.id,
      orderNumber: order.order_number || '',
      customerId: order.account_id || '',
      status: this.mapZohoOrderStatus(order.status),
      items:
        order.product_details?.map((item: any) => ({
          productId: item.product_id,
          quantity: item.quantity || 0,
          unitPrice: item.unit_price || 0,
          totalPrice: item.total || 0,
        })) || [],
      subtotal: order.sub_total || 0,
      tax: order.tax || 0,
      shipping: order.shipping_charges || 0,
      total: order.grand_total || 0,
      currency: order.currency || 'USD',
      orderDate: new Date(order.order_date),
      expectedDeliveryDate: order.delivery_date ? new Date(order.delivery_date) : undefined,
      actualDeliveryDate: order.delivery_date ? new Date(order.delivery_date) : undefined,
      notes: order.description,
      createdAt: new Date(order.created_time),
      updatedAt: new Date(order.modified_time),
    }));
  }

  // Salesforce Integration
  private async syncSalesforceContacts(axiosInstance: AxiosInstance): Promise<CRMContact[]> {
    const response = await axiosInstance.get(
      '/services/data/v58.0/query?q=SELECT+Id,FirstName,LastName,Email,Phone,Company,Title,MailingAddress+FROM+Contact'
    );
    return response.data.records.map((contact: any) => ({
      id: contact.Id,
      firstName: contact.FirstName || '',
      lastName: contact.LastName || '',
      email: contact.Email || '',
      phone: contact.Phone || '',
      company: contact.Company || '',
      position: contact.Title || '',
      address: contact.MailingAddress
        ? {
            street: contact.MailingAddress.street || '',
            city: contact.MailingAddress.city || '',
            state: contact.MailingAddress.state || '',
            country: contact.MailingAddress.country || '',
            zipCode: contact.MailingAddress.postalCode || '',
          }
        : undefined,
      tags: [],
      source: 'salesforce',
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }

  private async createSalesforceContact(
    axiosInstance: AxiosInstance,
    contact: Omit<CRMContact, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CRMContact> {
    const payload = {
      FirstName: contact.firstName,
      LastName: contact.lastName,
      Email: contact.email,
      Phone: contact.phone,
      Company: contact.company,
      Title: contact.position,
      MailingStreet: contact.address?.street,
      MailingCity: contact.address?.city,
      MailingState: contact.address?.state,
      MailingCountry: contact.address?.country,
      MailingPostalCode: contact.address?.zipCode,
    };

    const response = await axiosInstance.post('/services/data/v58.0/sobjects/Contact', payload);

    return {
      id: response.data.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
      position: contact.position,
      address: contact.address,
      tags: contact.tags,
      source: 'salesforce',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private async syncSalesforceOpportunities(
    axiosInstance: AxiosInstance
  ): Promise<CRMOpportunity[]> {
    const response = await axiosInstance.get(
      '/services/data/v58.0/query?q=SELECT+Id,Name,Description,Amount,CurrencyIsoCode,StageName,Probability,CloseDate,ContactId,OwnerId+FROM+Opportunity'
    );
    return response.data.records.map((opp: any) => ({
      id: opp.Id,
      title: opp.Name || '',
      description: opp.Description || '',
      amount: opp.Amount || 0,
      currency: opp.CurrencyIsoCode || 'USD',
      stage: this.mapSalesforceStage(opp.StageName),
      probability: opp.Probability || 0,
      expectedCloseDate: new Date(opp.CloseDate),
      contactId: opp.ContactId || '',
      assignedTo: opp.OwnerId,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }

  private async createSalesforceOpportunity(
    axiosInstance: AxiosInstance,
    opportunity: Omit<CRMOpportunity, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CRMOpportunity> {
    const payload = {
      Name: opportunity.title,
      Description: opportunity.description,
      Amount: opportunity.amount,
      CurrencyIsoCode: opportunity.currency,
      StageName: this.mapStageToSalesforce(opportunity.stage),
      Probability: opportunity.probability,
      CloseDate: opportunity.expectedCloseDate.toISOString().split('T')[0],
      ContactId: opportunity.contactId,
    };

    const response = await axiosInstance.post('/services/data/v58.0/sobjects/Opportunity', payload);

    return {
      id: response.data.id,
      title: opportunity.title,
      description: opportunity.description,
      amount: opportunity.amount,
      currency: opportunity.currency,
      stage: opportunity.stage,
      probability: opportunity.probability,
      expectedCloseDate: opportunity.expectedCloseDate,
      contactId: opportunity.contactId,
      assignedTo: opportunity.assignedTo,
      tags: opportunity.tags,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private async syncSalesforceActivities(axiosInstance: AxiosInstance): Promise<CRMActivity[]> {
    const response = await axiosInstance.get(
      '/services/data/v58.0/query?q=SELECT+Id,Subject,Description,WhoId,WhatId,OwnerId,DueDate,Status,Type+FROM+Task'
    );
    return response.data.records.map((task: any) => ({
      id: task.Id,
      type: this.mapSalesforceActivityType(task.Type),
      subject: task.Subject || '',
      description: task.Description || '',
      contactId: task.WhoId || '',
      opportunityId: task.WhatId || '',
      assignedTo: task.OwnerId,
      dueDate: task.DueDate ? new Date(task.DueDate) : undefined,
      completed: task.Status === 'Completed',
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }

  private async syncSalesforceProducts(axiosInstance: AxiosInstance): Promise<ERPProduct[]> {
    const response = await axiosInstance.get(
      '/services/data/v58.0/query?q=SELECT+Id,Name,ProductCode,Description,Family,UnitPrice,CurrencyIsoCode,QuantityUnitOfMeasure,IsActive+FROM+Product2'
    );
    return response.data.records.map((product: any) => ({
      id: product.Id,
      name: product.Name || '',
      sku: product.ProductCode || '',
      description: product.Description || '',
      category: product.Family || '',
      price: product.UnitPrice || 0,
      currency: product.CurrencyIsoCode || 'USD',
      cost: 0, // Not available in standard Product2 object
      stockQuantity: 0, // Would need custom field or separate query
      minStockLevel: 0,
      supplierId: undefined,
      tags: [],
      isActive: product.IsActive,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }

  private async syncSalesforceOrders(axiosInstance: AxiosInstance): Promise<ERPOrder[]> {
    const response = await axiosInstance.get(
      '/services/data/v58.0/query?q=SELECT+Id,OrderNumber,AccountId,Status,TotalAmount,CurrencyIsoCode,EffectiveDate+FROM+Order'
    );
    return response.data.records.map((order: any) => ({
      id: order.Id,
      orderNumber: order.OrderNumber || '',
      customerId: order.AccountId || '',
      status: this.mapSalesforceOrderStatus(order.Status),
      items: [], // Would need separate query for OrderItems
      subtotal: order.TotalAmount || 0,
      tax: 0,
      shipping: 0,
      total: order.TotalAmount || 0,
      currency: order.CurrencyIsoCode || 'USD',
      orderDate: new Date(order.EffectiveDate),
      expectedDeliveryDate: undefined,
      actualDeliveryDate: undefined,
      notes: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }

  // HubSpot Integration
  private async syncHubspotContacts(axiosInstance: AxiosInstance): Promise<CRMContact[]> {
    const response = await axiosInstance.get('/crm/v3/objects/contacts');
    return response.data.results.map((contact: any) => ({
      id: contact.id,
      firstName: contact.properties.firstname || '',
      lastName: contact.properties.lastname || '',
      email: contact.properties.email || '',
      phone: contact.properties.phone || '',
      company: contact.properties.company || '',
      position: contact.properties.jobtitle || '',
      address: {
        street: contact.properties.address || '',
        city: contact.properties.city || '',
        state: contact.properties.state || '',
        country: contact.properties.country || '',
        zipCode: contact.properties.zip || '',
      },
      tags: [],
      source: 'hubspot',
      createdAt: new Date(contact.createdAt),
      updatedAt: new Date(contact.updatedAt),
    }));
  }

  private async createHubspotContact(
    axiosInstance: AxiosInstance,
    contact: Omit<CRMContact, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CRMContact> {
    const payload = {
      properties: {
        firstname: contact.firstName,
        lastname: contact.lastName,
        email: contact.email,
        phone: contact.phone,
        company: contact.company,
        jobtitle: contact.position,
        address: contact.address?.street,
        city: contact.address?.city,
        state: contact.address?.state,
        country: contact.address?.country,
        zip: contact.address?.zipCode,
      },
    };

    const response = await axiosInstance.post('/crm/v3/objects/contacts', payload);

    return {
      id: response.data.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
      position: contact.position,
      address: contact.address,
      tags: contact.tags,
      source: 'hubspot',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private async syncHubspotOpportunities(axiosInstance: AxiosInstance): Promise<CRMOpportunity[]> {
    const response = await axiosInstance.get('/crm/v3/objects/deals');
    return response.data.results.map((deal: any) => ({
      id: deal.id,
      title: deal.properties.dealname || '',
      description: deal.properties.description || '',
      amount: parseFloat(deal.properties.amount) || 0,
      currency: deal.properties.currency || 'USD',
      stage: this.mapHubspotStage(deal.properties.dealstage),
      probability: parseFloat(deal.properties.hs_probability) || 0,
      expectedCloseDate: new Date(deal.properties.closedate),
      contactId: deal.properties.associatedcontactids || '',
      assignedTo: deal.properties.hs_owner_id,
      tags: [],
      createdAt: new Date(deal.createdAt),
      updatedAt: new Date(deal.updatedAt),
    }));
  }

  private async createHubspotOpportunity(
    axiosInstance: AxiosInstance,
    opportunity: Omit<CRMOpportunity, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CRMOpportunity> {
    const payload = {
      properties: {
        dealname: opportunity.title,
        description: opportunity.description,
        amount: opportunity.amount.toString(),
        currency: opportunity.currency,
        dealstage: this.mapStageToHubspot(opportunity.stage),
        hs_probability: opportunity.probability.toString(),
        closedate: opportunity.expectedCloseDate.toISOString(),
        associatedcontactids: opportunity.contactId,
      },
    };

    const response = await axiosInstance.post('/crm/v3/objects/deals', payload);

    return {
      id: response.data.id,
      title: opportunity.title,
      description: opportunity.description,
      amount: opportunity.amount,
      currency: opportunity.currency,
      stage: opportunity.stage,
      probability: opportunity.probability,
      expectedCloseDate: opportunity.expectedCloseDate,
      contactId: opportunity.contactId,
      assignedTo: opportunity.assignedTo,
      tags: opportunity.tags,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private async syncHubspotActivities(axiosInstance: AxiosInstance): Promise<CRMActivity[]> {
    const response = await axiosInstance.get('/crm/v3/objects/tasks');
    return response.data.results.map((task: any) => ({
      id: task.id,
      type: this.mapHubspotActivityType(task.properties.hs_timestamp),
      subject: task.properties.subject || '',
      description: task.properties.hs_task_body || '',
      contactId: task.properties.hs_contact_ids || '',
      opportunityId: task.properties.hs_deal_ids || '',
      assignedTo: task.properties.hs_owner_id,
      dueDate: task.properties.hs_timestamp ? new Date(task.properties.hs_timestamp) : undefined,
      completed: task.properties.hs_task_completion_date !== null,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
    }));
  }

  // Pipedrive Integration
  private async syncPipedriveContacts(axiosInstance: AxiosInstance): Promise<CRMContact[]> {
    const response = await axiosInstance.get('/v1/persons');
    return response.data.data.map((person: any) => ({
      id: person.id.toString(),
      firstName: person.first_name || '',
      lastName: person.last_name || '',
      email: person.email?.[0]?.value || '',
      phone: person.phone?.[0]?.value || '',
      company: person.org_name || '',
      position: person.title || '',
      address: person.address
        ? {
            street: person.address || '',
            city: '',
            state: '',
            country: '',
            zipCode: '',
          }
        : undefined,
      tags: person.tags || [],
      source: 'pipedrive',
      createdAt: new Date(person.add_time),
      updatedAt: new Date(person.update_time),
    }));
  }

  private async createPipedriveContact(
    axiosInstance: AxiosInstance,
    contact: Omit<CRMContact, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CRMContact> {
    const payload = {
      name: `${contact.firstName} ${contact.lastName}`,
      first_name: contact.firstName,
      last_name: contact.lastName,
      email: [{ value: contact.email, primary: true }],
      phone: contact.phone ? [{ value: contact.phone, primary: true }] : [],
      org_name: contact.company,
      title: contact.position,
    };

    const response = await axiosInstance.post('/v1/persons', payload);

    return {
      id: response.data.data.id.toString(),
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
      position: contact.position,
      address: contact.address,
      tags: contact.tags,
      source: 'pipedrive',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private async syncPipedriveDeals(axiosInstance: AxiosInstance): Promise<CRMOpportunity[]> {
    const response = await axiosInstance.get('/v1/deals');
    return response.data.data.map((deal: any) => ({
      id: deal.id.toString(),
      title: deal.title || '',
      description: deal.description || '',
      amount: deal.value || 0,
      currency: deal.currency || 'USD',
      stage: this.mapPipedriveStage(deal.stage_id),
      probability: deal.probability || 0,
      expectedCloseDate: new Date(deal.close_time),
      contactId: deal.person_id?.toString() || '',
      assignedTo: deal.user_id?.toString(),
      tags: deal.tags || [],
      createdAt: new Date(deal.add_time),
      updatedAt: new Date(deal.update_time),
    }));
  }

  private async createPipedriveDeal(
    axiosInstance: AxiosInstance,
    opportunity: Omit<CRMOpportunity, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CRMOpportunity> {
    const payload = {
      title: opportunity.title,
      value: opportunity.amount,
      currency: opportunity.currency,
      person_id: parseInt(opportunity.contactId),
      close_time: opportunity.expectedCloseDate.toISOString(),
    };

    const response = await axiosInstance.post('/v1/deals', payload);

    return {
      id: response.data.data.id.toString(),
      title: opportunity.title,
      description: opportunity.description,
      amount: opportunity.amount,
      currency: opportunity.currency,
      stage: opportunity.stage,
      probability: opportunity.probability,
      expectedCloseDate: opportunity.expectedCloseDate,
      contactId: opportunity.contactId,
      assignedTo: opportunity.assignedTo,
      tags: opportunity.tags,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private async syncPipedriveActivities(axiosInstance: AxiosInstance): Promise<CRMActivity[]> {
    const response = await axiosInstance.get('/v1/activities');
    return response.data.data.map((activity: any) => ({
      id: activity.id.toString(),
      type: this.mapPipedriveActivityType(activity.type),
      subject: activity.subject || '',
      description: activity.note || '',
      contactId: activity.person_id?.toString() || '',
      opportunityId: activity.deal_id?.toString() || '',
      assignedTo: activity.user_id?.toString(),
      dueDate: activity.due_time ? new Date(activity.due_time) : undefined,
      completed: activity.done,
      createdAt: new Date(activity.add_time),
      updatedAt: new Date(activity.update_time),
    }));
  }

  // Mapping Functions
  private mapZohoStage(stage: string): CRMOpportunity['stage'] {
    const stageMap: Record<string, CRMOpportunity['stage']> = {
      Qualification: 'qualified',
      Proposal: 'proposal',
      Negotiation: 'negotiation',
      'Closed Won': 'closed-won',
      'Closed Lost': 'closed-lost',
    };
    return stageMap[stage] || 'lead';
  }

  private mapStageToZoho(stage: CRMOpportunity['stage']): string {
    const stageMap: Record<CRMOpportunity['stage'], string> = {
      lead: 'Qualification',
      qualified: 'Qualification',
      proposal: 'Proposal',
      negotiation: 'Negotiation',
      'closed-won': 'Closed Won',
      'closed-lost': 'Closed Lost',
    };
    return stageMap[stage];
  }

  private mapZohoActivityType(type: string): CRMActivity['type'] {
    const typeMap: Record<string, CRMActivity['type']> = {
      Call: 'call',
      Email: 'email',
      Meeting: 'meeting',
      Task: 'task',
    };
    return typeMap[type] || 'task';
  }

  private mapZohoOrderStatus(status: string): ERPOrder['status'] {
    const statusMap: Record<string, ERPOrder['status']> = {
      Draft: 'draft',
      Confirmed: 'confirmed',
      Processing: 'processing',
      Shipped: 'shipped',
      Delivered: 'delivered',
      Cancelled: 'cancelled',
    };
    return statusMap[status] || 'draft';
  }

  private mapSalesforceStage(stage: string): CRMOpportunity['stage'] {
    const stageMap: Record<string, CRMOpportunity['stage']> = {
      Prospecting: 'lead',
      Qualification: 'qualified',
      Proposal: 'proposal',
      Negotiation: 'negotiation',
      'Closed Won': 'closed-won',
      'Closed Lost': 'closed-lost',
    };
    return stageMap[stage] || 'lead';
  }

  private mapStageToSalesforce(stage: CRMOpportunity['stage']): string {
    const stageMap: Record<CRMOpportunity['stage'], string> = {
      lead: 'Prospecting',
      qualified: 'Qualification',
      proposal: 'Proposal',
      negotiation: 'Negotiation',
      'closed-won': 'Closed Won',
      'closed-lost': 'Closed Lost',
    };
    return stageMap[stage];
  }

  private mapSalesforceActivityType(type: string): CRMActivity['type'] {
    const typeMap: Record<string, CRMActivity['type']> = {
      Call: 'call',
      Email: 'email',
      Meeting: 'meeting',
      Task: 'task',
    };
    return typeMap[type] || 'task';
  }

  private mapSalesforceOrderStatus(status: string): ERPOrder['status'] {
    const statusMap: Record<string, ERPOrder['status']> = {
      Draft: 'draft',
      Activated: 'confirmed',
      Processing: 'processing',
      Shipped: 'shipped',
      Delivered: 'delivered',
      Cancelled: 'cancelled',
    };
    return statusMap[status] || 'draft';
  }

  private mapHubspotStage(stage: string): CRMOpportunity['stage'] {
    const stageMap: Record<string, CRMOpportunity['stage']> = {
      appointmentscheduled: 'qualified',
      qualifiedtobuy: 'qualified',
      presentationscheduled: 'proposal',
      contractsent: 'negotiation',
      closedwon: 'closed-won',
      closedlost: 'closed-lost',
    };
    return stageMap[stage] || 'lead';
  }

  private mapStageToHubspot(stage: CRMOpportunity['stage']): string {
    const stageMap: Record<CRMOpportunity['stage'], string> = {
      lead: 'appointmentscheduled',
      qualified: 'qualifiedtobuy',
      proposal: 'presentationscheduled',
      negotiation: 'contractsent',
      'closed-won': 'closedwon',
      'closed-lost': 'closedlost',
    };
    return stageMap[stage];
  }

  private mapHubspotActivityType(timestamp: string): CRMActivity['type'] {
    return 'task'; // HubSpot doesn't have distinct activity types in the same way
  }

  private mapPipedriveStage(stageId: number): CRMOpportunity['stage'] {
    // Pipedrive stages are custom per pipeline, so this is a simplified mapping
    const stageMap: Record<number, CRMOpportunity['stage']> = {
      1: 'lead',
      2: 'qualified',
      3: 'proposal',
      4: 'negotiation',
      5: 'closed-won',
      6: 'closed-lost',
    };
    return stageMap[stageId] || 'lead';
  }

  private mapPipedriveActivityType(type: string): CRMActivity['type'] {
    const typeMap: Record<string, CRMActivity['type']> = {
      call: 'call',
      email: 'email',
      meeting: 'meeting',
      task: 'task',
    };
    return typeMap[type] || 'task';
  }

  // Utility Methods
  private generateIntegrationId(): string {
    return `integration_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeIntegrations(): void {
    // Initialize with mock integrations for development
    const mockIntegrations: IntegrationConfig[] = [
      {
        provider: 'zoho',
        apiKey: process.env.ZOHO_API_KEY || 'mock_key',
        accessToken: process.env.ZOHO_ACCESS_TOKEN || 'mock_token',
        baseUrl: 'https://www.zohoapis.com',
        isActive: true,
        syncSettings: {
          contacts: true,
          opportunities: true,
          activities: true,
          products: true,
          orders: true,
        },
      },
      {
        provider: 'salesforce',
        apiKey: process.env.SALESFORCE_API_KEY || 'mock_key',
        accessToken: process.env.SALESFORCE_ACCESS_TOKEN || 'mock_token',
        baseUrl: 'https://your-instance.salesforce.com',
        isActive: true,
        syncSettings: {
          contacts: true,
          opportunities: true,
          activities: true,
          products: true,
          orders: true,
        },
      },
    ];

    mockIntegrations.forEach(config => {
      this.addIntegration(config);
    });
  }
}

export const crmIntegrationService = new CRMIntegrationService();
