import { notFound } from 'next/navigation';
import SupplierProfileView from '@/components/suppliers/SupplierProfileView';
import { prisma } from '@/lib/prisma';

export default async function SupplierProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  try {
    const supplier = await prisma.scrapedCompany.findUnique({
      where: { id: params.slug },
      include: {
        claim: true,
      },
    });

    if (!supplier) {
      notFound();
    }

    const isClaimable = supplier.claimStatus === 'UNCLAIMED';

    // Transform supplier data to match component expectations
    const supplierData = {
      id: supplier.id,
      company_name: supplier.name,
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone,
      city: supplier.city,
      state: supplier.state,
      category: supplier.category,
      business_type: supplier.category,
      logo_url: null,
      is_verified: supplier.trustScore && supplier.trustScore > 80,
      establishment_year: null,
      business_description: null,
      employee_count: null,
      annual_turnover: null,
      gst_number: null,
      website: null,
      subcategories: [],
      products: [], // TODO: Fetch products from database
      claimStatus: supplier.claimStatus,
    };

    return (
      <SupplierProfileView
        supplier={supplierData}
        isClaimable={isClaimable}
      />
    );
  } catch (error) {
    console.error('Error fetching supplier:', error);
    notFound();
  }
}

