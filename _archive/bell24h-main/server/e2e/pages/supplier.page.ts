import { Page } from '@playwright/test';

export class SupplierPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async waitForLoad() {
    await this.page.getByRole('heading', { name: /suppliers/i }).waitFor();
  }

  async clickCreateSupplier() {
    await this.page.getByRole('button', { name: /create supplier/i }).click();
    await this.page.getByRole('heading', { name: /create supplier/i }).waitFor();
  }

  async fillSupplierForm(data: {
    name: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    };
    specialties: string[];
    rating?: number;
    status?: string;
  }) {
    await this.page.getByLabel('Name').fill(data.name);
    await this.page.getByLabel('Email').fill(data.email);
    await this.page.getByLabel('Phone').fill(data.phone);

    // Fill address
    await this.page.getByLabel('Street').fill(data.address.street);
    await this.page.getByLabel('City').fill(data.address.city);
    await this.page.getByLabel('State').fill(data.address.state);
    await this.page.getByLabel('Zip').fill(data.address.zip);
    await this.page.getByLabel('Country').fill(data.address.country);

    // Fill specialties
    for (const specialty of data.specialties) {
      await this.page.getByLabel('Specialties').selectOption(specialty);
    }

    if (data.rating) {
      await this.page.getByLabel('Rating').fill(data.rating.toString());
    }

    if (data.status) {
      await this.page.getByLabel('Status').selectOption(data.status);
    }
  }

  async submitSupplierForm() {
    await this.page.getByRole('button', { name: /submit/i }).click();
    await this.page.getByText('Supplier created successfully').waitFor();
  }

  async updateSupplier(id: string, updates: Partial<{
    name: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    };
    specialties: string[];
    rating?: number;
    status?: string;
  }>) {
    await this.page.goto(`/suppliers/${id}`);
    await this.page.getByRole('button', { name: /edit/i }).click();
    
    // Update fields that are present
    if (updates.name) await this.page.getByLabel('Name').fill(updates.name);
    if (updates.email) await this.page.getByLabel('Email').fill(updates.email);
    if (updates.phone) await this.page.getByLabel('Phone').fill(updates.phone);
    
    if (updates.address) {
      if (updates.address.street) await this.page.getByLabel('Street').fill(updates.address.street);
      if (updates.address.city) await this.page.getByLabel('City').fill(updates.address.city);
      if (updates.address.state) await this.page.getByLabel('State').fill(updates.address.state);
      if (updates.address.zip) await this.page.getByLabel('Zip').fill(updates.address.zip);
      if (updates.address.country) await this.page.getByLabel('Country').fill(updates.address.country);
    }
    
    if (updates.specialties) {
      for (const specialty of updates.specialties) {
        await this.page.getByLabel('Specialties').selectOption(specialty);
      }
    }
    
    if (updates.rating) {
      await this.page.getByLabel('Rating').fill(updates.rating.toString());
    }
    
    if (updates.status) {
      await this.page.getByLabel('Status').selectOption(updates.status);
    }
    
    await this.page.getByRole('button', { name: /save/i }).click();
    await this.page.getByText('Supplier updated successfully').waitFor();
  }
}
