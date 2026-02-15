'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Phone, Mail, Globe, CheckCircle, Upload, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import ProductShowcaseGrid from './ProductShowcaseGrid';
import ClaimProfileModal from './ClaimProfileModal';
import { cn } from '@/lib/utils';

interface SupplierProfileViewProps {
  supplier: any;
  isClaimable: boolean;
}

export default function SupplierProfileView({ 
  supplier, 
  isClaimable 
}: SupplierProfileViewProps) {
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Check if user owns this profile (after claim)
  const isOwner = false; // TODO: Check from session/auth context

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section */}
      <div className="relative bg-white dark:bg-gray-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Company Logo */}
            <div className="relative">
              <div className="w-32 h-32 lg:w-40 lg:h-40 relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                {supplier.logo_url ? (
                  <Image
                    src={supplier.logo_url}
                    alt={supplier.company_name || supplier.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600">
                    <span className="text-white text-4xl font-bold">
                      {(supplier.company_name || supplier.name || 'C').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {isOwner && (
                  <button className="absolute bottom-2 right-2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-md hover:shadow-lg transition-shadow">
                    <Upload className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  </button>
                )}
              </div>
            </div>

            {/* Company Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    {supplier.company_name || supplier.name}
                    {supplier.is_verified && (
                      <CheckCircle className="h-7 w-7 text-cyan-500" />
                    )}
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                    {supplier.business_type || supplier.category} • {supplier.establishment_year && `Est. ${supplier.establishment_year}`}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {isClaimable && (
                    <Button
                      onClick={() => setShowClaimModal(true)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Claim This Profile
                    </Button>
                  )}
                  {isOwner && (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditMode(!isEditMode)}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge variant="secondary" className="text-sm">
                  {supplier.category || supplier.category?.name || 'Business'}
                </Badge>
                {supplier.subcategories?.map((sub: string) => (
                  <Badge key={sub} variant="outline" className="text-sm">
                    {sub}
                  </Badge>
                ))}
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <MapPin className="h-5 w-5 flex-shrink-0" />
                  <span>{supplier.city || 'N/A'}, {supplier.state || 'N/A'}</span>
                </div>
                {supplier.phone && (
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Phone className="h-5 w-5 flex-shrink-0" />
                    <span>{supplier.phone}</span>
                  </div>
                )}
                {supplier.email && (
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Mail className="h-5 w-5 flex-shrink-0" />
                    <span>{supplier.email}</span>
                  </div>
                )}
                {supplier.website && (
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Globe className="h-5 w-5 flex-shrink-0" />
                    <a 
                      href={supplier.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-cyan-600 dark:text-cyan-400 hover:underline"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      {supplier.business_description && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-6 bg-white dark:bg-gray-900">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About Us</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {supplier.business_description}
            </p>
          </Card>
        </div>
      )}

      {/* Product Showcase */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Products & Services
          </h2>
          {isOwner && (
            <Link href="/supplier/products/manage">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Add Products
              </Button>
            </Link>
          )}
        </div>
        
        <ProductShowcaseGrid 
          products={supplier.products || []} 
          supplierId={supplier.id}
          isOwner={isOwner}
          categoryPlaceholder={supplier.category || 'Product'}
        />
      </div>

      {/* Business Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-6 bg-white dark:bg-gray-900">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Business Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {supplier.employee_count && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Company Size</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">{supplier.employee_count} employees</p>
              </div>
            )}
            {supplier.annual_turnover && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Annual Turnover</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">{supplier.annual_turnover}</p>
              </div>
            )}
            {supplier.gst_number && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">GST Number</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">{supplier.gst_number}</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* SEO Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-6 bg-white dark:bg-gray-900">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Why Choose {supplier.company_name || supplier.name}?
          </h3>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>Leading {supplier.business_type || supplier.category} in {supplier.city || 'the region'}</li>
              <li>Specializing in {supplier.category || 'quality products'}</li>
              {supplier.establishment_year && (
                <li>{new Date().getFullYear() - parseInt(supplier.establishment_year)} years of industry experience</li>
              )}
              <li>Serving customers across {supplier.state || 'India'} and beyond</li>
            </ul>
          </div>
        </Card>
      </div>

      {/* Claim Profile Modal */}
      {showClaimModal && (
        <ClaimProfileModal
          supplier={supplier}
          isOpen={showClaimModal}
          onClose={() => setShowClaimModal(false)}
        />
      )}
    </div>
  );
}

