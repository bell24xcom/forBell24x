export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Suspense } from 'react';

async function SuppliersList() {
  // Fetch unclaimed suppliers
  let suppliers = [];
  try {
    suppliers = await prisma.scrapedCompany.findMany({
      where: {
        claimStatus: 'UNCLAIMED',
      },
      select: {
        id: true,
        name: true,
        category: true,
        city: true,
        state: true,
        trustScore: true,
      },
      take: 50,
      orderBy: {
        trustScore: 'desc',
      },
    });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    // Return empty array on error
    suppliers = [];
  }

  return (
    <>
      {suppliers.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map((supplier) => (
            <Link
              key={supplier.id}
              href={`/suppliers/${supplier.id}`}
              className="bg-gray-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all hover:border-cyan-500/50"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2 text-cyan-300 hover:text-cyan-400 transition-colors">
                    {supplier.name}
                  </h2>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm font-mono bg-cyan-600/20 px-3 py-1 rounded text-cyan-300 border border-cyan-500/30">
                      {supplier.category || 'Business'}
                    </span>
                    <span className="text-sm bg-gray-800 text-gray-300 px-3 py-1 rounded border border-gray-700">
                      {supplier.city || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-300 text-lg">
                    {'★'.repeat(Math.min(5, Math.floor((supplier.trustScore || 0) / 20)))}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {(supplier.trustScore || 0) / 10}/5
                  </span>
                </div>
                <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                  Unclaimed
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-400">
                  Click to view profile and claim
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">
            No suppliers found. Check back later!
          </p>
        </div>
      )}
    </>
  );
}

export default async function SuppliersPage() {

  return (
    <div className="min-h-screen bg-[#0a1128] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-5xl font-black mb-4 text-cyan-400">
            Featured Suppliers
          </h1>
          <p className="text-xl text-gray-300">
            Discover verified suppliers ready to work with you
          </p>
        </div>

        <Suspense fallback={
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
            <p className="text-gray-400 text-lg mt-4">Loading suppliers...</p>
          </div>
        }>
          <SuppliersList />
        </Suspense>

        <div className="mt-12 text-center">
          <p className="text-gray-400">
            Verified suppliers are manually screened by BELL for quality, reliability, and compliance.
          </p>
        </div>
      </div>
    </div>
  );
}
